[private]
@default:
  just --list --unsorted

setup:
  pnpm install
  just build-wasm

run:
  node app/main.js

build-wasm:
  just build-wasm-rust
  just build-wasm-go
  just build-wasm-c

[working-directory: 'modules/wasm/compare-pokemon-data-wasm-rust']
build-wasm-rust:
  rm -rf dist

  echo "[build-wasm] building target release"
  cargo build --release

  wasm-bindgen --target nodejs --out-dir dist \
    "./target/wasm32-unknown-unknown/release/compare_pokemon_data_wasm_rust.wasm"

  echo "[build-wasm] running wasm-opt"
  wasm-opt -O3 dist/compare_pokemon_data_wasm_rust_bg.wasm -o dist/compare_pokemon_data_wasm_rust_bg.wasm

[working-directory: 'modules/wasm/compare-pokemon-data-wasm-rust']
build-wasm-rust-debug:
  rm -rf dist

  echo "[build-wasm] building target release"
  cargo build

  wasm-bindgen --target nodejs --out-dir dist \
    "./target/wasm32-unknown-unknown/debug/compare_pokemon_data_wasm_rust.wasm"

  echo "[build-wasm] running wasm-opt"
  wasm-opt -O3 dist/compare_pokemon_data_wasm_rust_bg.wasm -o dist/compare_pokemon_data_wasm_rust_bg.wasm

[working-directory: 'modules/wasm/compare-pokemon-data-wasm-go']
build-wasm-go:
  rm -rf dist

  GOOS=js GOARCH=wasm go build -o dist/main.wasm .
  cp -r package/* dist

[working-directory: 'modules/wasm/compare-pokemon-data-wasm-c']
build-wasm-c:
  docker pull emscripten/emsdk
  docker run --rm -v $(pwd):/src -u $(id -u):$(id -g) emscripten/emsdk \
    emcc ./src/main.c -o main.wasm -O3 -s EXPORTED_FUNCTIONS='["_malloc", "_free"]' -s STANDALONE_WASM --no-entry
