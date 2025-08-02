package main

import (
	"slices"
	"sort"
	"syscall/js"
)

type Pokemon struct {
	Name  string `json:"name"`
	Stats []Stat `json:"stats"`
}

type Stat struct {
	BaseStat int      `json:"base_stat"`
	StatInfo StatInfo `json:"stat"`
}

type StatInfo struct {
	Name string `json:"name"`
}

type PokemonVictory struct {
	Name  string
	Score int
}

func createPokemon(pokemonJs js.Value) Pokemon {
	statsJs := pokemonJs.Get("stats")

	name := pokemonJs.Get("name").String()
	stats := make([]Stat, 0, statsJs.Length())

	for i := 0; i < statsJs.Length(); i++ {
		stat := createStat(statsJs.Index(i))
		stats = append(stats, stat)
	}

	return Pokemon{
		Name:  name,
		Stats: stats,
	}
}

func createStat(statJs js.Value) Stat {
	statInfoJs := statJs.Get("stat")

	baseStat := statJs.Get("base_stat").Int()
	statInfo := createStatInfo(statInfoJs)

	return Stat{
		BaseStat: baseStat,
		StatInfo: statInfo,
	}
}

func createStatInfo(statInfoJs js.Value) StatInfo {
	name := statInfoJs.Get("name").String()

	return StatInfo{
		Name: name,
	}
}

func sumPokemonStats(pokemon Pokemon, statNames []string) int {
	sum := 0

	for _, s := range pokemon.Stats {
		if slices.Contains(statNames, s.StatInfo.Name) {
			sum += s.BaseStat
		}
	}

	return sum
}

func calculatePokemonPower(pokemon Pokemon) float64 {
	totalAttack := sumPokemonStats(pokemon, []string{"attack", "special-attack"})

	speed := 0

	for _, s := range pokemon.Stats {
		if s.StatInfo.Name == "speed" {
			speed = s.BaseStat
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
		victories := PokemonVictory{Name: chosenPokemon.Name}

		for _, rivalPokemon := range pokemons {
			if isPokemonStrongerThan(chosenPokemon, rivalPokemon) {
				victories.Score++
			}
		}

		pokemonVictoriesArray = append(pokemonVictoriesArray, victories)
	}

	sort.Slice(pokemonVictoriesArray, func(i, j int) bool {
		return pokemonVictoriesArray[i].Score > pokemonVictoriesArray[j].Score
	})

	return pokemonVictoriesArray
}

func comparePokemons(_ js.Value, args []js.Value) any {
	pokemonsJs := args[0]

	pokemons := make([]Pokemon, 0, pokemonsJs.Length())

	for i := 0; i < pokemonsJs.Length(); i++ {
		pokemonJS := pokemonsJs.Index(i)
		pokemon := createPokemon(pokemonJS)
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
