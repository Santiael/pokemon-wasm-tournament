import fs from 'node:fs';
import path from 'node:path';
import { WASI } from 'node:wasi';
import { argv, env } from 'node:process';

const wasmFile = path.join(import.meta.dirname, "./main.wasm");
const wasmBuffer = await fs.promises.readFile(wasmFile);
export const wasmSize = `${((await fs.promises.stat(wasmFile)).size / 1000).toFixed(0)}KB`;

const wasi = new WASI({ version: 'preview1', args: argv, env, preopens: {} });
const module = await WebAssembly.compile(wasmBuffer);
const instance = await WebAssembly.instantiate(module, wasi.getImportObject());

wasi.initialize(instance);

const { memory, malloc, free, compare_pokemons: __compare_pokemons } = instance.exports;

// constants for memory layout
const STAT_NAME_MAX = 32;
const NAME_MAX = 64;
const MAX_STATS = 10;

// struct sizes
const STAT_SIZE = STAT_NAME_MAX + 4; // char[32] + int = 36 bytes
const POKEMON_SIZE = NAME_MAX + (STAT_SIZE * MAX_STATS) + 4; // 64 + (36 * 10) + 4 = 428
const POKEMON_VICTORY_SIZE = NAME_MAX + 4; // char[64] + int = 68
const POKEMON_OFFSET_STATS = NAME_MAX; // 64
const POKEMON_OFFSET_STATS_LEN = NAME_MAX + (STAT_SIZE * MAX_STATS); // 424

export function compare_pokemons(list) {
  const input = serializePokemonArray(list, memory, malloc)
  const result_ptr = __compare_pokemons(input.ptr, input.count);

  free(input.ptr)

  const result = deserializePokemonVictoryArray(
    result_ptr,
    list.length,
    memory,
  );

  free(result_ptr);

  return result;
}

function serializePokemonArray(pokemons, memory, malloc) {
  const encoder = new TextEncoder();
  const count = pokemons.length;
  const totalSize = count * POKEMON_SIZE;
  const ptr = malloc(totalSize);

  const u8 = new Uint8Array(memory.buffer);
  const view = new DataView(memory.buffer);

  for (let i = 0; i < count; i++) {
    const offset = ptr + i * POKEMON_SIZE;
    const p = pokemons[i];

    // write name[NAME_MAX]
    const nameBytes = encoder.encode(p.name);
    u8.fill(0, offset, offset + NAME_MAX);
    u8.set(nameBytes.slice(0, NAME_MAX - 1), offset);

    // write stats[MAX_STATS]
    for (let j = 0; j < MAX_STATS; j++) {
      const statOffset = offset + POKEMON_OFFSET_STATS + j * STAT_SIZE;

      if (j < p.stats.length) {
        const stat = p.stats[j];

        const statNameBytes = encoder.encode(stat.stat.name);
        u8.fill(0, statOffset, statOffset + STAT_NAME_MAX);
        u8.set(statNameBytes.slice(0, STAT_NAME_MAX - 1), statOffset);

        view.setInt32(statOffset + STAT_NAME_MAX, stat.base_stat, true);
      } else {
        // zero unused slots
        u8.fill(0, statOffset, statOffset + STAT_SIZE);
      }
    }

    // write stats_len
    view.setInt32(offset + POKEMON_OFFSET_STATS_LEN, p.stats.length, true);
  }

  return { ptr, count };
}

function deserializePokemonVictoryArray(ptr, count, memory) {
  const decoder = new TextDecoder('utf-8');
  const u8 = new Uint8Array(memory.buffer);
  const view = new DataView(memory.buffer);

  const results = [];

  for (let i = 0; i < count; i++) {
    const offset = ptr + i * POKEMON_VICTORY_SIZE;

    const nameBytes = u8.slice(offset, offset + NAME_MAX);
    const name = decoder.decode(nameBytes).replace(/\0.*$/, '');

    const score = view.getInt32(offset + NAME_MAX, true);

    results.push({ name, score });
  }

  return results;
}
