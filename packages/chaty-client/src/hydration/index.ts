import { botHydration } from './bot'

export * from './server'

/**
 * Functions to map from one object to another
 */
export type MappingFns<Input, Output, Key extends keyof Output> = Record<
  Key,
  (value: Input, context: unknown) => Output[Key]
>

/**
 * Key mapping information
 */
export type KeyMapping<Input, Output> = Record<keyof Input, keyof Output>

/**
 * Hydration information
 */
export type Hydrate<Input, Output> = {
  keyMapping: Partial<KeyMapping<Input, Output>>
  functions: MappingFns<Input, Output, keyof Output>
  initialHydration: () => Partial<Output>
}

/**
 * Hydrate some data by transforming raw input into structured output using mapping rules.
 *
 * @example
 * // Define input type (raw API response)
 * interface ApiUser {
 *   user_id: string;
 *   name: string;
 *   created_at: string;
 * }
 *
 * // Define output type (internal model)
 * interface User {
 *   id: string;
 *   displayName: string;
 *   createdAt: number;
 *   verified: boolean;
 * }
 *
 * // Define hydration rules
 * const userHydration: Hydrate<ApiUser, User> = {
 *   // Rename keys: input key -> output key
 *   keyMapping: {
 *     created_at: "createdAt",  // "created_at" becomes "createdAt"
 *     user_id: "id"             // "user_id" becomes "id"
 *   },
 *   // Transform values: output key -> transformation function
 *   functions: {
 *     // Convert date string to timestamp (milliseconds)
 *     createdAt: (input) => new Date(input.created_at).getTime(),
 *     // Map input.name to displayName
 *     displayName: (input) => input.name,
 *     // Map input.user_id to id
 *     id: (input) => input.user_id
 *   },
 *   // Default values for fields not present in input
 *   initialHydration: () => ({ verified: false })
 * };
 *
 * // Usage:
 * const apiData = { user_id: "123", name: "John", created_at: "2024-01-01T00:00:00Z" };
 * const user = hydrateInternal(userHydration, apiData, context);
 * // Result: { id: "123", displayName: "John", createdAt: 1704067200000, verified: false }
 *
 * @param hydration - Hydration configuration containing key mapping, transformation functions, and default values
 * @param input - Raw input data to transform
 * @param context - Additional context passed to transformation functions
 * @returns Fully hydrated output object
 */
function hydrateInternal<Input extends object, Output>(
  hydration: Hydrate<Input, Output>,
  input: Input,
  context: unknown
): Output {
  return (Object.keys(input) as (keyof Input)[]).reduce((acc, key) => {
    let targetKey, value
    try {
      targetKey = hydration.keyMapping[key] ?? key
      value = hydration.functions[targetKey as keyof Output](input, context)
    } catch {
      if (key === 'partial') {
        return {
          ...acc,
          partial: input['partial' as never],
        }
      }
      if (key === 'type') return acc
      console.debug(`Skipping key ${String(key)} during hydration!`)
      return acc
    }

    return {
      ...acc,
      [targetKey]: value,
    }
  }, {} as Output)
}

export const hydrators = {
  bot: botHydration,
}

export type Hydrators = typeof hydrators

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ExtractInput<T> = T extends Hydrate<infer I, any> ? I : never

// example: Specific hydration
// type BotHydration = Hydrate<Bot, HydratedBot>
//
// ExtractOutput<BotHydration>
//   → Captures "HydratedBot" and returns it
//   → Result: HydratedBot
//
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ExtractOutput<T> = T extends Hydrate<any, infer O> ? O : never

/**
 * Hydrate some input with a given type
 * @param type Type
 * @param input Input Object
 * @param initial Whether this is the initial hydration
 * @returns Hydrated Object
 */
export function hydrate<T extends keyof Hydrators>(
  type: T,
  input: Partial<ExtractInput<Hydrators[T]>>,
  context: unknown,
  initial?: boolean
): ExtractOutput<Hydrators[T]> {
  return hydrateInternal(
    hydrators[type] as never,
    initial ? { ...hydrators[type].initialHydration(), ...input } : input,
    context
  ) as ExtractOutput<Hydrators[T]>
}
