## 2023-10-12 - Date parsing in loops
**Learning:** Parsing dates inside `Array.from` or `map` loops across a large array of objects on every render creates massive performance bottlenecks ($O(N \times M)$) in this codebase.
**Action:** Always extract date aggregations into a Hash Map ($O(M)$ time) before mapping over calendar days, and wrap the operation in `useMemo`. Ensure you use simple lengths for counts instead of attaching properties to every object.
