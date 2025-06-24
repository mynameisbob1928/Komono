export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Object ? DeepPartial<T[K]> : T[K];
};