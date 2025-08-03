#include <string.h>
#include <stdlib.h>
#include <stdbool.h>

#define STAT_NAME_MAX 32
#define NAME_MAX 64
#define MAX_STATS 10

typedef struct __attribute__((packed)) Stat
{
  char name[STAT_NAME_MAX];
  int base_stat;
} Stat;

typedef struct __attribute__((packed)) Pokemon
{
  char name[NAME_MAX];
  Stat stats[MAX_STATS];
  int stats_len;
} Pokemon;

typedef struct __attribute__((packed)) PokemonVictory
{
  char name[NAME_MAX];
  int score;
} PokemonVictory;

bool stat_name_in(const char *name, const char *list[], int len)
{
  for (int i = 0; i < len; i++)
  {
    if (strcmp(name, list[i]) == 0)
      return true;
  }
  return false;
}

float sum_stats(const Pokemon *p, const char *names[], int names_len)
{
  int sum = 0;
  for (int i = 0; i < p->stats_len; i++)
  {
    if (stat_name_in(p->stats[i].name, names, names_len))
    {
      sum += p->stats[i].base_stat;
    }
  }
  return (float)sum;
}

float calculate_power(const Pokemon *p)
{
  const char *power_stats[] = {"attack", "special-attack"};
  float atk = sum_stats(p, power_stats, 2);

  int speed = 0;
  for (int i = 0; i < p->stats_len; i++)
  {
    if (strcmp(p->stats[i].name, "speed") == 0)
    {
      speed = p->stats[i].base_stat;
      break;
    }
  }

  return atk * (1.0f + (float)speed / 100.0f);
}

float calculate_stamina(const Pokemon *p)
{
  const char *stam_stats[] = {"hp", "defense", "special-defense"};
  return sum_stats(p, stam_stats, 3);
}

bool is_pokemon_stronger_than(const Pokemon *chosen, const Pokemon *rival)
{
  float chosen_power = calculate_power(chosen);
  float chosen_stamina = calculate_stamina(chosen);
  float rival_power = calculate_power(rival);
  float rival_stamina = calculate_stamina(rival);

  float chosen_points = chosen_stamina - rival_power;
  float rival_points = rival_stamina - chosen_power;

  return chosen_points > rival_points;
}

int compare_victories(const void *a, const void *b)
{
  const PokemonVictory *pa = (const PokemonVictory *)a;
  const PokemonVictory *pb = (const PokemonVictory *)b;
  return pb->score - pa->score;
}

__attribute__((export_name("compare_pokemons")))
PokemonVictory *
compare_pokemons(const Pokemon *pokemons, int count)
{
  PokemonVictory *results = (PokemonVictory *)malloc(sizeof(PokemonVictory) * count);

  for (int i = 0; i < count; i++)
  {
    PokemonVictory *result = &results[i];
    const Pokemon *p = &pokemons[i];

    strcpy(result->name, p->name);
    result->score = 0;

    for (int j = 0; j < count; j++)
    {
      const Pokemon *np = &pokemons[j];

      if (is_pokemon_stronger_than(p, np))
        result->score++;
    }
  }

  qsort(results, count, sizeof(PokemonVictory), compare_victories);

  return results;
}
