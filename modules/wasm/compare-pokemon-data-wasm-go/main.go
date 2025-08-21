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

type PokemonScore struct {
	name  string
	score int
}

func decodePokemons(pokemonListJs js.Value) []Pokemon {
	pokemonsListJsLength := pokemonListJs.Length()
	pokemonList := make([]Pokemon, pokemonsListJsLength)

	for i := range pokemonsListJsLength {
		pokemonJs := pokemonListJs.Index(i)
		statsJs := pokemonJs.Get("stats")
		statsJsLength := statsJs.Length()

		pokemon := &pokemonList[i]

		pokemon.id = pokemonJs.Get("id").Int()
		pokemon.name = pokemonJs.Get("name").String()
		pokemon.stats = make([]PokemonStats, statsJsLength)

		for j := range statsJsLength {
			statJs := statsJs.Index(j)
			innerStatJs := statJs.Get("stat")
			pokemonStats := &pokemon.stats[j]

			pokemonStats.baseStat = statJs.Get("base_stat").Int()
			pokemonStats.effort = statJs.Get("effort").Int()
			pokemonStats.stat.name = innerStatJs.Get("name").String()
			pokemonStats.stat.url = innerStatJs.Get("url").String()
		}
	}

	return pokemonList
}

func encodePokemonsScore(pokemonsScore []PokemonScore) js.Value {
	global := js.Global()
	jsArray := global.Get("Array").New(len(pokemonsScore))

	for i, pokemonScore := range pokemonsScore {
		pokemonScoreJs := global.Get("Object").New()
		pokemonScoreJs.Set("name", pokemonScore.name)
		pokemonScoreJs.Set("score", pokemonScore.score)
		jsArray.SetIndex(i, pokemonScoreJs)
	}

	return jsArray
}

func sumPokemonStats(pokemon *Pokemon, statNames []string) float64 {
	sum := 0.0

	for i := range len(pokemon.stats) {
		if slices.Contains(statNames, pokemon.stats[i].stat.name) {
			sum += float64(pokemon.stats[i].baseStat)
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

type PokemonStrength struct {
	name    string
	power   float64
	stamina float64
}

func CalculatePokemonStrength(pokemon *Pokemon) PokemonStrength {
	return PokemonStrength{
		name:    pokemon.name,
		power:   calculatePokemonPower(pokemon),
		stamina: calculatePokemonStamina(pokemon),
	}
}

func IsPokemonStrongerThan(chosenPokemon, rivalPokemon *PokemonStrength) bool {
	chosenPokemonPoints := chosenPokemon.stamina - rivalPokemon.power
	rivalPokemonPoints := rivalPokemon.stamina - chosenPokemon.power

	return chosenPokemonPoints > rivalPokemonPoints
}

func rankPokemonsByScore(pokemons *[]Pokemon) []PokemonScore {
	pokemonsStrength := make([]PokemonStrength, len(*pokemons))

	for i, p := range *pokemons {
		pokemonsStrength[i] = CalculatePokemonStrength(&p)
	}

	pokemonScores := make([]PokemonScore, len(pokemonsStrength))

	for i := range pokemonsStrength {
		chosenPokemon := &pokemonsStrength[i]
		score := 0

		for j := range pokemonsStrength {
			rivalPokemon := &pokemonsStrength[j]
			if IsPokemonStrongerThan(chosenPokemon, rivalPokemon) {
				score++
			}
		}

		pokemonScores[i] = PokemonScore{
			name:  chosenPokemon.name,
			score: score,
		}
	}

	sort.Slice(pokemonScores, func(i, j int) bool {
		return pokemonScores[i].score > pokemonScores[j].score
	})

	return pokemonScores
}

var pokemons []Pokemon

func allocPokemonsData(_ js.Value, args []js.Value) any {
	pokemons = decodePokemons(args[0])

	return nil
}

func freePokemonsData(_ js.Value, _ []js.Value) any {
	pokemons = nil

	return nil
}

func comparePokemons(_ js.Value, _ []js.Value) any {
	pokemonsRank := rankPokemonsByScore(&pokemons)

	return encodePokemonsScore(pokemonsRank)
}

func main() {
	module := js.Global().Get("Object").New()

	module.Set("allocPokemonsData", js.FuncOf(allocPokemonsData))
	module.Set("freePokemonsData", js.FuncOf(freePokemonsData))
	module.Set("comparePokemons", js.FuncOf(comparePokemons))

	js.Global().Set("wasm", module)

	<-make(chan struct{})
}
