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

	stats := make([]PokemonStats, 0, statsJs.Length())

	for i := 0; i < statsJs.Length(); i++ {
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

func sumPokemonStats(pokemon Pokemon, statNames []string) int {
	sum := 0

	for _, s := range pokemon.stats {
		if slices.Contains(statNames, s.stat.name) {
			sum += s.baseStat
		}
	}

	return sum
}

func calculatePokemonPower(pokemon Pokemon) float64 {
	totalAttack := sumPokemonStats(pokemon, []string{"attack", "special-attack"})

	speed := 0

	for _, s := range pokemon.stats {
		if s.stat.name == "speed" {
			speed = s.baseStat
			break
		}
	}

	return float64(totalAttack) * (1 + float64(speed)/100.0)
}

func calculatePokemonStamina(pokemon Pokemon) int {
	return sumPokemonStats(pokemon, []string{"hp", "defense", "special-defense"})
}

func isPokemonStrongerThan(chosenPokemon, rivalPokemon Pokemon) bool {
	chosenPokemonPower := calculatePokemonPower(chosenPokemon)
	chosenPokemonStamina := calculatePokemonStamina(chosenPokemon)

	rivalPokemonPower := calculatePokemonPower(rivalPokemon)
	rivalPokemonStamina := calculatePokemonStamina(rivalPokemon)

	chosenPokemonPoints := float64(chosenPokemonStamina) - rivalPokemonPower
	rivalPokemonPoints := float64(rivalPokemonStamina) - chosenPokemonPower

	return chosenPokemonPoints > rivalPokemonPoints
}

func rankPokemonVictories(pokemons []Pokemon) []PokemonVictory {
	pokemonVictoriesArray := make([]PokemonVictory, 0, len(pokemons))

	for _, chosenPokemon := range pokemons {
		victories := PokemonVictory{name: chosenPokemon.name}

		for _, rivalPokemon := range pokemons {
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
	pokemons := make([]Pokemon, 0, pokemonsJs.Length())

	for i := 0; i < pokemonsJs.Length(); i++ {
		pokemonJS := pokemonsJs.Index(i)
		pokemon := decodePokemon(pokemonJS)
		pokemons = append(pokemons, pokemon)
	}

	rankPokemonVictories(pokemons)

	return nil
}

func main() {
	wasmObject := js.Global().Get("Object").New()

	wasmObject.Set("comparePokemons", js.FuncOf(comparePokemons))

	js.Global().Set("wasm", wasmObject)

	<-make(chan struct{})
}
