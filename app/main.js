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

  console.time("[js] comparePokemons");
  comparePokemons(pokemons);
  console.timeEnd("[js] comparePokemons");

  console.time("[wasm] compare_pokemons");
  const pokemonsForWasm = pokemons.map(({ id, name, stats }) => {
    const pokemonStats = stats.map(({ base_stat, effort, stat }) => {
      const statObj = new Stat(stat.name, stat.url);
      return new PokemonStats(base_stat, effort, statObj);
    });
    return new Pokemon(id, name, pokemonStats);
  });

  compare_pokemons(pokemonsForWasm);
  console.timeEnd("[wasm] compare_pokemons");
}

App();
