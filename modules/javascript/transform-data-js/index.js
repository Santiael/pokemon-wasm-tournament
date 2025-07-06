function sumPokemonStatus(pokemon, statusNames = []) {
  return pokemon.stats
    .filter(({ stat }) => statusNames.includes(stat.name))
    .reduce((acc, cur) => acc + cur.base_stat, 0);
}

// power = (attack + special-attack) * (1 + speed/100)
export function calculatePokemonPower(pokemon) {
  const totalAttack = sumPokemonStatus(pokemon, ["attack", "special-attack"]);

  const speedStatus = pokemon.stats.find(({ stat }) => stat.name === "speed");
  const speed = speedStatus?.base_stat || 0;

  return totalAttack * (1 + speed / 100);
}

// stamina = hp + defense + special-defense
export function calculatePokemonStamina(pokemon) {
  return sumPokemonStatus(pokemon, ["hp", "defense", "special-defense"]);
}
