import fs from 'fs'
import { describe, expect, it } from 'vitest'
import { run } from './run'

describe('run', () => {
  it('normal', () => {
    run({
      tsConfigFilePath: 'fixtures/normal/tsconfig.json',
      inputFilePath: 'fixtures/normal/src/wire.ts',
      outputFilePath: 'fixtures/normal/src/wire-generated.ts',
    })
    expect(fs.readFileSync('fixtures/normal/src/wire-generated.ts', 'utf-8'))
      .toMatchInlineSnapshot(`
      "import { FooRepository, db, BarRepository, FooService, FooController } from \\"./foo\\";

      const fooRepository = new FooRepository(db);
      const barRepository = new BarRepository(db);
      const fooService = new FooService(fooRepository, barRepository);
      const fooController = new FooController(fooService);
      export const leaves = [fooController];
      "
    `)
  })
})
