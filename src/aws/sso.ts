import { loadSharedConfigFiles } from '@aws-sdk/shared-ini-file-loader';
import { exec } from 'child_process';

export class SSO {
    public static async login(profile: string): Promise<string> {
        return await new Promise((resolve, reject) =>
            exec(`aws sso login --profile ${profile}`, (error, stdout) => {
                if (error) reject(error);
                else resolve(stdout);
            }),
        );
    }

    public static async isAwsCliInstalled(): Promise<boolean> {
        return await new Promise(resolve =>
            exec('aws --version', error => {
                resolve(!error);
            }),
        );
    }

    public static async profileExists(profile: string): Promise<boolean> {
        const { configFile } = await loadSharedConfigFiles();
        return Object.keys(configFile).includes(profile);
    }
}
