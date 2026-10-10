## 2026-10-10 - Unmemoized Lists in Components with Frequent Timers
**Learning:** Having a timer state (`setInterval` updating every second) in the same component as unmemoized list processing (`.filter`, `.map`, etc) causes severe performance degradation, as the expensive array operations are re-run 60 times a minute unnecessarily.
**Action:** Always memoize derived list computations (`filteredModules`, `allAvailableModules`) using `useMemo` when they exist in components that have fast-updating local state like timers or typing inputs.
