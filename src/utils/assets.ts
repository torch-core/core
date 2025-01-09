import { beginCell, Cell } from '@ton/core';
import { Asset } from '../classes/Asset';

// Constant
const MAX_ASSETS_PER_CELL = 3; // One cell can store up to 4 references: 3 for assets and 1 for recursion.

/**
 * Stores an array of assets into nested cells for efficient storage.
 *
 * @param assets - The array of Asset objects to store. They MUST be sorted in ascending order before being passed to this function.
 * @returns A function that accepts a Builder instance and stores the assets in nested cells.
 *
 * @example
 * ```typescript
 * const sortedAssets = assets.sort((a, b) => a.compare(b));
 * beginCell().storeRef(storeSortedAssetNested(sortedAssets)).endCell();
 * ```
 */
export function storeSortedAssetsNested(assets: Asset[]): Cell {
  const builder = beginCell();
  // Take the first MAX_ASSETS_PER_CELL assets for the current cell
  const currentAssets = assets.slice(0, MAX_ASSETS_PER_CELL);
  const remainingAssets = assets.slice(MAX_ASSETS_PER_CELL);

  // Store the current assets into the builder
  for (const asset of currentAssets) {
    builder.storeRef(asset.toCell());
  }

  // Recursively store remaining assets into a nested cell
  if (remainingAssets.length > 0) {
    builder.storeRef(storeSortedAssetsNested(remainingAssets));
  }

  return builder.endCell();
}

/**
 * Parses an array of assets from a nested cell.
 *
 * @param c - The nested cell to parse.
 * @returns An array of Asset objects.
 *
 * @example
 * ```typescript
 * const nestedCell = beginCell().store(storeSortedAssetNested(sortedAssets)).endCell();
 * const assets = parseAssetsFromNestedCell(nestedCell);
 * expect(assets).toEqual(sortedAssets);
 * ```
 */
export function parseAssetsFromNestedCell(c: Cell): Asset[] {
  const items: Asset[] = [];
  let sc = c.beginParse();

  // Process each cell and its references recursively
  while (sc.remainingRefs > 0) {
    // Parse up to `maxAssetsPerCell` assets from the current cell
    for (let i = 0; i < MAX_ASSETS_PER_CELL && sc.remainingRefs > 0; i++) {
      items.push(Asset.fromCell(sc.loadRef()));
    }

    // Check if there is a reference to the next layer
    if (sc.remainingRefs === 0) {
      break;
    }

    // If there is still a reference to the next layer, move to the next cell
    sc = sc.loadRef().beginParse();
  }

  return items;
}
