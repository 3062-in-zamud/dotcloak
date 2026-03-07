import { Command } from 'commander'
import { registerEditCommand } from './commands/edit.js'
import { registerInitCommand } from './commands/init.js'
import { registerKeyCommand } from './commands/key.js'
import { registerListCommand } from './commands/list.js'
import { registerRunCommand } from './commands/run.js'
import { registerSetCommand } from './commands/set.js'
import { registerStatusCommand } from './commands/status.js'
import { registerUnsetCommand } from './commands/unset.js'

const program = new Command()

program
  .name('dotcloak')
  .description("Encrypt your .env so AI coding tools can't read it")
  .version('0.1.0')

registerInitCommand(program)
registerRunCommand(program)
registerListCommand(program)
registerSetCommand(program)
registerUnsetCommand(program)
registerStatusCommand(program)
registerEditCommand(program)
registerKeyCommand(program)

program.parse()
