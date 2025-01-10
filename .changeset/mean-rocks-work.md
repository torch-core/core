---
'@torch-finance/core': patch
---

Remove CallbackPayload and enhance schemas with detailed examples

- Deleted the `CallbackPayload` class and its schema from the codebase.
- Updated `AddressSchema`, `AllocationSchema`, and `AssetSchema` to include comprehensive examples and descriptions for better clarity.
- Enhanced `RatePayload` and `SignedRate` classes with additional examples for serialization and deserialization.
- Improved the `Comparable`, `Cellable`, and `Marshallable` interfaces with clearer documentation.
- Updated `index.ts` to reflect the removal of `CallbackPayload` and ensure proper exports of existing schemas.
