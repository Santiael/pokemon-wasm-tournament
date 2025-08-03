package main

import (
	"sort"
	"syscall/js"
)

type Pokemon struct {
	name  string
	stats []PokemonStat
}

type PokemonStat struct {
	baseStat int
	stat     Stat
}

type Stat struct {
	name string
}

type PokemonVictory struct {
	name  string
	score int
}

type PokemonWithScore struct {
	pokemon *Pokemon
	power   float64
	stamina float64
}

func comparePokemons(_ js.Value, args []js.Value) interface{} {
	pokemons := decodePokemons(args[0])

	result := rankPokemonVictories(pokemons)

	return encodePokemonVictories(result)
}

func decodePokemons(list js.Value) []Pokemon {
	size := list.Length()
	pokemons := make([]Pokemon, size)

	for i := 0; i < size; i++ {
		obj := list.Index(i)

		pokemons[i] = Pokemon{
			name: obj.Get("name").String(),
		}
		pokemon := &pokemons[i]

		obj_stats := obj.Get("stats")
		stats_size := obj_stats.Length()
		pokemon.stats = make([]PokemonStat, stats_size)

		for j := 0; j < stats_size; j++ {
			obj_stat := obj_stats.Index(j)

			pokemon.stats[j] = PokemonStat{
				baseStat: obj_stat.Get("base_stat").Int(),
				stat: Stat{
					name: obj_stat.Get("stat").Get("name").String(),
				},
			}
		}
	}

	return pokemons
}

func encodePokemonVictories(result []PokemonVictory) js.Value {
	global := js.Global()
	jsArray := global.Get("Array").New(len(result))

	for i, p := range result {
		obj := global.Get("Object").New()
		obj.Set("name", p.name)
		obj.Set("score", p.score)
		jsArray.SetIndex(i, obj)
	}

	return jsArray
}

func rankPokemonVictories(pokemons []Pokemon) []PokemonVictory {
	precomputed := precomputeScores(pokemons)
	pokemonVictoriesArray := make([]PokemonVictory, len(precomputed))

	for i, chosen := range precomputed {
		victory := PokemonVictory{name: chosen.pokemon.name}

		for _, rival := range precomputed {
			if (chosen.stamina - rival.power) > (rival.stamina - chosen.power) {
				victory.score++
			}
		}

		pokemonVictoriesArray[i] = victory
	}

	sort.Slice(pokemonVictoriesArray, func(i, j int) bool {
		return pokemonVictoriesArray[i].score > pokemonVictoriesArray[j].score
	})

	return pokemonVictoriesArray
}

func precomputeScores(pokemons []Pokemon) []PokemonWithScore {
	result := make([]PokemonWithScore, len(pokemons))

	for i := range pokemons {
		pokemon := &pokemons[i]

		result[i] = PokemonWithScore{
			pokemon: pokemon,
			power:   calculatePokemonPower(pokemon),
			stamina: calculatePokemonStamina(pokemon),
		}
	}
	return result
}

func calculatePokemonPower(pokemon *Pokemon) float64 {
	totalAttack := sumPokemonStats(pokemon, []string{"attack", "special-attack"})
	speed := 0.0

	for _, s := range pokemon.stats {
		if s.stat.name == "speed" {
			speed = float64(s.baseStat)
			break
		}
	}

	return totalAttack * (1.0 + speed/100.0)
}

func calculatePokemonStamina(pokemon *Pokemon) float64 {
	return sumPokemonStats(pokemon, []string{"hp", "defense", "special-defense"})
}

func sumPokemonStats(pokemon *Pokemon, statNames []string) float64 {
	statMap := make(map[string]struct{}, len(statNames))

	for _, name := range statNames {
		statMap[name] = struct{}{}
	}

	sum := 0

	for _, s := range pokemon.stats {
		if _, ok := statMap[s.stat.name]; ok {
			sum += s.baseStat
		}
	}

	return float64(sum)
}

func main() {
	c := make(chan struct{})

	global := js.Global()

	wasmObject := global.Get("Object").New()
	wasmObject.Set("comparePokemons", js.FuncOf(comparePokemons))

	global.Set("wasm", wasmObject)

	<-c
}
