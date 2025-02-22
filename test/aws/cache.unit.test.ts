import { readFile } from "fs/promises";
import { Cache, CacheEntry } from "../../src/aws/cache";

describe('Cache', () => {
    const mockFilePath = 'test/mocks/mock-cache.json';

    describe('read', () => {
        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should read the mock cache file', async () => {
            Object.defineProperty(Cache, 'filePath', { value: mockFilePath });
            const expectedData =  new Map(
                await readFile(mockFilePath, 'utf-8').then(
                    data => JSON.parse(data)).then(
                        data => data.map((entry: CacheEntry) => [entry.startUrl, entry])));

            expect(await Cache['read']()).toEqual(expectedData);
        });

        it('should return an empty object if the cache file does not exist', async () => {
            Object.defineProperty(Cache, 'filePath', { value: 'non-existent-file' });

            expect(await Cache['read']()).toEqual(new Map());
        });
    });
});