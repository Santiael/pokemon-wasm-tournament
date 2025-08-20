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
pub struct PokemonScore {
    name: String,
    pub score: i32,
}

#[wasm_bindgen]
impl PokemonScore {
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
    pub fn new(pokemons: Vec<Pokemon>) -> Runner {
        Runner { pokemons }
    }

    pub fn compare_pokemons(&self) {
        rank_pokemons_by_score(&self.pokemons);
    }
}
