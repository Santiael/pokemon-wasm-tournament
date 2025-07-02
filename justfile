[private]
default:
  just --list --unsorted

run:
  node app/main.js

[working-directory: 'modules/wasm/transform-data-wasm']
build-transform-data-wasm:
  cargo build
  wasm-bindgen --target nodejs --out-dir build ./target/wasm32-unknown-unknown/debug/transform_data_wasm.wasm

