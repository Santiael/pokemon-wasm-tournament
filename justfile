[private]
@default:
  just --list --unsorted

setup:
  pnpm install
  just build-wasm

run:
  node app/main.js

[working-directory: 'modules/wasm/compare-pokemon-data-wasm-rust']
build-wasm *FLAGS:
  #!/usr/bin/env sh
  set -e

  verifyFlag() {
    for flag in {{FLAGS}}; do
      for allowed in $@; do
        if [ $flag == $1 ]; then
          echo true
          break
        fi
      done
    done
  }

  rm -rf build

  if [ $(verifyFlag --debug) ]; then
      echo "[build-wasm] building target debug"
      cargo build
      target_folder="debug"
  else
      echo "[build-wasm] building target release"
      cargo build --release
      target_folder="release"
  fi

  wasm-bindgen --target nodejs --out-dir build \
    "./target/wasm32-unknown-unknown/${target_folder}/compare_pokemon_data_wasm_rust.wasm"

  if [ ! $(verifyFlag --no-opt) ]; then
    echo "[build-wasm] running wasm-opt"
    wasm-opt -O3 build/compare_pokemon_data_wasm_rust_bg.wasm -o build/compare_pokemon_data_wasm_rust_bg.wasm
  fi
