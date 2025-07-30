import { comparePokemons } from "compare-pokemon-data-js";
import {
  compare_pokemons,
  compare_pokemons_loop,
  Pokemon,
  PokemonStats,
  Stat,
} from "compare-pokemon-data-wasm";

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

  meassureTime(
    "Wasm",
    () => {
      const pokemonsForWasm = pokemons.map(({ id, name, stats }) => {
        const pokemonStats = stats.map(({ base_stat, effort, stat }) => {
          const statObj = new Stat(stat.name, stat.url);
          return new PokemonStats(base_stat, effort, statObj);
        });
        return new Pokemon(id, name, pokemonStats);
      });

      compare_pokemons(pokemonsForWasm);
    },
    timesToRun
  );

  meassureTime("Wasm (loop into wasm)", () => {
    const pokemonsForWasm = pokemons.map(({ id, name, stats }) => {
      const pokemonStats = stats.map(({ base_stat, effort, stat }) => {
        const statObj = new Stat(stat.name, stat.url);
        return new PokemonStats(base_stat, effort, statObj);
      });
      return new Pokemon(id, name, pokemonStats);
    });

    compare_pokemons_loop(pokemonsForWasm, timesToRun);
  });
}

App();
