import { useMemo, type DependencyList } from 'react'

// Wraps `items.filter(predicate)` in useMemo so the filtered list is only
// recomputed when `items` or one of the caller-supplied `deps` actually
// changes, instead of on every render (e.g. every keystroke in an unrelated
// field). `predicate` itself is intentionally excluded from the dependency
// check — callers list the primitive filter values it closes over in `deps`.
export function useFilteredList<T>(items: T[], predicate: (item: T) => boolean, deps: DependencyList): T[] {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => items.filter(predicate), [items, ...deps])
}
