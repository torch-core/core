# @torch-finance/core

## 1.3.3

### Patch Changes

- 84afc84: Change Asset jetton address to raw string

## 1.3.2

### Patch Changes

- ecdf4de: Fix invalid asset type and improve unittest to cover all types

## 1.3.1

### Patch Changes

- c371edb: Fix sign method in RatePayload, should use cell.hash() but not cell.toBOC()

## 1.3.0

### Minor Changes

- 163c21b: refactor: Rename 'amount' to 'value' in Allocation and related classes

  - Updated the Allocation class and its schema to replace the 'amount' property with 'value' for better clarity and consistency.
  - Modified related classes and utility functions to reflect this change, ensuring all references to 'amount' are updated to 'value'.
  - Adjusted unit tests to validate the new property name and ensure functionality remains intact.

## 1.2.1

### Patch Changes

- 00ab235: Remove CallbackPayload and enhance schemas with detailed examples

  - Deleted the `CallbackPayload` class and its schema from the codebase.
  - Updated `AddressSchema`, `AllocationSchema`, and `AssetSchema` to include comprehensive examples and descriptions for better clarity.
  - Enhanced `RatePayload` and `SignedRate` classes with additional examples for serialization and deserialization.
  - Improved the `Comparable`, `Cellable`, and `Marshallable` interfaces with clearer documentation.
  - Updated `index.ts` to reflect the removal of `CallbackPayload` and ensure proper exports of existing schemas.

## 1.2.0

### Minor Changes

- 20d274c: Introduce CallbackPayload class and update AddressSchema

  - Added a new `CallbackPayload` class with validation schema for handling callback data.
  - Updated `AddressSchema` to improve string parsing functionality.
  - Enhanced `SignedRate` class to ensure signature is stored and retrieved in hex format.
  - Added unit tests for `CallbackPayload` to validate its creation and JSON conversion.
  - Updated `index.ts` to export the new `CallbackPayload` and its schema.

## 1.1.1

### Patch Changes

- 5a67643: Update package.json to include additional files in the distribution

  - Added "files" field to package.json to specify included files: dist, README.md, CHANGELOG.md, and LICENSE, ensuring proper packaging for distribution.

## 1.1.0

### Minor Changes

- fd16909: Add asset ID conversion and dictionary utility

  - Implemented `fromID` static method in the `Asset` class to convert asset IDs back to `Asset` instances, enhancing asset management capabilities.
  - Introduced a new utility function `coinsMarshaller` in `dictionary.ts` for serializing and deserializing coin values, improving data handling.
  - Updated `index.ts` to export the new `coinsMarshaller` function.
  - Added unit tests in `asset.spec.ts` to validate the new ID conversion functionality.

## 1.0.0

### Major Changes

- db2ed82: Enhance project structure with new classes and CI workflow

  - Added core classes for asset management, including `Asset`, `Allocation`, and `RatePayload`, with schema validation using Zod.
  - Implemented serialization and deserialization methods for assets and allocations, enabling efficient storage in nested cells.
  - Introduced utility functions for normalizing allocations and handling nested coin storage.
  - Created unit tests for new classes and utilities to ensure functionality and correctness.
  - Established a GitHub Actions workflow for automated site building and documentation generation upon release.
  - Updated `.gitignore` to include documentation files and added `typedoc` for generating API documentation.
