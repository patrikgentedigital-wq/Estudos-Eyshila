## 2026-10-07 - React useMemo Optimization
**Learning:** Found that heavy derivations inside React function components (like array filtering and reductions) were recalculated on every render, causing performance degradation during frequent state updates.
**Action:** Always wrap computationally expensive array operations inside `useMemo` hooks with proper dependency arrays, specifically avoiding memoization of simple property access where the overhead is not justified.
