export const sleep = async (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function assertDefined<T>(value: T | undefined, message: string): asserts value is T {
    if (value === undefined) {
        throw new Error(message);
    }
};
