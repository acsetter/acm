import { readFile } from 'fs/promises';
import { parse } from 'ini';

export type ConfigSection = {
    sectionType: 'default' | 'profile' | 'sso-session' | string;
    sectionName: 'default' | string;
    section: Record<string, string | undefined>;
};

export class Config {
    public static async loadConfigFile(filePath: string): Promise<ConfigSection[]> {
        return await readFile(filePath, 'utf-8')
            .then(parse)
            .then(data =>
                Object.entries(data).map(([header, section]) => {
                    const { sectionType, sectionName } = this.parseConfigSectionHeader(header);
                    return { sectionType, sectionName, section };
                }),
            );
    }

    private static parseConfigSectionHeader(header: string): {
        sectionType: string;
        sectionName: string;
    } {
        const trimmed = header.trim();

        return {
            sectionType: trimmed.split(' ')[0].toLowerCase(),
            sectionName: trimmed.slice(trimmed.indexOf(' ') + 1),
        };
    }
}
