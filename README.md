This is a simple performance study comparing Rust code compiled to WebAssembly (Wasm) and JavaScript code processing Pokémon data.

The idea is straightforward: I first used each Pokémon's base stats to calculate "power" and "stamina" (terms I coined for comparison). I then compare these values among all Pokémon using two nested for loops. After all comparisons, the Pokémon are ranked by their number of "wins," and the top 10 are displayed.

The algorithms used in each module are intentionally not the most performant possible for the given task. The main goal is for the algorithms to be as similar as possible without favoring either side.

## Cloning the Project
This repository uses `git submodules`. To automatically initialize and update them, it's recommended to clone the repository using the following command:

```sh
git clone --recursive <REPOSITORY-URL>
```

## Requirements

Please ensure you have the following programs installed to run the project:

  - [Node](https://nodejs.org/en/download)
  - [pnpm](https://pnpm.io/installation)
  - [Rust](https://www.rust-lang.org/tools/install)
  - [Just](https://just.systems/man/en/packages.html)
  - [binaryen](https://github.com/WebAssembly/binaryen/releases)

## Before Running

Run the following command in the project's root directory:

```sh
just setup
```

## Running the Project

Run the following command in the project's root directory:

```sh
just run
```

## Building the Wasm Module

Run the following command in the project's root directory:

```sh
just build-wasm [--prod] [--opt]
```

### Flags

  - `--prod`: Builds the Rust code with optimizations (`cargo build --release`).
      - Release profile settings:
          - `lto = true`
          - `opt-level = 's'`
  - `--opt`: Applies optimizations to the Wasm file (`wasm-opt -O3`).

> Learn more about Wasm optimization at:
> [Shrinking .wasm Code Size](https://rustwasm.github.io/docs/book/reference/code-size.html#shrinking-wasm-code-size)
