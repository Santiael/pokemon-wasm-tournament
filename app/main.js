import { getPokeApiModule, pokeApiModulesUrl } from "./api.js";

async function App() {
  const pokemons = await getPokeApiModule(pokeApiModulesUrl.pokemon);
  const first150Pokemons = pokemons.slice(0, 150);

  console.table(first150Pokemons, ["id", "name"]);
}

App();
