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

function isPokemonStrongerThan(chosenPokemon, rivalPokemon) {
  const chosenPokemonPower = calculatePokemonPower(chosenPokemon);
  const chosenPokemonStamina = calculatePokemonStamina(chosenPokemon);

  const rivalPokemonPower = calculatePokemonPower(rivalPokemon);
  const rivalPokemonStamina = calculatePokemonStamina(rivalPokemon);

  const chosenPokemonPoints = chosenPokemonStamina - rivalPokemonPower;
  const rivalPokemonPoints = rivalPokemonStamina - chosenPokemonPower;

  return chosenPokemonPoints > rivalPokemonPoints;
}

function precomputeScores(pokemons) {
  return pokemons.map((pokemon) => ({
    pokemon: pokemon,
    power: calculatePokemonPower(pokemon),
    stamina: calculatePokemonStamina(pokemon),
  }));
}

export function comparePokemons(pokemons) {
  const precomputed = precomputeScores(pokemons);
  const pokemonVictoriesArray = [];

  precomputed.forEach((chosenPokemon) => {
    const pokemonVictories = {
      name: chosenPokemon.pokemon.name,
      score: 0,
    };

    precomputed.forEach((rivalPokemon) => {
      if ((chosenPokemon.stamina - rivalPokemon.power) > (rivalPokemon.stamina - chosenPokemon.power)) {
        pokemonVictories.score += 1;
      }
    });

    pokemonVictoriesArray.push(pokemonVictories);
  });

  const orderedPokemonVictoriesArray = pokemonVictoriesArray.sort(
    (a, b) => b.score - a.score
  );

  return orderedPokemonVictoriesArray;
}
