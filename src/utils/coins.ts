import { beginCell, Cell } from '@ton/core';

const MAX_COINS_PER_CELL = 7; // One cell can store up to 1023 bits, coin type is VarUint128, thus one cell can store up to 7 coins, and if there are more than 7 coins, the rest will be stored in a nested cell
/**
 * For every `maxCoinsPerCell` number of coins, store them in a nested cell
 * @param coins coins represented as bigint, the order should follow the same order as the nested asset cell
 * @returns a function that accepts a Builder instance and stores the coins in nested cells
 *
 * @example
 * ```typescript
 * const coins = [1n, 2n, 3n, 4n, 5n, 6n, 7n, 8n, 9n, 10n];
 * const nestedCoinCell = beginCell().storeRef(storeCoinsNested(coins)).endCell();
 * ```
 */
export function storeCoinsNested(coins: bigint[]): Cell {
  const builder = beginCell();
  // Take the first `maxCoinsPerCell` elements
  const currentLayer = coins.slice(0, MAX_COINS_PER_CELL);
  const remaining = coins.slice(MAX_COINS_PER_CELL);

  // Store the current layer's coins in the cell
  for (const value of currentLayer) {
    builder.storeCoins(value);
  }

  // If there are more coins, store the rest in a Reference
  if (remaining.length > 0) {
    builder.storeRef(storeCoinsNested(remaining));
  }

  return builder.endCell();
}

/**
 * Parses an array of coins from a nested cell.
 *
 * @param cell - The nested cell to parse.
 * @returns An array of coins represented as bigint.
 *
 * @example
 * ```typescript
 * const nestedCoinCell = beginCell().storeRef(storeCoinsNested(coins)).endCell();
 * const parsedCoins = parseCoinsFromNestedCell(nestedCoinCell);
 * expect(parsedCoins).toEqual(coins);
 * ```
 */
export function parseCoinsFromNestedCell(cell: Cell): bigint[] {
  const coins: bigint[] = [];
  let currentCell = cell.beginParse();

  while (currentCell.remainingBits > 0) {
    // Extract coins from the current cell
    for (let i = 0; i < MAX_COINS_PER_CELL && currentCell.remainingBits > 0; i++) {
      coins.push(currentCell.loadCoins());
    }

    // Move to the next referenced cell, if available
    if (currentCell.remainingRefs > 0) {
      currentCell = currentCell.loadRef().beginParse();
    }
  }

  return coins;
}
