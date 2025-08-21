import { comparePokemons } from "compare-pokemon-data-js";
import WasmRust from "compare-pokemon-data-wasm-rust";
import WasmGo from "compare-pokemon-data-wasm-go";
import WasmTinyGo from "compare-pokemon-data-wasm-tiny-go";

import { getPokeApiModule, pokeApiModulesUrl } from "./api.js";

function meassureTime(label, callback, timesToRun = 1) {
  const runs = [];

  console.time(`[${label}] Total run`);
  for (let i = 0; i < timesToRun; i++) {
    let startTime = Date.now();
    callback();
    runs.push(Date.now() - startTime);
  }
  console.timeEnd(`[${label}] Total run`);

  if (timesToRun > 1) {
    const avarageTime = runs.reduce((acc, cur) => acc + cur) / timesToRun;
    console.log(`[${label}] Average run:`, `${avarageTime}ms`);
  }
}

function divisor() {
  console.log(`--------------------`);
}

async function App() {
  const pokemons = await getPokeApiModule(pokeApiModulesUrl.pokemon);
  const timesToRun = 100;

  meassureTime(
    "JS",
    () => {
      comparePokemons(pokemons);
    },
    timesToRun
  );

  divisor(); // ***** Wasm Rust *****

  let WasmRustRunner;

  meassureTime("Preparing Data for Wasm Rust", () => {
    WasmRustRunner = new WasmRust.Runner(pokemons);
  });

  meassureTime(
    "Wasm - Rust",
    () => {
      WasmRustRunner.compare_pokemons();
    },
    timesToRun
  );

  WasmRustRunner?.free();

  divisor(); // ***** Wasm Go *****

  meassureTime("Preparing Data for Wasm Go", () => {
    WasmGo.allocPokemonsData(pokemons);
  });

  meassureTime(
    "Wasm - Go",
    () => {
      WasmGo.comparePokemons();
    },
    timesToRun
  );

  WasmGo.freePokemonsData();

  divisor(); // ***** Wasm Tiny Go *****

  meassureTime("Preparing Data for Wasm Tiny Go", () => {
    WasmTinyGo.allocPokemonsData(pokemons);
  });

  meassureTime(
    "Wasm - Tiny Go",
    () => {
      WasmTinyGo.comparePokemons(pokemons);
    },
    timesToRun
  );

  WasmTinyGo.freePokemonsData();
}

App();
