
## 2024-10-13 - [O(N) HashMap Over Avoidable Nested Loops]
**Learning:** Avoid nested loops involving Date creation (`new Date()`) inside a 31-day loop. Creating Date objects repeatedly inside loops scales poorly when iterating over an active array of attempt dates.
**Action:** Replace nested loops that parse dates with O(N) pre-processing, mapping instances into HashMaps to avoid unneeded computation, caching and memoizing the result to reduce redundant component renders.
