export const BRAND = Symbol("__brand");

export type Brand<T, U> = T & { [BRAND]: U };

export type RemoveBrand<T> = T[Exclude<keyof T, typeof BRAND>];
