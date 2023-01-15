import { execSync } from 'child_process'
import fs from 'fs'
import { describe, expect, it, beforeEach, afterEach } from 'vitest'

function runCli(arg: string): string {
  return execSync(`tsx src/cli.ts ${arg}`).toString()
}

describe('cli help command snapshot test', () => {
  it.each(['--help', '-h', 'init --help', 'init -h'])('%s', (arg) => {
    expect(runCli(arg)).toMatchSnapshot()
  })
})

describe('init command snapshot test', () => {
  beforeEach(() => {
    fs.mkdirSync('tmp/src', { recursive: true })
  })

  afterEach(() => {
    fs.rmSync('tmp', { recursive: true })
  })

  it('normal', () => {
    expect(runCli('init -p tmp/src/wire.ts')).toMatchSnapshot()
    expect(fs.readFileSync('tmp/src/wire.ts', 'utf-8')).toMatchSnapshot()
  })
})
