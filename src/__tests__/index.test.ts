import truncateEvenly from "../";

test("do not reorder entries", () => {
  const entriesIn = ["123456789", "12", "1234567890123456789"];
  const entriesOut = truncateEvenly(entriesIn, 12, (s) => s + "…");
  expect(entriesOut).toMatchInlineSnapshot(`
    [
      "12345…",
      "12",
      "12345…",
    ]
  `);
});

test("keep the input immutable", () => {
  const entriesIn = ["123456789", "12", "1234567890123456789"];
  truncateEvenly(entriesIn, 12, (s) => s + "…");
  expect(entriesIn.map((s) => `${s} (must be unchanged)`))
    .toMatchInlineSnapshot(`
    [
      "123456789 (must be unchanged)",
      "12 (must be unchanged)",
      "1234567890123456789 (must be unchanged)",
    ]
  `);
});

test("truncate one entry", () => {
  expect(truncateTestHelper(4, { a: "123456789" })).toMatchInlineSnapshot(`
    "0) a=123456789
     1) a=1234
     2) a=1234… <-- RESULT"
  `);
});

test("truncate two entries equally", () => {
  expect(
    truncateTestHelper(8, {
      a: "123456789",
      b: "123456",
    })
  ).toMatchInlineSnapshot(`
    "0) a=123456789            b=123456
     1) a=123456               b=123456
     2) a=1234                 b=1234
     3) a=1234…                b=1234… <-- RESULT"
  `);
});

test("truncate first entry only", () => {
  expect(
    truncateTestHelper(8, {
      a: "123456789",
      b: "123",
    })
  ).toMatchInlineSnapshot(`
    "0) a=123456789            b=123
     1) a=12345                b=123
     2) a=12345…               b=123 <-- RESULT"
  `);
});

test("truncate second entry more than first", () => {
  expect(
    truncateTestHelper(9, {
      a: "123456789",
      b: "123456789",
      c: "12",
    })
  ).toMatchInlineSnapshot(`
    "0) a=123456789            b=123456789            c=12
     1) a=1234                 b=123                  c=12
     2) a=1234…                b=123…                 c=12 <-- RESULT"
  `);
});

test("truncate entries evenly", () => {
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
});

test("truncate entries when one of them is empty", () => {
  expect(
    truncateTestHelper(3, {
      a: "1234567890123456789",
      b: "123456789",
      c: "",
      d: "",
    })
  ).toMatchInlineSnapshot(`
    "0) a=1234567890123456789  b=123456789            c=                     d=
     1) a=123456789            b=123456789            c=                     d=
     2) a=12                   b=1                    c=                     d=
     3) a=12…                  b=1…                   c=                     d= <-- RESULT"
  `);
});

test("truncate entries when maxSumLength=0", () => {
  expect(
    truncateTestHelper(0, {
      a: "1234567890123456789",
      b: "123456789",
      c: "",
      d: "",
    })
  ).toMatchInlineSnapshot(`
    "0) a=1234567890123456789  b=123456789            c=                     d=
     1) a=123456789            b=123456789            c=                     d=
     2) a=                     b=                     c=                     d=
     3) a=…                    b=…                    c=                     d= <-- RESULT"
  `);
});

function truncateTestHelper(maxSumLength: number, obj: Record<string, string>) {
  const stepsArray: string[] = [];
  const keys = Object.keys(obj);
  const values = Object.values(obj);
  truncateEvenly(
    values,
    maxSumLength,
    (s) => s + "…",
    (refs) =>
      stepsArray.push(
        refs
          .map(([s], i) => `${keys[i]}=${s.padEnd(20)}`)
          .join(" ")
          .trim()
      )
  );
  return stepsArray
    .map(
      (v, i) =>
        (i === 0 ? "" : " ") +
        `${i}) ${v}` +
        (i === stepsArray.length - 1 ? " <-- RESULT" : "")
    )
    .join("\n");
}
