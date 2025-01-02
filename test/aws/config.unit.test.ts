import { Config } from '../../src/aws/config';

describe('Config', () => {
    const mockConfigFilePath = 'test/mocks/mock-config.ini';

    describe('loadConfigFile', () => {
        test('should load a config file', async () => {
            const result = await Config.loadConfigFile(mockConfigFilePath);
            // console.log(JSON.stringify(result, null, 2));

            expect(result).toBeDefined();
            expect(result.length).toBeGreaterThanOrEqual(4);
            expect(result.find(section => section.sectionType === 'default')).toBeDefined();
            expect(result.find(section => section.sectionType === 'profile')).toBeDefined();
            expect(result.find(section => section.sectionType === 'sso-session')).toBeDefined();
        });
    });
});
