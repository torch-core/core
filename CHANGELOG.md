# @torch-finance/core

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
