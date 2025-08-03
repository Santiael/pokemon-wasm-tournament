import { comparePokemons } from "compare-pokemon-data-js";
import WasmRust from "compare-pokemon-data-wasm-rust";
import WasmGo from "compare-pokemon-data-wasm-go";
import * as WasmC from "compare-pokemon-data-wasm-c";

import { getPokeApiModule, pokeApiModulesUrl } from "./api.js";

function meassureTime(label, callback, timesToRun = 1, size) {
  const runs = [];

  console.log()
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
  if (size) console.log(`[${label}] File size: `, size);
  console.log()
}

async function App() {
  const pokemons = await getPokeApiModule(pokeApiModulesUrl.pokemon);
  const timesToRun = 10;

  console.log()
  console.log('Total Pokemons:', pokemons.length);
  console.log()

  const results = new Map();

  meassureTime(
    "JS",
    () => {
      const res = comparePokemons(pokemons)
      if (!results.has("JS")) results.set("JS", res[0]);
    },
    timesToRun
  );

  meassureTime(
    "Wasm - Rust",
    () => {
      const pokemonsForWasmRust = pokemons.map(({ id, name, stats }) => {
        const pokemonStats = stats.map(({ base_stat, effort, stat }) => {
          const statObj = new WasmRust.Stat(stat.name, stat.url);
          return new WasmRust.PokemonStats(base_stat, effort, statObj);
        });
        return new WasmRust.Pokemon(id, name, pokemonStats);
      });

      const res = WasmRust.compare_pokemons(pokemonsForWasmRust);
      if (!results.has("Wasm - Rust")) results.set("Wasm - Rust", { name: res[0].name, score: res[0].score });
    },
    timesToRun,
    WasmRust.wasmSize
  );

  meassureTime("Wasm - Rust (loop into wasm)", () => {
    const pokemonsForWasmRust = pokemons.map(({ id, name, stats }) => {
      const pokemonStats = stats.map(({ base_stat, effort, stat }) => {
        const statObj = new WasmRust.Stat(stat.name, stat.url);
        return new WasmRust.PokemonStats(base_stat, effort, statObj);
      });
      return new WasmRust.Pokemon(id, name, pokemonStats);
    });

    WasmRust.compare_pokemons_loop(pokemonsForWasmRust, timesToRun)
  });

  meassureTime(
    "Wasm - Go",
    () => {
      const res = WasmGo.comparePokemons(pokemons);
      if (!results.has("Wasm - Go")) results.set("Wasm - Go", res[0]);
    },
    timesToRun,
    WasmGo.wasmSize
  );

  meassureTime(
    "Wasm - C",
    () => {
      const res = WasmC.compare_pokemons(pokemons);
      if (!results.has("Wasm - C")) results.set("Wasm - C", res[0]);
    },
    timesToRun,
    WasmC.wasmSize
  );

  console.log();
  console.log("first result: ", results);
}

App();
