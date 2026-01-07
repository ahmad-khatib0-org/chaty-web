type AnyFn = (...args: any[]) => any

/**
 * @template T extends AnyFn - any function 
 * @param fn - any function to be delayed, E,g user typing
 * @param delay - time in milliseconds
 * @returns returns a wrapped function with a .cancel(), .flush methods.
 *
 * @example
 * 
  import React, { useEffect, useMemo } from "react";
  import { debounce } from "./utils/timing";

  function Search({ onSearch }: { onSearch: (q: string) => void }) {
    // useMemo so debounced function identity doesn't change every render
    const debouncedSearch = useMemo(() => debounce(onSearch, 500), [onSearch]);

    useEffect(() => {
      // cleanup on unmount
      return () => debouncedSearch.cancel();
    }, [debouncedSearch]);

    return (
      <input
        type="text"
        onChange={(e) => debouncedSearch(e.target.value)}
      />
    );
  }
 */
export function debounce<T extends AnyFn>(fn: T, delay = 300) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let lastArgs: any
  let lastThis: any

  const debounced = function (this: any, ...args: any[]) {
    lastArgs = args
    lastThis = this

    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      timeoutId = null
      fn.apply(lastThis, lastArgs)
      lastArgs = lastThis = undefined
    }, delay)
  }

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
    lastArgs = lastThis = undefined
  }

  debounced.flush = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
      fn.apply(lastThis, lastArgs)
      lastArgs = lastThis = undefined
    }
  }

  return debounced as T & { cancel: () => void; flush: () => void }
}

/**
 * @template T extends AnyFn - throttle runs the function at most once within specified time
 * @param fn - any function to be throttled, E,g a running task
 * @param wait - the time in milliseconds for each run
 * @param options - leading (run immediately) and trailing (run after the last call)
 * @returns returns a wrapped function with a .cancel() method.
 * @example
 * const log = (v: string) => console.log(v);
 *
 * const t = throttle(log, 250, { leading: true, trailing: true });
 *
 * t("a"); // immediately (leading)
 *
 * t("b"); // ignored until 250ms passes, then trailing will run with last arg ("b")
 *
 * t.cancel(); // if you need to cancel scheduled trailing call
 */
export function throttle<T extends AnyFn>(
  fn: T,
  wait = 200,
  options: { leading?: boolean; trailing?: boolean } = { leading: true, trailing: true }
) {
  let lastCallTime = 0
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let lastArgs: any
  const leading = options.leading ?? true
  const trailing = options.trailing ?? true

  const invoke = (time: number) => {
    lastCallTime = time
    fn(...lastArgs)
    lastArgs = undefined
  }

  const throttled = function (this: any, ...args: any[]) {
    const now = Date.now()
    // prevent immediate call if leading=false
    if (!lastCallTime && !leading) lastCallTime = now

    const remaining = wait - (now - lastCallTime)
    lastArgs = args

    if (remaining <= 0) {
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
      invoke(now)
    } else if (!timeoutId && trailing) {
      // schedule trailing call
      timeoutId = setTimeout(() => {
        timeoutId = null
        // if leading was false, we want to invoke with current time
        invoke(Date.now())
      }, remaining)
    }
  }

  throttled.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
    lastCallTime = 0
    lastArgs = undefined
  }

  return throttled as T & { cancel: () => void }
}
