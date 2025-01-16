---
'@torch-finance/core': minor
---

refactor: Rename 'amount' to 'value' in Allocation and related classes

- Updated the Allocation class and its schema to replace the 'amount' property with 'value' for better clarity and consistency.
- Modified related classes and utility functions to reflect this change, ensuring all references to 'amount' are updated to 'value'.
- Adjusted unit tests to validate the new property name and ensure functionality remains intact.
