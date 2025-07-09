[private]
@default:
  just --list --unsorted

setup:
  pnpm install
  just build-wasm --prod --opt

run:
  node app/main.js

[working-directory: 'modules/wasm/compare-pokemon-data-wasm']
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

  if [ $(verifyFlag --prod) ]; then
      echo "[build-wasm] building target release"
      cargo build --release
      target_folder="release"
  else
      echo "[build-wasm] building target debug"
      cargo build
      target_folder="debug"
  fi

  wasm-bindgen --target nodejs --out-dir build \
    "./target/wasm32-unknown-unknown/${target_folder}/compare_pokemon_data_wasm.wasm"

  if [ $(verifyFlag --opt) ]; then
    echo "[build-wasm] running wasm-opt"
    wasm-opt -O3 build/compare_pokemon_data_wasm_bg.wasm -o build/compare_pokemon_data_wasm_bg.wasm
  fi
