use wasm_bindgen::prelude::*;

#[allow(dead_code)]
#[wasm_bindgen]
pub struct Stat {
    name: String,
    url: String,
}

#[wasm_bindgen]
impl Stat {
    #[wasm_bindgen(constructor)]
    pub fn new(name: String, url: String) -> Stat {
        Stat { name, url }
    }
}

#[allow(dead_code)]
#[wasm_bindgen]
pub struct PokemonStats {
    base_stat: u32,
    effort: u32,
    stat: Stat,
}

#[wasm_bindgen]
impl PokemonStats {
    #[wasm_bindgen(constructor)]
    pub fn new(base_stat: u32, effort: u32, stat: Stat) -> PokemonStats {
        PokemonStats {
            base_stat,
            effort,
            stat,
        }
    }
}

#[allow(dead_code)]
#[wasm_bindgen]
pub struct Pokemon {
    id: u32,
    name: String,
    stats: Vec<PokemonStats>,
}

#[wasm_bindgen]
impl Pokemon {
    #[wasm_bindgen(constructor)]
    pub fn new(id: u32, name: String, stats: Vec<PokemonStats>) -> Pokemon {
        Pokemon { id, name, stats }
    }
}

#[wasm_bindgen]
pub struct PokemonVictory {
    name: String,
    score: i32,
}

#[wasm_bindgen]
impl PokemonVictory {
    #[wasm_bindgen(getter)]
    pub fn name(&self) -> String {
        self.name.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn score(&self) -> i32 {
        self.score.clone()
    }
}

fn sum_pokemon_stats(pokemon: &Pokemon, stat_names: &[&str]) -> f64 {
    pokemon
        .stats
        .iter()
        .filter(|s| stat_names.contains(&s.stat.name.as_str()))
        .map(|s| s.base_stat as f64)
        .sum()
}

fn calculate_pokemon_power(pokemon: &Pokemon) -> f64 {
    let total_attack = sum_pokemon_stats(pokemon, &["attack", "special-attack"]);

    let speed = pokemon
        .stats
        .iter()
        .find(|s| s.stat.name == "speed")
        .map_or(0.0, |s| s.base_stat as f64);

    total_attack * (1.0 + speed / 100.0)
}

fn calculate_pokemon_stamina(pokemon: &Pokemon) -> f64 {
    sum_pokemon_stats(pokemon, &["hp", "defense", "special-defense"])
}

pub struct PokemonWithScore<'a> {
    pokemon: &'a Pokemon,
    power: f64,
    stamina: f64,
}

fn precompute_pokemon_with_score(pokemons: &Vec<Pokemon>) -> Vec<PokemonWithScore> {
    let mut result: Vec<PokemonWithScore> = Vec::with_capacity(pokemons.len());

    for pokemon in pokemons {
        result.push(PokemonWithScore {
            pokemon: &pokemon,
            power: calculate_pokemon_power(&pokemon),
            stamina: calculate_pokemon_stamina(&pokemon),
        });
    }

    result
}

pub fn rank_pokemon_victories(pokemons: &Vec<Pokemon>) -> Vec<PokemonVictory> {
    let precomputed = precompute_pokemon_with_score(&pokemons);

    let mut pokemon_victories_array: Vec<PokemonVictory> = Vec::with_capacity(pokemons.len());

    for chosen_pokemon in &precomputed {
        let mut victories: i32 = 0;

        for rival_pokemon in &precomputed {
            let is_stronger_than = (chosen_pokemon.stamina - rival_pokemon.power)
                > (rival_pokemon.stamina - chosen_pokemon.power);

            if is_stronger_than {
                victories += 1;
            }
        }

        pokemon_victories_array.push(PokemonVictory {
            name: chosen_pokemon.pokemon.name.clone(),
            score: victories,
        });
    }

    pokemon_victories_array.sort_by(|a, b| b.score.cmp(&a.score));

    pokemon_victories_array
}

#[wasm_bindgen]
pub fn compare_pokemons(pokemons: Vec<Pokemon>) -> Vec<PokemonVictory> {
    let result = rank_pokemon_victories(&pokemons);

    result
}

#[wasm_bindgen]
pub fn compare_pokemons_loop(pokemons: Vec<Pokemon>, times: i32) {
    for _ in 0..times {
        rank_pokemon_victories(&pokemons);
    }
}
