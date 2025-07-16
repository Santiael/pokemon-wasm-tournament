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

type PokemonVictories = {
  name: string;
  score: number;
}

export function comparePokemons(pokemons: Pokemon[]): PokemonVictories[];
