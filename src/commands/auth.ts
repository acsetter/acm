import { Args, Command } from '@oclif/core';
import { SSO } from '../aws/sso';
import { Config } from '../aws/config';

export default class Auth extends Command {
    static override args = {
        profile: Args.string({ description: 'SSO profile to use', required: true }),
    };

    static override description = 'describe the command here';

    static override examples = ['<%= config.bin %> <%= command.id %>'];

    static override flags = {};

    public async run(): Promise<void> {
        const { args } = await this.parse(Auth);
        const ssoProfile = await Config.getSsoProfile(args.profile);

        SSO.authorize(ssoProfile);
    }
}
