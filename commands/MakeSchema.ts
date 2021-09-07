import { args, BaseCommand, flags } from '@adonisjs/ace'
import { promisify } from 'util'
import { execFile as childProcessExec } from 'child_process'
import { join } from 'path'
const exec = promisify(childProcessExec)

export default class MakeSchema extends BaseCommand {
  private async execCommand(command: string, commandArgs: string[]) {
    const { stdout, stderr } = await exec(command, commandArgs, {
      env: {
        ...process.env,
        FORCE_COLOR: 'true',
      },
    })
    if (stdout) {
      console.log(stdout.trim())
    }

    if (stderr) {
      console.log(stderr.trim())
    }
  }

  /**
   * Command Name is used to run the command
   */
  public static commandName = 'make:schema'

  /**
   * Command Name is displayed in the "help" output
   */
  public static description =
    'Create a Schema from mongoose database by manuel gostosinha gameplays'

  /**
   * The name of the model file.
   */
  @args.string({ description: 'Name of the mongoose schema' })
  public name: string

  /**
   * Defines if we generate the controller for the model.
   */
  @flags.boolean({
    name: 'controller',
    alias: 'c',
    description: 'Generate the controller for the model',
  })
  public controller: boolean

  public async run() {
    const stub = join(__dirname, '..', 'templates', 'schema.txt')
    const otherstub = join(__dirname, '..', 'templates', 'interface.txt')

    const path = this.application.resolveNamespaceDirectory('schemas')

    this.generator
      .addFile(this.name, { pattern: 'pascalcase', form: 'singular' })
      .stub(stub)
      .destinationDir(path || 'app/Schemas')
      .useMustache()
      .appRoot(this.application.cliCwd || this.application.appRoot)
    this.generator
      .addFile(this.name, { pattern: 'pascalcase', form: 'singular', suffix: '.interface' })
      .stub(otherstub)
      .destinationDir(path || 'contracts/interfaces')
      .useMustache()
      .appRoot(this.application.cliCwd || this.application.appRoot)
    await this.generator.run()
    this.logger.info('Schema created ' + this.name + 'Schema')
    this.logger.info('Interface created ' + this.name)
    if (this.controller) {
      await this.execCommand('node', ['ace', 'make:controller', this.name, '--resource'])
    }
  }
}
