import { STSClient } from "@aws-sdk/client-sts";
import { fromSSO } from "@aws-sdk/credential-provider-sso";
import { SSO } from "./sso";

export class STS {
    private constructor(private _client: Promise<STSClient>) {}

    public get client() {
        return this._client;
    }

    public async credentials() {
        return await (await this._client).config.credentials({ forceRefresh: true });
    }

    public static fromSSO(profile?: string): STS {
        return new STS(this.clientFromSSO(profile ?? 'default'));
    }

    private static async clientFromSSO(profile: string): Promise<STSClient> {
        // TODO: profile validation
        const client = new STSClient({
            credentials: fromSSO({ profile }),
        });

        await client.config.credentials().catch(() => SSO.login(profile))

        return client;
    }
}