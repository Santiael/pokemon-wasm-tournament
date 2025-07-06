import { isPokemonStrongerThan } from "transform-data-js";

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

  const isPokemon1Stronger = isPokemonStrongerThan(pokemon1, pokemon2);

  console.log(`${pokemon1.name} vs ${pokemon2.name}`);

  if (isPokemon1Stronger) {
    console.log(pokemon1.name, "wins");
  } else {
    console.log(pokemon2.name, "wins");
  }
}

App();
