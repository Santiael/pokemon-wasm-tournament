[private]
default:
  just --list --unsorted

run:
  node app/main.js

[working-directory: 'modules/wasm/compare-pokemon-data-wasm']
build-transform-data-wasm:
  rm -rf build
  cargo build --release
  wasm-bindgen --target nodejs --out-dir build ./target/wasm32-unknown-unknown/release/compare_pokemon_data_wasm.wasm
  wasm-opt -O3 build/compare_pokemon_data_wasm_bg.wasm -o build/compare_pokemon_data_wasm_bg.wasm

