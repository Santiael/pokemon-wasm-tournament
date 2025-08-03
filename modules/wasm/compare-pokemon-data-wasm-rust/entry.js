const path = require('node:path');
const fs = require('node:fs');
const rust = require('./dist/compare_pokemon_data_wasm_rust');

const wasmFile = path.join(__dirname, 'dist', 'compare_pokemon_data_wasm_rust_bg.wasm');

rust.wasmSize = `${(fs.statSync(wasmFile).size / 1000).toFixed(0)}KB`;

module.exports = rust;
