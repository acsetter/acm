import {
    SSOOIDCClient,
    CreateTokenCommand,
    RegisterClientCommand,
    StartDeviceAuthorizationCommand,
    CreateTokenCommandOutput,
    AuthorizationPendingException,
} from '@aws-sdk/client-sso-oidc';
import { SsoProfile } from '@aws-sdk/credential-provider-sso';
import { GetRoleCredentialsCommand, SSOClient } from '@aws-sdk/client-sso';
import open from 'open';
import { assertDefined, sleep } from '../utils';
import { Cache } from './cache';

type CreateTokenParams = {
    clientId: string;
    clientSecret: string;
    deviceCode: string;
};

export class SSO {
    public static readonly CLIENT_NAME = 'acm-sso';
    private static _client: SSOOIDCClient;

    public static get client(): SSOOIDCClient {
        if (!SSO._client) {
            SSO._client = new SSOOIDCClient({});
        }

        return SSO._client;
    }

    public static async getRoleCredentials({
        accessToken,
        accountId,
        region,
        roleName,
    }: {
        accessToken: string;
        accountId: string;
        region: string;
        roleName: string;
    }) {
        return (
            await new SSOClient({ region }).send(
                new GetRoleCredentialsCommand({
                    accessToken,
                    accountId,
                    roleName,
                }),
            )
        ).roleCredentials;
    }

    public static async authorize({ sso_start_url, sso_role_name, sso_account_id }: SsoProfile) {
        const { clientId, clientSecret } = await SSO.client.send(
            new RegisterClientCommand({
                clientName: SSO.CLIENT_NAME,
                clientType: 'public',
                scopes: ['sso:account:access'],
            }),
        );
        const { deviceCode, verificationUriComplete } = await SSO.client.send(
            new StartDeviceAuthorizationCommand({
                clientId,
                clientSecret,
                startUrl: sso_start_url,
            }),
        );

        assertDefined(verificationUriComplete, 'verificationUriComplete is not defined.');
        assertDefined(deviceCode, 'deviceCode is not defined.');
        assertDefined(clientId, 'clientId is not defined.');
        assertDefined(clientSecret, 'clientSecret is not defined.');
        open(verificationUriComplete);

        const { accessToken, expiresIn, refreshToken } = await this.createToken({
            clientId,
            clientSecret,
            deviceCode,
        });
        Cache.set({
            accessToken,
            clientId,
            clientSecret,
            expiresAt: new Date(Date.now() + expiresIn! * 1000).toISOString(),
            refreshToken,
            startUrl: sso_start_url,
        });

        return { accessToken, roleName: sso_role_name, accountId: sso_account_id };
    }

    private static async createToken({
        clientId,
        clientSecret,
        deviceCode,
    }: CreateTokenParams): Promise<CreateTokenCommandOutput> {
        let response: CreateTokenCommandOutput | undefined;
        while (!response) {
            try {
                response = await SSO.client.send(
                    new CreateTokenCommand({
                        clientId,
                        clientSecret,
                        grantType: 'urn:ietf:params:oauth:grant-type:device_code',
                        deviceCode,
                    }),
                );
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
}
