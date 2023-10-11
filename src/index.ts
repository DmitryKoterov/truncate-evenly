import first from "lodash/first";
import partition from "lodash/partition";
import sortBy from "lodash/sortBy";
import sumBy from "lodash/sumBy";

/**
 * Truncates items (typically strings) in the array using a best-effort
 * approach, to fit the sum length of the result to maxSumLength.
 */
export default function truncateEvenly<
  TItem extends {
    length: number;
    slice: (start: number, end: number) => TItem;
  }
>(
  array: ReadonlyArray<TItem>,
  maxSumLength: number,
  appendEllipsis?: (item: TItem) => TItem,
  debug?: (refs: ReadonlyArray<[TItem]>) => void,
  maxIterations?: number
): Array<TItem> {
  if (array.length === 0) {
    return [];
  }

  const refs: Array<[TItem]> = array.map((item) => [item]);
  const origLens = array.map((item) => item.length);

  for (let itr = 0; itr < (maxIterations ?? Infinity); itr++) {
    debug?.(refs);

    let sumLen = sumBy(refs, (ref) => ref[0].length);
    if (sumLen <= maxSumLength) {
      break;
    }

    const pairsLongToShort = sortBy(refs, (ref) => -ref[0].length);
    const firstLonger = first(pairsLongToShort)!;
    const [longer, shorter] = partition(
      pairsLongToShort,
      (ref) => ref[0].length === firstLonger[0].length
    );
    assert(longer.length > 0, "longer.length > 0");
    const sumShorterLen = sumBy(shorter, (ref) => ref[0].length);
    const firstShorter = first(shorter);
    const tryLen = firstShorter
      ? Math.max(
          firstShorter[0].length,
          Math.trunc((maxSumLength - sumShorterLen) / longer.length)
        )
      : Math.trunc(maxSumLength / refs.length);
    for (let i = longer.length - 1; i >= 0; i--) {
      const ref = longer[i];
      const oldLen = ref[0].length;
      assert(oldLen > tryLen, `oldLen=${oldLen} > tryLength=${tryLen}`);
      const tryLenMaybeBetter = oldLen - (sumLen - maxSumLength);
      const newLen = Math.max(tryLen, tryLenMaybeBetter);
      assert(newLen < oldLen, `newLen=${newLen} < oldLen=${oldLen}`);
      ref[0] = ref[0].slice(0, newLen);
      sumLen -= oldLen - newLen;
    }
  }

  if (appendEllipsis) {
    for (let i = 0; i < refs.length; i++) {
      refs[i][0] =
        refs[i][0].length < origLens[i]
          ? appendEllipsis(refs[i][0])
          : refs[i][0];
    }
    debug?.(refs);
  }

  return refs.map((ref) => ref[0]);
}

function assert(condition: boolean, message: string): condition is true {
  if (!condition) {
    throw Error(`Assertion failed: ${message}`);
  }

  return true;
}
