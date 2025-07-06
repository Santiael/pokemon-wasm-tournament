type PokemonStats = {
  base_stat: number,
  effort : number,
  stat : {
    name : "hp" | "attack" | "defense" | "special-attack" | "special-defense" | "speed",
    url : string
  }
}

type Pokemon = {
  id: number;
  name: string;
  stats: Array<PokemonStats>;
}

export function calculatePokemonPower(pokemon: Pokemon): number;
export function calculatePokemonStamina(pokemon: Pokemon): number;
export function isPokemonStrongerThan(chosenPokemon: Pokemon, rivalPokemon: Pokemon): boolean;
