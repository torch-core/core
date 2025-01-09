---
'@torch-finance/core': minor
---

Add asset ID conversion and dictionary utility

- Implemented `fromID` static method in the `Asset` class to convert asset IDs back to `Asset` instances, enhancing asset management capabilities.
- Introduced a new utility function `coinsMarshaller` in `dictionary.ts` for serializing and deserializing coin values, improving data handling.
- Updated `index.ts` to export the new `coinsMarshaller` function.
- Added unit tests in `asset.spec.ts` to validate the new ID conversion functionality.
