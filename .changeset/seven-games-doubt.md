---
'core': major
---

Enhance project structure with new classes and CI workflow

- Added core classes for asset management, including `Asset`, `Allocation`, and `RatePayload`, with schema validation using Zod.
- Implemented serialization and deserialization methods for assets and allocations, enabling efficient storage in nested cells.
- Introduced utility functions for normalizing allocations and handling nested coin storage.
- Created unit tests for new classes and utilities to ensure functionality and correctness.
- Established a GitHub Actions workflow for automated site building and documentation generation upon release.
- Updated `.gitignore` to include documentation files and added `typedoc` for generating API documentation.
