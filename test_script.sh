#!/bin/bash
mkdir -p .jules
cat << 'MD' >> .jules/bolt.md
## $(date +%Y-%m-%d) - [O(N^2) Array Filtering Bottleneck]
**Learning:** Repetitive array filtering (`Array.prototype.filter`) combined with heavy object instantiations (like `new Date()`) inside loop iterations can cause significant frontend lag, especially in components rendering dynamic heatmaps based on large attempt datasets.
**Action:** Replace nested loops and repeated `.filter()` calls with a single `O(N)` grouping pass using a `Map` or hash table to cache necessary calculations.
MD
