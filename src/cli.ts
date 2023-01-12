#! /usr/bin/env node

import yargs from 'yargs/yargs'
import { run } from './run'
import chalk from 'chalk'

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
      const fs = await import('fs')
      if (fs.existsSync(argv.path)) {
        const readline = await import('readline')
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        })

        const answer = await new Promise((resolve) => {
          rl.question(
            `\n  ${argv.path} already exists. Do you want to overwrite? [y/N]`,
            (answer) => {
              resolve(answer)
              rl.close()
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
      project: { alias: 'p', description: 'Path to the tsconfig file', default: './tsconfig.json' },
      input: {
        alias: 'i',
        description: 'Path to the file that has providers',
        default: 'src/wire.ts', // TODO Relative from tsconfig.json
      },
      output: {
        alias: 'o',
        description: 'Path to the output file',
        default: 'src/wire-generated.ts',
      },
    },
    async (argv) => {
      try {
        const { performance } = await import('perf_hooks')
        const start = performance.now()
        run({
          tsConfigFilePath: argv.project,
          inputFilePath: argv.input,
          outputFilePath: argv.output,
        })
        const end = performance.now()
        console.log(`\n  Created: ${argv.output}\n  Done in ${end - start}ms`)
      } catch (e: any) {
        console.error(chalk.red(e))
      }
    }
  )
  .alias({ h: 'help', v: 'version' }).argv
