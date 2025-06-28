export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;

export type AsyncFunction<T = void> = () => Promise<T>;
export type AsyncFunctionWithArgs<TArgs, TReturn = void> = (
  args: TArgs
) => Promise<TReturn>;

export type ErrorHandler = (error: Error | unknown) => void;
export type SuccessHandler<T = unknown> = (data: T) => void;

export type FormErrors<T> = Partial<Record<keyof T, string>>;
export type FormTouched<T> = Partial<Record<keyof T, boolean>>;
