use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[derive(Deserialize)]
pub struct Pokemon {
    name: String,
    stats: Vec<PokemonStats>,
}

#[derive(Deserialize)]
pub struct PokemonStats {
    base_stat: u32,
    stat: Stat,
}

#[derive(Deserialize)]
pub struct Stat {
    name: String,
}

#[derive(Serialize)]
pub struct PokemonScore {
    name: String,
    pub score: i32,
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

struct PokemonStrength<'a> {
    name: &'a String,
    power: f64,
    stamina: f64,
}

fn calculate_pokemon_strength(pokemon: &Pokemon) -> PokemonStrength {
    PokemonStrength {
        name: &pokemon.name,
        power: calculate_pokemon_power(pokemon),
        stamina: calculate_pokemon_stamina(pokemon),
    }
}

fn is_pokemon_stronger_than(
    chosen_pokemon: &PokemonStrength,
    rival_pokemon: &PokemonStrength,
) -> bool {
    let chosen_pokemon_points = chosen_pokemon.stamina - rival_pokemon.power;
    let rival_pokemon_points = rival_pokemon.stamina - chosen_pokemon.power;

    chosen_pokemon_points > rival_pokemon_points
}

pub fn rank_pokemons_by_score(pokemons: &Vec<Pokemon>) -> Vec<PokemonScore> {
    let pokemons_strength: Vec<PokemonStrength> =
        pokemons.iter().map(calculate_pokemon_strength).collect();

    let mut pokemons_scores: Vec<PokemonScore> = pokemons_strength
        .iter()
        .map(|chosen_pokemon| {
            let mut score = 0;

            for rival_pokemon in &pokemons_strength {
                if is_pokemon_stronger_than(chosen_pokemon, rival_pokemon) {
                    score += 1;
                }
            }

            PokemonScore {
                name: chosen_pokemon.name.clone(),
                score,
            }
        })
        .collect();

    pokemons_scores.sort_by(|a, b| b.score.cmp(&a.score));

    pokemons_scores
}

#[wasm_bindgen]
pub struct Runner {
    pokemons: Vec<Pokemon>,
}

#[wasm_bindgen]
impl Runner {
    #[wasm_bindgen(constructor)]
    pub fn new(pokemons_js: JsValue) -> Result<Runner, JsValue> {
        let pokemons: Vec<Pokemon> = serde_wasm_bindgen::from_value(pokemons_js)?;
        Ok(Runner { pokemons })
    }

    pub fn compare_pokemons(&self) -> Result<JsValue, JsValue> {
        let scores = rank_pokemons_by_score(&self.pokemons);
        Ok(serde_wasm_bindgen::to_value(&scores)?)
    }
}
