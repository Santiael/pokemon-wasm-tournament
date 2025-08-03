import fs from 'node:fs';
import path from 'node:path';
import "./vendors/wasm_exec.js";

const wasmFile = path.join(import.meta.dirname, "./main.wasm");
const wasmBuffer = await fs.promises.readFile(wasmFile);

const go = new global.Go();
const { instance } = await WebAssembly.instantiate(wasmBuffer, go.importObject);
go.run(instance);

global.wasm.wasmSize = `${((await fs.promises.stat(wasmFile)).size / 1000).toFixed(0)}KB`;

export default global.wasm;

delete global.Go;
delete global.wasm;
