import { assertDefined, sleep } from "../src/utils";

describe('utils', () => {
    describe('sleep', () => {
        it('should sleep for 100ms', async () => {
            const start = Date.now();
            await sleep(100);
            expect(Date.now() - start).toBeGreaterThanOrEqual(99);
        });
    });

    describe('assertDefined', () => {
        it('should not throw an error if value is defined', () => {
            expect(() => assertDefined('value', 'value is undefined')).not.toThrow();
        });

        it('should throw an error if value is undefined', () => {
            expect(() => assertDefined(undefined, 'value is undefined')).toThrow('value is undefined');
        });
    });
});
