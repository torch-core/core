---
'@torch-finance/core': minor
---

Introduce CallbackPayload class and update AddressSchema

- Added a new `CallbackPayload` class with validation schema for handling callback data.
- Updated `AddressSchema` to improve string parsing functionality.
- Enhanced `SignedRate` class to ensure signature is stored and retrieved in hex format.
- Added unit tests for `CallbackPayload` to validate its creation and JSON conversion.
- Updated `index.ts` to export the new `CallbackPayload` and its schema.
