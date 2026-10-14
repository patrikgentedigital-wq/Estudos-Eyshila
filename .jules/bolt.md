## 2023-10-27 - [StudyHeatmap Performance Optimization]
**Learning:** Nested loops with date parsing inside React render blocks cause severe bottlenecks when parent components update state frequently. Pre-parsing string dates and creating a grouped lookup table transforms O(N * M) calendar operations into O(N + M).
**Action:** Use `React.useMemo` to memoize the data and use a hash map (`Map`) to pre-calculate attempts per day for constant-time lookups. Also, wrap the component in `React.memo` to prevent re-renders when parent state changes.
