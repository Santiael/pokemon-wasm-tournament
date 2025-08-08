import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import "./vendors/wasm_exec.js";

const CURRENT_DIR = dirname(fileURLToPath(import.meta.url));
const wasmBuffer = await readFile(resolve(CURRENT_DIR, "./main.wasm"));

const go = new global.TinyGo();
const { instance } = await WebAssembly.instantiate(wasmBuffer, go.importObject);
go.run(instance);

export default global.wasm;

delete global.TinyGo;
delete global.wasm;
