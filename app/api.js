import path from "path";
import { fileURLToPath } from "url";
import { readFile } from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pokeApiBaseDataPath = path.join(
  __dirname,
  "..",
  "vendors/poke-api-data/data"
);

export const pokeApiModulesUrl = {
  ability: "api/v2/ability",
  berry: "api/v2/berry",
  berryFirmness: "api/v2/berry-firmness",
  berryFlavor: "api/v2/berry-flavor",
  characteristic: "api/v2/characteristic",
  contestEffect: "api/v2/contest-effect",
  contestType: "api/v2/contest-type",
  eggGroup: "api/v2/egg-group",
  encounterCondition: "api/v2/encounter-condition",
  encounterConditionValue: "api/v2/encounter-condition-value",
  encounterMethod: "api/v2/encounter-method",
  evolutionChain: "api/v2/evolution-chain",
  evolutionTrigger: "api/v2/evolution-trigger",
  gender: "api/v2/gender",
  generation: "api/v2/generation",
  growthRate: "api/v2/growth-rate",
  item: "api/v2/item",
  itemAttribute: "api/v2/item-attribute",
  itemCategory: "api/v2/item-category",
  itemFlingEffect: "api/v2/item-fling-effect",
  itemPocket: "api/v2/item-pocket",
  language: "api/v2/language",
  location: "api/v2/location",
  locationArea: "api/v2/location-area",
  machine: "api/v2/machine",
  move: "api/v2/move",
  moveAilment: "api/v2/move-ailment",
  moveBattleStyle: "api/v2/move-battle-style",
  moveCategory: "api/v2/move-category",
  moveDamageClass: "api/v2/move-damage-class",
  moveLearnMethod: "api/v2/move-learn-method",
  moveTarget: "api/v2/move-target",
  nature: "api/v2/nature",
  palParkArea: "api/v2/pal-park-area",
  pokeathlonStat: "api/v2/pokeathlon-stat",
  pokedex: "api/v2/pokedex",
  pokemon: "api/v2/pokemon",
  pokemonColor: "api/v2/pokemon-color",
  pokemonForm: "api/v2/pokemon-form",
  pokemonHabitat: "api/v2/pokemon-habitat",
  pokemonShape: "api/v2/pokemon-shape",
  pokemonSpecies: "api/v2/pokemon-species",
  region: "api/v2/region",
  stat: "api/v2/stat",
  superContestEffect: "api/v2/super-contest-effect",
  type: "api/v2/type",
  version: "api/v2/version",
  versionGroup: "api/v2/version-group",
};

export async function getPokeApiData(url) {
  const fileUrl = path.join(pokeApiBaseDataPath, url, "index.json");
  const file = await readFile(fileUrl);
  return JSON.parse(file.toString());
}

export async function getPokeApiModule(
  moduleUrl,
  { sliceStart, sliceEnd } = {}
) {
  const moduleIndex = await getPokeApiData(moduleUrl);

  const filesPromises = moduleIndex.results
    .sort()
    .slice(sliceStart || 0, sliceEnd)
    .map(({ url }) => getPokeApiData(url));

  const results = await Promise.allSettled(filesPromises);

  return results
    .filter(({ status }) => status === "fulfilled")
    .map(({ value }) => value);
}
