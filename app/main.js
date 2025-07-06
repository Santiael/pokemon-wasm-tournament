import {
  calculatePokemonPower,
  calculatePokemonStamina,
} from "transform-data-js";

import { getPokeApiData, getPokeApiModule, pokeApiModulesUrl } from "./api.js";

async function App() {
  const pokemonSpeciesIndex = await getPokeApiData(
    pokeApiModulesUrl.pokemonSpecies
  );

  const totalSpecies = pokemonSpeciesIndex.count;

  const pokemons = await getPokeApiModule(pokeApiModulesUrl.pokemon, {
    sliceEnd: totalSpecies,
  });

  // descobrindo quantos dígitos tem o número de espécies de pokemons
  const totalSpeciesDigits = Math.floor(Math.log10(totalSpecies)) + 1;

  const pokemon1Index =
    Math.floor(Math.random() * Math.pow(10, totalSpeciesDigits)) % totalSpecies;
  const pokemon2Index =
    Math.floor(Math.random() * Math.pow(10, totalSpeciesDigits)) % totalSpecies;

  const pokemon1 = pokemons[pokemon1Index];
  const pokemon2 = pokemons[pokemon2Index];

  const pokemon1Power = calculatePokemonPower(pokemon1);
  const pokemon1Stamina = calculatePokemonStamina(pokemon1);

  const pokemon2Power = calculatePokemonPower(pokemon2);
  const pokemon2Stamina = calculatePokemonStamina(pokemon2);

  const pokemon1Points = pokemon1Stamina - pokemon2Power;
  const pokemon2Points = pokemon2Stamina - pokemon1Power;

  if (pokemon1Points > pokemon2Points) {
    console.log(pokemon1.name, "wins");
  } else {
    console.log(pokemon2.name, "wins");
  }

  console.group("pokemon1");
  console.log("name:", pokemon1.name);
  console.table(pokemon1.stats);
  console.log("power:", pokemon1Power);
  console.log("stamina:", pokemon1Stamina);
  console.groupEnd("pokemon1");

  console.group("pokemon2");
  console.log("name:", pokemon2.name);
  console.log("power:", pokemon2Power);
  console.log("stamina:", pokemon2Stamina);
  console.table(pokemon2.stats);
  console.groupEnd("pokemon2");
}

App();
