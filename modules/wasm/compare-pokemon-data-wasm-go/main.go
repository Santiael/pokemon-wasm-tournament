package main

import (
	"slices"
	"sort"
	"syscall/js"
)

type Pokemon struct {
	id    int
	name  string
	stats []PokemonStats
}

type PokemonStats struct {
	baseStat int
	effort   int
	stat     Stat
}

type Stat struct {
	name string
	url  string
}

type PokemonVictory struct {
	name  string
	score int
}

func decodePokemon(pokemonJs js.Value) Pokemon {
	statsJs := pokemonJs.Get("stats")
	statJsLength := statsJs.Length()

	stats := make([]PokemonStats, 0, statJsLength)

	for i := range statJsLength {
		stat := decodePokemonStats(statsJs.Index(i))
		stats = append(stats, stat)
	}

	return Pokemon{
		id:    pokemonJs.Get("id").Int(),
		name:  pokemonJs.Get("name").String(),
		stats: stats,
	}
}

func decodePokemonStats(statJs js.Value) PokemonStats {
	innerStatJs := statJs.Get("stat")

	innerStat := decodeStat(innerStatJs)

	return PokemonStats{
		baseStat: statJs.Get("base_stat").Int(),
		effort:   statJs.Get("effort").Int(),
		stat:     innerStat,
	}
}

func decodeStat(statJs js.Value) Stat {
	return Stat{
		name: statJs.Get("name").String(),
		url:  statJs.Get("url").String(),
	}
}

func sumPokemonStats(pokemon *Pokemon, statNames []string) float64 {
	sum := 0.0

	for i := range len(pokemon.stats) {
		if slices.Contains(statNames, (*pokemon).stats[i].stat.name) {
			sum += float64((*pokemon).stats[i].baseStat)
		}
	}

	return sum
}

func calculatePokemonPower(pokemon *Pokemon) float64 {
	totalAttack := sumPokemonStats(pokemon, []string{"attack", "special-attack"})

	speed := 0.0

	for i := range len(pokemon.stats) {
		if pokemon.stats[i].stat.name == "speed" {
			speed = float64(pokemon.stats[i].baseStat)
			break
		}
	}

	return float64(totalAttack) * (1 + speed/100.0)
}

func calculatePokemonStamina(pokemon *Pokemon) float64 {
	return sumPokemonStats(pokemon, []string{"hp", "defense", "special-defense"})
}

func isPokemonStrongerThan(chosenPokemon, rivalPokemon *Pokemon) bool {
	chosenPokemonPower := calculatePokemonPower(chosenPokemon)
	chosenPokemonStamina := calculatePokemonStamina(chosenPokemon)

	rivalPokemonPower := calculatePokemonPower(rivalPokemon)
	rivalPokemonStamina := calculatePokemonStamina(rivalPokemon)

	chosenPokemonPoints := chosenPokemonStamina - rivalPokemonPower
	rivalPokemonPoints := rivalPokemonStamina - chosenPokemonPower

	return chosenPokemonPoints > rivalPokemonPoints
}

func rankPokemonVictories(pokemons *[]Pokemon) []PokemonVictory {
	pokemonsLength := len(*pokemons)
	pokemonVictoriesArray := make([]PokemonVictory, 0, pokemonsLength)

	for i := range pokemonsLength {
		chosenPokemon := &(*pokemons)[i]
		victories := PokemonVictory{name: chosenPokemon.name}

		for j := range pokemonsLength {
			rivalPokemon := &(*pokemons)[j]
			if isPokemonStrongerThan(chosenPokemon, rivalPokemon) {
				victories.score++
			}
		}

		pokemonVictoriesArray = append(pokemonVictoriesArray, victories)
	}

	sort.Slice(pokemonVictoriesArray, func(i, j int) bool {
		return pokemonVictoriesArray[i].score > pokemonVictoriesArray[j].score
	})

	return pokemonVictoriesArray
}

func comparePokemons(_ js.Value, args []js.Value) any {
	pokemonsJs := args[0]
	pokemonsJsLength := pokemonsJs.Length()
	pokemons := make([]Pokemon, 0, pokemonsJsLength)

	for i := range pokemonsJsLength {
		pokemonJS := pokemonsJs.Index(i)
		pokemon := decodePokemon(pokemonJS)
		pokemons = append(pokemons, pokemon)
	}

	rankPokemonVictories(&pokemons)

	return nil
}

func main() {
	wasmObject := js.Global().Get("Object").New()

	wasmObject.Set("comparePokemons", js.FuncOf(comparePokemons))

	js.Global().Set("wasm", wasmObject)

	<-make(chan struct{})
}
