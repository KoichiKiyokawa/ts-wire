#! /usr/bin/env node

/* eslint-disable @typescript-eslint/no-var-requires */

import yargs from 'yargs/yargs'
import { run } from './run'
import fs from 'fs'

const wireTsTemplate = `// example: export const providers = [FooRepository, FooService, FooController]
export const providers = []`

yargs(process.argv.slice(2))
  .help()
  .command(
    'init',
    'make a wire.ts',
    {
      path: { alias: 'p', description: 'Path to the creating file', default: 'src/wire.ts' },
    },
    async (argv) => {
      if (fs.existsSync(argv.path)) {
        const readline = require('readline').createInterface({
          input: process.stdin,
          output: process.stdout,
        })

        const answer = await new Promise((resolve) => {
          readline.question(
            `\n  ${argv.path} already exists. Do you want to overwrite? [y/N]`,
            (answer: string) => {
              resolve(answer)
              readline.close()
            }
          )
        })
        if (answer !== 'y') return console.log('\n  Cancelled')
      }
      fs.writeFileSync(argv.path, wireTsTemplate)
      console.log(`\n  Created: ${argv.path}`)
    }
  )
  .command(
    '*',
    'resolve dependencies and generate',
    {
      input: {
        alias: 'i',
        description: 'Path to the file that has providers',
        default: 'src/wire.ts',
      },
      config: { alias: 'c', description: 'Path to the tsconfig file', default: './tsconfig.json' },
      output: {
        alias: 'o',
        description: 'Path to the output file',
        default: 'src/wire-generated.ts',
      },
    },
    (argv) => {
      const { performance } = require('perf_hooks')
      const start = performance.now()
      run({ tsConfigFilePath: argv.config, inputFilePath: argv.input, outputFilePath: argv.output })
      const end = performance.now()
      console.log(`\n  Created: ${argv.output}\n  Done in ${end - start}ms`)
    }
  )
  .alias({ h: 'help', v: 'version' }).argv
