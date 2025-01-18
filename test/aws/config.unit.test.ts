import { Config } from '../../src/aws/config';

describe('Config', () => {
    const mockConfigFilePath = 'test/mocks/mock-config.ini';

    describe('loadConfigFile', () => {
        test('should load a config file', async () => {
            const result = await Config['loadConfigFile'](mockConfigFilePath);

            expect(result).toBeDefined();
            expect(result.profiles.size).toBeGreaterThanOrEqual(3);
            expect(result.ssoSessions.size).toBeGreaterThanOrEqual(1);
        });
    });
});
