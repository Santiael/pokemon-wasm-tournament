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

typedef struct __attribute__((packed)) PokemonWithScore
{
  const Pokemon *pokemon;
  float power;
  float stamina;
} PokemonWithScore;

PokemonWithScore *precomputeScores(const Pokemon *pokemons, int count)
{
  PokemonWithScore *results = (PokemonWithScore *)malloc(sizeof(PokemonWithScore) * count);

  for (int i = 0; i < count; i++)
  {
    PokemonWithScore *result = &results[i];
    result->pokemon = &pokemons[i];
    result->power = calculate_power(result->pokemon);
    result->stamina = calculate_stamina(result->pokemon);
  }

  return results;
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
  PokemonWithScore *precomputed = precomputeScores(pokemons, count);
  PokemonVictory *results = (PokemonVictory *)malloc(sizeof(PokemonVictory) * count);

  for (int i = 0; i < count; i++)
  {
    PokemonVictory *result = &results[i];
    const PokemonWithScore *p = &precomputed[i];

    strcpy(result->name, p->pokemon->name);
    result->score = 0;

    for (int j = 0; j < count; j++)
    {
      const PokemonWithScore *np = &precomputed[j];

      if ((p->stamina - np->power) > (np->stamina - p->power))
      {
        result->score++;
      }
    }
  }

  qsort(results, count, sizeof(PokemonVictory), compare_victories);

  return results;
}
