function sumPokemonStats(pokemon, statusNames = []) {
  return pokemon.stats
    .filter(({ stat }) => statusNames.includes(stat.name))
    .reduce((acc, cur) => acc + cur.base_stat, 0);
}

// power = (attack + special-attack) * (1 + speed/100)
export function calculatePokemonPower(pokemon) {
  const totalAttack = sumPokemonStats(pokemon, ["attack", "special-attack"]);

  const speedStats = pokemon.stats.find(({ stat }) => stat.name === "speed");
  const speed = speedStats?.base_stat || 0;

  return totalAttack * (1 + speed / 100);
}

// stamina = hp + defense + special-defense
export function calculatePokemonStamina(pokemon) {
  return sumPokemonStats(pokemon, ["hp", "defense", "special-defense"]);
}

export function isPokemonStrongerThan(chosenPokemon, rivalPokemon) {
  const chosenPokemonPower = calculatePokemonPower(chosenPokemon);
  const chosenPokemonStamina = calculatePokemonStamina(chosenPokemon);

  const rivalPokemonPower = calculatePokemonPower(rivalPokemon);
  const rivalPokemonStamina = calculatePokemonStamina(rivalPokemon);

  const chosenPokemonPoints = chosenPokemonStamina - rivalPokemonPower;
  const rivalPokemonPoints = rivalPokemonStamina - chosenPokemonPower;

  return chosenPokemonPoints > rivalPokemonPoints;
}
