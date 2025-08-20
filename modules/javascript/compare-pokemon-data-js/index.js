function sumPokemonStats(pokemon, statusNames = []) {
  return pokemon.stats
    .filter(({ stat }) => statusNames.includes(stat.name))
    .reduce((acc, cur) => acc + cur.base_stat, 0);
}

// power = (attack + special-attack) * (1 + speed/100)
function calculatePokemonPower(pokemon) {
  const totalAttack = sumPokemonStats(pokemon, ["attack", "special-attack"]);

  const speedStats = pokemon.stats.find(({ stat }) => stat.name === "speed");
  const speed = speedStats?.base_stat || 0;

  return totalAttack * (1 + speed / 100);
}

// stamina = hp + defense + special-defense
function calculatePokemonStamina(pokemon) {
  return sumPokemonStats(pokemon, ["hp", "defense", "special-defense"]);
}

function calculatePokemonStrength(pokemon) {
  return {
    name: pokemon.name,
    power: calculatePokemonPower(pokemon),
    stamina: calculatePokemonStamina(pokemon),
  };
}

function isPokemonStrongerThan(chosenPokemon, rivalPokemon) {
  const chosenPokemonPoints = chosenPokemon.stamina - rivalPokemon.power;
  const rivalPokemonPoints = rivalPokemon.stamina - chosenPokemon.power;

  return chosenPokemonPoints > rivalPokemonPoints;
}

export function comparePokemons(pokemons) {
  const pokemonsStrength = pokemons.map(calculatePokemonStrength);

  const pokemonsScores = pokemonsStrength.map((chosenPokemon) => {
    let score = 0;

    pokemonsStrength.forEach((rivalPokemon) => {
      if (isPokemonStrongerThan(chosenPokemon, rivalPokemon)) score++;
    });

    return {
      name: chosenPokemon.name,
      score,
    };
  });

  const PokemonsByScore = pokemonsScores.sort((a, b) => b.score - a.score);

  return PokemonsByScore;
}
