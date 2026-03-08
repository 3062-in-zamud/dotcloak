import { EventEmitter } from 'node:events'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { promptHiddenValue } from '../../../src/cli/prompt-secret.js'

class FakeInput extends EventEmitter {
  isTTY = true
  isRaw = false
  setRawMode = vi.fn((mode: boolean) => {
    this.isRaw = mode
  })
  setEncoding = vi.fn()
  resume = vi.fn()
  pause = vi.fn()
}

class FakeOutput {
  isTTY = true
  buffer = ''
  write = vi.fn((chunk: string) => {
    this.buffer += chunk
    return true
  })
}

describe('promptHiddenValue', () => {
  let input: FakeInput
  let output: FakeOutput

  beforeEach(() => {
    input = new FakeInput()
    output = new FakeOutput()
  })

  it('reads a hidden value and restores terminal mode', async () => {
    const prompt = promptHiddenValue('Enter secret: ', { input, output })

    input.emit('data', 's')
    input.emit('data', 'e')
    input.emit('data', 'c')
    input.emit('data', 'r')
    input.emit('data', 'e')
    input.emit('data', 't')
    input.emit('data', '\r')

    await expect(prompt).resolves.toBe('secret')
    expect(output.buffer).toBe('Enter secret: \n')
    expect(input.setRawMode).toHaveBeenNthCalledWith(1, true)
    expect(input.setRawMode).toHaveBeenLastCalledWith(false)
  })

  it('supports backspace without echoing characters', async () => {
    const prompt = promptHiddenValue('Enter secret: ', { input, output })

    input.emit('data', 'a')
    input.emit('data', 'b')
    input.emit('data', '\u007f')
    input.emit('data', 'c')
    input.emit('data', '\n')

    await expect(prompt).resolves.toBe('ac')
    expect(output.buffer).toBe('Enter secret: \n')
  })

  it('fails outside a TTY', async () => {
    input.isTTY = false

    await expect(promptHiddenValue('Enter secret: ', { input, output })).rejects.toThrow(
      'Cannot prompt for a secret in a non-interactive terminal.',
    )
  })
})
