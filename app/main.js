import { comparePokemons } from "compare-pokemon-data-js";
import {
  compare_pokemons,
  Pokemon,
  PokemonStats,
  Stat,
} from "compare-pokemon-data-wasm";

import { getPokeApiModule, pokeApiModulesUrl } from "./api.js";

function meassureTime(label, callback, timesToRun) {
  const runs = [];
  const times = timesToRun || 10;
  console.time(`[${label}] Total run`);
  for (let i = 0; i < times; i++) {
    let startTime = Date.now();
    callback();
    runs.push(Date.now() - startTime);
  }
  console.timeEnd(`[${label}] Total run`);

  const avarageTime = runs.reduce((acc, cur) => acc + cur) / times;
  console.log(`[${label}] Average run:`, `${avarageTime}ms`);
}

async function App() {
  const pokemons = await getPokeApiModule(pokeApiModulesUrl.pokemon);

  meassureTime(
    "JS",
    () => {
      comparePokemons(pokemons);
    },
    100
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
    100
  );
}

App();
