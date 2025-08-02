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

[working-directory: 'modules/wasm/compare-pokemon-data-wasm-rust']
build-wasm-rust *FLAGS:
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

  rm -rf dist

  if [ $(verifyFlag --debug) ]; then
      echo "[build-wasm] building target debug"
      cargo build
      target_folder="debug"
  else
      echo "[build-wasm] building target release"
      cargo build --release
      target_folder="release"
  fi

  wasm-bindgen --target nodejs --out-dir dist \
    "./target/wasm32-unknown-unknown/${target_folder}/compare_pokemon_data_wasm_rust.wasm"

  if [ ! $(verifyFlag --no-opt) ]; then
    echo "[build-wasm] running wasm-opt"
    wasm-opt -O3 dist/compare_pokemon_data_wasm_rust_bg.wasm -o dist/compare_pokemon_data_wasm_rust_bg.wasm
  fi

  cp package/package.json dist


