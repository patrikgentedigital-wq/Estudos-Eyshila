## 2023-10-24 - Memoizing heavy calculations on Dashboard and Performance screens
**Learning:** Functions like `getStudyRecommendation` and `getSubjectScores` iterate over thousands of objects (mock questions and previous attempts) synchronously. If these are not memoized, they block the main thread on every render causing noticeable lag in the React UI.
**Action:** Always verify if expensive data aggregation/filtering in the main render thread can be cached with `useMemo`, paying close attention to dependencies to avoid stale state.
