# truncate-evenly: truncate strings in an array to the maximum total length evenly

Truncates items (typically strings) in the array using a best-effort approach,
to fit the sum length of the result to maxSumLength.

The function doesn't make an attempt to work as fast as possible (so better use
it for relatively small arrays only). Instead, it optimizes the quality of the
result and the simplicity of the approach.

- The algorithm tries to minimize the number of truncations, keeping the items
  lengths balanced. In a nutshell, it first tries to shrink the longest item to
  the next one shorter, then do the same over and over until it reaches
  `maxSumLength`. See unit tests for details.
- If `appendEllipsis` is passed, it will be called on the truncated elements to
  append the "ellipsis" marker. This marker won't count towards the sum length
  of the result though.
- Works with any items that have `length` and `slice` properties (strings,
  sub-arrays, buffers or your custom objects).
- You can also pass `maxIterations` to limit the number of the inner iteration.
  This acts as a circuit breaker in case of some unknown bug in the algorithm.

## Examples

```ts
const entriesIn = ["123456789", "12", "1234567890123456789"];
const entriesOut = truncateEvenly(entriesIn, 12, (s) => s + "…");
expect(entriesOut).toMatchInlineSnapshot(`
  [
    "12345…",
    "12",
    "12345…",
  ]
`);
```

A good illustration on how the algorithm works step by step, getting closer and
closer to the desired maximum length, is below:

```ts
expect(
  truncateTestHelper(12, {
    a: "1234567890123456789",
    b: "123456789",
    c: "12",
  })
).toMatchInlineSnapshot(`
  "0) a=1234567890123456789  b=123456789            c=12
   1) a=123456789            b=123456789            c=12
   2) a=12345                b=12345                c=12
   3) a=12345…               b=12345…               c=12 <-- RESULT"
`);
```

