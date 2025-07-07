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

export function comparePokemons(pokemons: Pokemon[]): void;
