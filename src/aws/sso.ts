import { exec } from "child_process";
import { SSOOIDCClient, CreateTokenCommand, RegisterClientCommand, StartDeviceAuthorizationCommand, CreateTokenCommandOutput, AuthorizationPendingException } from "@aws-sdk/client-sso-oidc";
import { SsoProfile } from "@aws-sdk/credential-provider-sso";
import open from "open";
import { assertDefined, sleep } from "../utils";
import { writeFile } from "fs/promises";

type CreateTokenParams = {
    clientId: string;
    clientSecret: string;
    deviceCode: string;
}

type ClientCacheInfo = {
    accessToken?: string;
    expiresAt?: string;
    clientId?: string;
    clientName: string;
    clientSecret?: string;
    refreshToken?: string;
    region?: string;
    startUrl?: string;
}

export class SSO {
    public static readonly CLIENT_NAME = 'acm-sso';
    private static _client: SSOOIDCClient;

    public static get client(): SSOOIDCClient {
        if (!SSO._client) {
            SSO._client = new SSOOIDCClient({});
        }

        return SSO._client;
    }

    public static async authorize({ sso_start_url }: SsoProfile) {
        return await SSO.client.send(new RegisterClientCommand({
            clientName: SSO.CLIENT_NAME,
            clientType: 'public',
            scopes: ['sso:account:access'],
        })).then(({ clientId, clientSecret }) => SSO.client.send(new StartDeviceAuthorizationCommand({
            clientId,
            clientSecret,
            startUrl: sso_start_url,
        })).then(({ deviceCode, verificationUriComplete }) => {
            if (!verificationUriComplete) throw new Error('Verification URI is not defined.');
            open(verificationUriComplete);
            assertDefined(deviceCode!, 'deviceCode is not defined.');
            assertDefined(clientId!, 'clientId is not defined.');
            assertDefined(clientSecret, 'clientSecret is not defined.');

            return this.createToken({ clientId, clientSecret, deviceCode }).then(({ accessToken, expiresIn, refreshToken }) => this.cacheClient({
                clientName: SSO.CLIENT_NAME,
                accessToken,
                clientId,
                clientSecret,
                expiresAt: new Date(Date.now() + expiresIn! * 1000).toISOString(),
                startUrl: sso_start_url,
                refreshToken,
            }));
        }));
    }

    private static async createToken({ clientId, clientSecret, deviceCode }: CreateTokenParams): Promise<CreateTokenCommandOutput> {
        let response: CreateTokenCommandOutput | undefined;
        while (!response) {
            try {
                response = await SSO.client.send(new CreateTokenCommand({
                    clientId,
                    clientSecret,
                    grantType: 'urn:ietf:params:oauth:grant-type:device_code',
                    deviceCode,
                }));
            } catch (error) {
                if (error instanceof AuthorizationPendingException) {
                    await sleep(1000);
                } else {
                    throw error;
                }
            }
        }

        return response;
    }

    private static async cacheClient(clientInfo: ClientCacheInfo) {
        await writeFile(`${SSO.CLIENT_NAME}.json`, JSON.stringify(clientInfo));
    }

    public static async login(profile: string): Promise<string> {
        return await new Promise((resolve, reject) =>
            exec(`aws sso login --profile ${profile}`, (error, stdout) => {
                if (error) reject(error);
                else resolve(stdout);
            }),
        );
    }

    public static async isAwsCliInstalled(): Promise<boolean> {
        return await new Promise((resolve) =>
            exec('aws --version', (error) => {
                resolve(!error);
            }),
        );
    }
}
