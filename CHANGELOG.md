# @torch-finance/core

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
