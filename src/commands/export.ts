import {Args, Command, Flags} from '@oclif/core'

export default class Export extends Command {
  static override args = {
    profile: Args.string({
      description: 'AWS config profile to use to obtain credentials.',
      required: true,
    }),
  }

  static override description = 'Exports AWS credentials for a valid given config profile.'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static override flags = {
    print: Flags.boolean({
      char: 'p',
      default: false,
      description: 'Whether to print exported credentials in terminal or not.',
    }),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Export)
    this.log("args:")
    Object.entries(args).map(([prop, val]) => {
      this.log(`    '${prop}': '${val}'`);
    })
    this.log("flags:")
    Object.entries(flags).map(([prop, val]) => {
      this.log(`    '${prop}': '${val}'`);
    })
  }
}
