---
'@torch-finance/core': patch
---

Fix sign method in RatePayload, should use cell.hash() but not cell.toBOC()
