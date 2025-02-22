import { mkdir, readFile, writeFile } from 'fs/promises';
import { Config } from './config';
import { assertString } from '../utils';
import { join, parse } from 'node:path';

export type CacheEntry = {
    accessToken?: string;
    expiresAt?: string;
    clientId?: string;
    clientSecret?: string;
    refreshToken?: string;
    region?: string;
    startUrl: string;
};

export class Cache {
    public static readonly filePath = join(Config.folderPath, 'cache', 'acm-sso.json');
    private static _data: Promise<Map<string, CacheEntry>>;

    public static get data(): Promise<Map<string, CacheEntry>> {
        if (!Cache._data) {
            Cache._data = Cache.read();
        }

        return Cache._data;
    }

    public static async get(startUrl: string): Promise<CacheEntry | undefined> {
        return (await Cache.data).get(startUrl);
    }

    public static async set(entry: CacheEntry): Promise<void> {
        await Cache.write((await Cache.data).set(entry.startUrl, entry));
        await Cache.data;
    }

    private static async read(): Promise<Map<string, CacheEntry>> {
        return new Map(
            (
                await readFile(Cache.filePath, 'utf-8')
                    .then(data => Cache.validate(JSON.parse(data)))
                    .catch(() => [])
            ).map(entry => [entry.startUrl, entry]),
        );
    }

    private static async write(data: Map<string, CacheEntry>) {
        Cache._data = writeFile(Cache.filePath, JSON.stringify(Array.from(data.values()), null, 2))
            .catch(async err => {
                if (err.code === 'ENOENT') {
                    return await mkdir(parse(Cache.filePath).dir, { recursive: true }).then(() =>
                        Cache.write(data),
                    );
                }

                throw err;
            })
            .then(() => Cache.read());
    }

    private static validate(data: unknown): CacheEntry[] {
        if (!Array.isArray(data)) {
            throw new Error(`Expected cache data in file '${Cache.filePath}' to be an array.`);
        }

        return data.map((entry, index) => Cache.validateEntry(entry, index));
    }

    private static validateEntry(entry: unknown, index: number): CacheEntry {
        if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
            throw new Error(
                `Expected entry at index ${index} to be an object in file '${Cache.filePath}'.`,
            );
        }

        const cacheEntry = entry as Partial<CacheEntry>;
        assertString(
            cacheEntry.startUrl,
            `startUrl is missing in entry at index ${index} in file '${Cache.filePath}'`,
        );

        return { ...cacheEntry, startUrl: cacheEntry.startUrl };
    }
}
