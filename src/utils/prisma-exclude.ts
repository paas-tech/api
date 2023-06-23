
export function exclude<E extends object, Key extends keyof E>(project: E, keys: Key[]): Omit<E, Key> {
    return Object.fromEntries(
        Object.entries(project).filter(([key]) => !keys.includes(key as Key))
    ) as Omit<E, Key>;
}