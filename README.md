# ts-wire

[![CI](https://github.com/KoichiKiyokawa/ts-wire/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/KoichiKiyokawa/ts-wire/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/@kiyoshiro%2Fts-wire.svg)](https://badge.fury.io/js/@kiyoshiro%2Fts-wire)
[![codecov](https://codecov.io/github/KoichiKiyokawa/ts-wire/branch/main/graph/badge.svg?token=MHOGB70JUD)](https://codecov.io/github/KoichiKiyokawa/ts-wire)

## Features

- No decorators are needed.
  - You don't need to write any `@Injectable`.
- Code-generation based.
  - Good for static checks, fast boot.

https://user-images.githubusercontent.com/40315079/211189731-7b5e876d-8b0c-4d5b-af7e-a85368e85559.mp4

## Usage

```sh
npm i -D @kiyoshiro/ts-wire
npx ts-wire init # Create `src/wire.ts`
```

In `src/wire.ts`, you have to list values and classes you want to resolve dependencies.

```ts
import { BarRepository, db, FooController, FooRepository, FooService } from './foo'

export const providers = [db, FooRepository, BarRepository, FooService, FooController]
```

Then, you run a generate command.

```sh
npx ts-wire generate
```

You can see the following code in `src/wire-generated.ts`.

```ts
import { FooRepository, db, BarRepository, FooService, FooController } from './foo'

const fooRepository = new FooRepository(db)
const barRepository = new BarRepository(db)
const fooService = new FooService(fooRepository, barRepository)
const fooController = new FooController(fooService)
const leaves = { fooController }

export default leaves
```

## Acknowledgments

This library is inspired by https://github.com/google/wire
