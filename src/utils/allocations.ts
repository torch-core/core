import { Allocation } from '../classes/Allocation';
import { Asset } from '../classes/Asset';

/**
 * Normalizes allocations to ensure all assets in the target list are represented.
 * If an asset is missing, a zero allocation is added for it.
 *
 * @param alloc - The allocation(s) to normalize.
 * @param target - The list of assets to ensure are represented, MUST be sorted.
 * @returns An array of normalized allocations.
 */
export function normalize(alloc: Allocation | Allocation[], target: Asset[]): Allocation[] {
  const allocs = Array.isArray(alloc) ? alloc : [alloc];
  const allocMap = new Map(allocs.map((alloc) => [alloc.asset.ID, alloc]));
  return target.map((asset) => {
    return allocMap.get(asset.ID) ?? new Allocation({ asset, value: BigInt(0) });
  });
}
