import { assertDefined, assertString, sleep } from "../src/utils";

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

    describe('assertString', () => {
        it('should not throw an error if value is a string', () => {
            expect(() => assertString('value', 'value is not a string')).not.toThrow();
        });

        it('should throw an error if value is not a string', () => {
            expect(() => assertString(123, 'value is not a string')).toThrow('value is not a string');
        });
    });
});
