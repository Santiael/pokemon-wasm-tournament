import { comparePokemons } from "compare-pokemon-data-js";
import {
  compare_pokemons,
  Pokemon,
  PokemonStats,
  Stat,
} from "compare-pokemon-data-wasm";

import { getPokeApiModule, pokeApiModulesUrl } from "./api.js";

async function App() {
  const pokemons = await getPokeApiModule(pokeApiModulesUrl.pokemon);

  const timesToRun = 100;
  const jsRuns = [];
  const wasmRuns = [];

  for (let i = 0; i < timesToRun; i++) {
    let startTime = Date.now();

    comparePokemons(pokemons);

    jsRuns.push(Date.now() - startTime);
  }

  for (let i = 0; i < timesToRun; i++) {
    let startTime = Date.now();

    const pokemonsForWasm = pokemons.map(({ id, name, stats }) => {
      const pokemonStats = stats.map(({ base_stat, effort, stat }) => {
        const statObj = new Stat(stat.name, stat.url);
        return new PokemonStats(base_stat, effort, statObj);
      });
      return new Pokemon(id, name, pokemonStats);
    });

    compare_pokemons(pokemonsForWasm);

    wasmRuns.push(Date.now() - startTime);
  }

  const jsResults = jsRuns.reduce((acc, cur) => acc + cur) / timesToRun;
  const wasmResults = wasmRuns.reduce((acc, cur) => acc + cur) / timesToRun;

  console.log("JS run average:", jsResults);
  console.log("Wasm run average:", wasmResults);
}

App();
