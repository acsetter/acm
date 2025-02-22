import { SsoProfile } from '@aws-sdk/credential-provider-sso';
import { readFile } from 'fs/promises';
import { parse } from 'ini';

export type ConfigInstance = {
    profiles: Map<string, Record<string, string | undefined>>;
    ssoSessions: Map<string, Record<string, string | undefined>>;
};

export class Config {
    public static readonly folderPath =
        process.platform === 'win32'
            ? `${process.env.USERPROFILE}\\.aws`
            : `${process.env.HOME}/.aws`;
    private static _data: Promise<ConfigInstance>;

    public static get data(): Promise<ConfigInstance> {
        if (!Config._data) {
            Config._data = Config.loadConfigFile(`${this.folderPath}/config`);
        }

        return Config._data;
    }

    public static async getSsoProfile(profileName: string): Promise<SsoProfile> {
        const profile = (await Config.data).profiles.get(profileName);
        if (!profile) {
            throw new Error(`Profile '${profileName}' not found`);
        }
        const ssoSession = profile.sso_session
            ? (await Config._data).ssoSessions.get(profile.sso_session)
            : undefined;
        const profileData = {
            ...(ssoSession ?? {}),
            ...profile,
        };

        if (!profileData.sso_start_url) {
            throw new Error(`sso_start_url is required but missing in profile '${profileName}'`);
        }
        if (!profileData.sso_account_id) {
            throw new Error(`sso_account_id is required but missing in profile '${profileName}'`);
        }
        if (!profileData.sso_region) {
            throw new Error(`sso_region is required but missing in profile '${profileName}'`);
        }
        if (!profileData.sso_role_name) {
            throw new Error(`sso_role_name is required but missing in profile '${profileName}'`);
        }

        return profileData as SsoProfile;
    }

    private static async loadConfigFile(filePath: string): Promise<ConfigInstance> {
        return readFile(filePath, 'utf-8')
            .then(parse)
            .then(data => {
                const config = {
                    profiles: new Map<string, Record<string, string | undefined>>(),
                    ssoSessions: new Map<string, Record<string, string | undefined>>(),
                };

                Object.entries(data).map(([header, section]) => {
                    const { sectionType, sectionName } = Config.parseConfigSectionHeader(header);

                    if (sectionType === 'profile') {
                        config.profiles.set(sectionName, section);
                    } else if (sectionType === 'sso-session') {
                        config.ssoSessions.set(sectionName, section);
                    }
                });

                return config;
            });
    }

    private static parseConfigSectionHeader(header: string): {
        sectionType: string;
        sectionName: string;
    } {
        const trimmed = header.trim();
        const sectionType = trimmed.split(' ')[0].toLowerCase();

        return {
            sectionType: sectionType === 'default' ? 'profile' : sectionType,
            sectionName: trimmed.slice(trimmed.indexOf(' ') + 1),
        };
    }
}
