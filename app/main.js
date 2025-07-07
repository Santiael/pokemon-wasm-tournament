import { comparePokemons } from "compare-pokemon-data-js";

import { getPokeApiModule, pokeApiModulesUrl } from "./api.js";

async function App() {
  const pokemons = await getPokeApiModule(pokeApiModulesUrl.pokemon);

  console.time("[js] comparePokemons");
  comparePokemons(pokemons);
  console.timeEnd("[js] comparePokemons");
}

App();
