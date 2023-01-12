import { execSync } from 'child_process'
import { describe, expect, it } from 'vitest'

function runCli(arg: string): string {
  return execSync(`tsx src/cli.ts ${arg}`).toString()
}

describe('cli help command snapshot test', () => {
  it.each(['--help', '-h', 'init --help', 'init -h'])('%s', (arg) => {
    expect(runCli(arg)).toMatchSnapshot()
  })
})
