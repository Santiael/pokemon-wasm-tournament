JUST_DIR:= source_dir()+"/cli/just"

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
  just build-wasm-tiny-go

[working-directory: 'modules/wasm/compare-pokemon-data-wasm-rust']
build-wasm-rust *FLAGS:
  #!/usr/bin/env sh
  source {{JUST_DIR}}/verify_flag.sh
  FLAGS={{FLAGS}}

  rm -rf dist

  if [ $(verifyFlag --debug) ]; then
      echo "[build-wasm-rust] building target debug"
      cargo build
      target_folder="debug"
  else
      echo "[build-wasm-rust] building target release"
      cargo build --release
      target_folder="release"
  fi

  wasm-bindgen --target nodejs --out-dir dist \
    "./target/wasm32-unknown-unknown/${target_folder}/compare_pokemon_data_wasm_rust.wasm"

  if [ ! $(verifyFlag --no-opt) ]; then
    echo "[build-wasm-rust] running wasm-opt"
    wasm-opt -O3 dist/compare_pokemon_data_wasm_rust_bg.wasm -o dist/compare_pokemon_data_wasm_rust_bg.wasm
  fi

[working-directory: 'modules/wasm/compare-pokemon-data-wasm-go']
build-wasm-go *FLAGS:
  #!/usr/bin/env sh
  source {{JUST_DIR}}/verify_flag.sh
  FLAGS={{FLAGS}}

  rm -rf dist

  echo "[build-wasm-go] building"
  GOOS=js GOARCH=wasm go build -o dist/main.wasm .
  cp -r package/* dist

  if [ ! $(verifyFlag --no-opt) ]; then
    echo "[build-wasm-go] running wasm-opt"
    wasm-opt --enable-bulk-memory-opt -O3 dist/main.wasm -o dist/main.wasm
  fi

[working-directory: 'modules/wasm/compare-pokemon-data-wasm-tiny-go']
build-wasm-tiny-go *FLAGS:
  #!/usr/bin/env sh
  source {{JUST_DIR}}/verify_flag.sh
  FLAGS={{FLAGS}}

  rm -rf dist

  echo "[build-wasm-tiny-go] building"
  GOOS=js GOARCH=wasm tinygo build -o dist/main.wasm ../compare-pokemon-data-wasm-go/main.go
  cp -r package/* dist

  if [ ! $(verifyFlag --no-opt) ]; then
    echo "[build-wasm-go] running wasm-opt"
    wasm-opt --enable-bulk-memory-opt -O3 dist/main.wasm -o dist/main.wasm
  fi
