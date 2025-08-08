use wasm_bindgen::prelude::*;

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

#[wasm_bindgen]
pub struct PokemonVictory {
    name: String,
    pub score: i32,
}

#[wasm_bindgen]
impl PokemonVictory {
    #[wasm_bindgen(getter)]
    pub fn name(&self) -> String {
        self.name.clone()
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

fn is_pokemon_stronger_than(chosen_pokemon: &Pokemon, rival_pokemon: &Pokemon) -> bool {
    let chosen_pokemon_power = calculate_pokemon_power(chosen_pokemon);
    let chosen_pokemon_stamina = calculate_pokemon_stamina(chosen_pokemon);

    let rival_pokemon_power = calculate_pokemon_power(rival_pokemon);
    let rival_pokemon_stamina = calculate_pokemon_stamina(rival_pokemon);

    let chosen_pokemon_points = chosen_pokemon_stamina - rival_pokemon_power;
    let rival_pokemon_points = rival_pokemon_stamina - chosen_pokemon_power;

    chosen_pokemon_points > rival_pokemon_points
}

pub fn rank_pokemon_victories(pokemons: &Vec<Pokemon>) -> Vec<PokemonVictory> {
    let mut pokemon_victories_array: Vec<PokemonVictory> = Vec::new();

    for chosen_pokemon in pokemons {
        let mut pokemon_victories = PokemonVictory {
            name: chosen_pokemon.name.clone(),
            score: 0,
        };

        for rival_pokemon in pokemons {
            if is_pokemon_stronger_than(chosen_pokemon, rival_pokemon) {
                pokemon_victories.score += 1;
            }
        }

        pokemon_victories_array.push(pokemon_victories);
    }

    pokemon_victories_array.sort_by(|a, b| b.score.cmp(&a.score));

    pokemon_victories_array
}

#[wasm_bindgen]
pub fn compare_pokemons(pokemons: Vec<Pokemon>) {
    rank_pokemon_victories(&pokemons);
}

#[wasm_bindgen]
pub fn compare_pokemons_loop(pokemons: Vec<Pokemon>, times: i32) {
    for _ in 0..times {
        rank_pokemon_victories(&pokemons);
    }
}
