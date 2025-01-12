import { GetCallerIdentityCommand, STSClient } from "@aws-sdk/client-sts";
import { fromSSO } from "@aws-sdk/credential-provider-sso";
import { SSO } from "./sso";
import { fromEnv } from "@aws-sdk/credential-providers";

export class STS {
    private constructor(private _client: Promise<STSClient>) {}

    public get client() {
        return this._client;
    }

    public async credentials() {
        return (await this._client).config.credentials({ forceRefresh: true });
    }

    public static fromSSO(profile?: string): STS {
        return new STS(this.clientFromSSO(profile ?? 'default'));
    }

    public static fromEnv(): STS {
        return new STS(this.clientFromEnv());
    }

    private static async clientFromSSO(profile: string): Promise<STSClient> {
        // if (!Config.profileExists(profile)) {
        //     throw new Error(`Unable to find profile '${profile}' in AWS config file.`);
        // }
        const client = new STSClient({
            credentials: fromSSO({ profile }),
        });
        // checks if SSO access_token is expired
        await client.config.credentials().catch(() => SSO.login(profile))

        return client;
    }

    private static async clientFromEnv(): Promise<STSClient> {
        const client = new STSClient({
            credentials: fromEnv(),
        })

        await client.config
            .credentials({ forceRefresh: true })
            .then(() => client.send(new GetCallerIdentityCommand({})).catch())
            .catch(() => {
                throw new Error('AWS Credentials in environment are invalid or not set.');
            });

        return client;
    }
}
