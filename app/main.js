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
  const timesToRun = 1000;

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
    const pokemonsForWasmRust = pokemons.map(({ id, name, stats }) => {
      const pokemonStats = stats.map(({ base_stat, effort, stat }) => {
        const statObj = new WasmRust.Stat(stat.name, stat.url);
        return new WasmRust.PokemonStats(base_stat, effort, statObj);
      });
      return new WasmRust.Pokemon(id, name, pokemonStats);
    });

    WasmRustRunner = new WasmRust.Runner(pokemonsForWasmRust);
  });

  meassureTime(
    "Wasm - Rust",
    () => {
      WasmRustRunner.compare_pokemons();
    },
    timesToRun
  );

  divisor(); // ***** Wasm Go *****

  meassureTime("Preparing Data for Wasm Go", () => {
    WasmGo.preparePokemonsData(pokemons);
  });

  meassureTime(
    "Wasm - Go",
    () => {
      WasmGo.comparePokemons();
    },
    timesToRun
  );

  divisor(); // ***** Wasm Tiny Go *****

  meassureTime("Preparing Data for Wasm Tiny Go", () => {
    WasmTinyGo.preparePokemonsData(pokemons);
  });

  meassureTime(
    "Wasm - Tiny Go",
    () => {
      WasmTinyGo.comparePokemons(pokemons);
    },
    timesToRun
  );
}

App();
