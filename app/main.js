import {
  calculatePokemonPower,
  calculatePokemonStamina,
} from "transform-data-js";

import { getPokeApiModule, pokeApiModulesUrl } from "./api.js";

async function App() {
  const pokemons = await getPokeApiModule(pokeApiModulesUrl.pokemon);
  const _first150Pokemons = pokemons.slice(0, 150);

  const sample = pokemons[478];
  const pokemonPower = calculatePokemonPower(sample);
  const pokemonStamina = calculatePokemonStamina(sample);

  console.table(sample.stats);
  console.log(pokemonPower, pokemonStamina);
}

App();
