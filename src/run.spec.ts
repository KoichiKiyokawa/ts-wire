import fs from 'fs'
import { describe, expect, it } from 'vitest'
import { run } from './run'

describe('run', () => {
  const generateOptionByFixtureName = (fixtureName: string): Parameters<typeof run>[0] => ({
    tsConfigFilePath: `fixtures/${fixtureName}/tsconfig.json`,
    inputFilePath: `fixtures/${fixtureName}/src/wire.ts`,
    outputFilePath: `fixtures/${fixtureName}/src/wire-generated.ts`,
  })

  it('normal', () => {
    const option = generateOptionByFixtureName('normal')
    run(option)
    expect(fs.readFileSync(option.outputFilePath, 'utf-8')).toMatchInlineSnapshot(`
      "import { FooRepository, db, BarRepository, FooService, FooController } from \\"./foo\\";

      const fooRepository = new FooRepository(db);
      const barRepository = new BarRepository(db);
      const fooService = new FooService(fooRepository, barRepository);
      const fooController = new FooController(fooService);
      const leaves = {fooController};

      export default leaves;
      "
    `)
  })
})
