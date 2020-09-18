import { writeFileSync } from 'fs';
import { exec } from 'child_process';

const GLOBAL_STATE = Symbol.for('$$jest-matchers-object');

interface Options {
  // If present, expected and reference documents are assumed to be fragments
  // and will be wrapped in an <html><body> with this stylesheet in the head.
  //
  // Use this when parsing fragments and generating whole documents (presumably
  // also with this style) to ensure an apples-to-apples visual comparison.
  fragmentStyle?: string;
}

function currentTestName() {
  return global[GLOBAL_STATE].state.currentTestName;
}

function currentTestSnapshot() {
  const { snapshotState } = global[GLOBAL_STATE].state;
  const name = currentTestName();
  const key = Object.keys(snapshotState._snapshotData).find(k =>
    k.startsWith(name)
  );
  const data = key && snapshotState._snapshotData[key];
  if (typeof data === 'string')
    return JSON.parse(data.trim().replace(/\n/g, '\\n'));
  else return `unknown (no matching snapshot key for test ${name})`;
}

function snapshotState() {
  return global[GLOBAL_STATE].state.snapshotState;
}

function snapshotUpdateState(): 'all' | 'new' | 'none' {
  return snapshotState()._updateSnapshot || 'new';
}

// We use snapshots for visual testing & don't want to auto-accept new test cases.
// Defuse Jest's default behavior (since there is no CLI or config flag for this).
beforeAll(() => {
  const state = snapshotState();
  if (state._updateSnapshot === 'new') state._updateSnapshot = 'none';
});

function makeBasename() {
  const name = currentTestName()
    .replace(/\W+/g, '-')
    .slice(-40);
  return `${name}`;
}

function openBrowser(filename) {
  exec(`open ${filename}`);
}

// Compare two HTML fragments side by side. Useful for visually verifying
// generation results.
function showTwo(received, expected, options: Options) {
  const basename = makeBasename();
  const nameReceived = `/tmp/${basename}-received.html`;
  writeFileSync(nameReceived, received);
  const nameExpected = `/tmp/${basename}-expected.html`;
  const { fragmentStyle } = options;
  if (fragmentStyle)
    writeFileSync(
      nameExpected,
      `<html><head><style>${fragmentStyle}</style></head><body>${expected}</body></html>`
    );
  else writeFileSync(nameExpected, expected);
  const filename = `/tmp/${basename}.html`;
  writeFileSync(
    filename,
    `<html>
      <body>
        <div style="color: white; background: black; position: fixed; left: 0; top: 0; width: 50vw; height: 1em">received</div>
        <div style="color: white; background: black; position: fixed; left: 50vw; top: 0; width: 50vw; height: 1em">expected</div>
        <iframe src="file://${nameReceived}" style="overflow: scroll; position:fixed; left: 0; top: 1em; right: 50vw; width: 50vw; height: 100vh;"></iframe>
        <iframe src="file://${nameExpected}" style="overflow: scroll; position: fixed; right: 0; top: 1em; left: 50vw; width: 50vw; height:  100vh;"></iframe>
      </body>
    </html>
`
  );
  openBrowser(filename);
}

// Compare three HTML fragments side by side: a reference sample, the
// received output from the code, and the expected output (e.g. a prior snapshot).
//
// Useful for visually verifying round-trip results.
function showThree(reference, received, expected, options: Options) {
  const { fragmentStyle } = options;
  const basename = makeBasename();

  const nameReference = `/tmp/${basename}-reference.html`;
  if (fragmentStyle)
    writeFileSync(
      nameReference,
      `<html><head><style>${fragmentStyle}</style></head><body>${nameReference}</body></html>`
    );
  else writeFileSync(nameReference, reference);

  const nameReceived = `/tmp/${basename}-received.html`;
  writeFileSync(nameReceived, received);

  const nameExpected = `/tmp/${basename}-expected.html`;
  if (fragmentStyle)
    writeFileSync(
      nameExpected,
      `<html><head><style>${fragmentStyle}</style></head><body>${expected}</body></html>`
    );
  else writeFileSync(nameExpected, expected);

  const filename = `/tmp/${basename}.html`;
  writeFileSync(
    filename,
    `<html>
      <body>
        <div style="color: white; background: black; position: fixed; left: 0vw;  width: 33vw; top: 0; height: 1em">reference</div>
        <div style="color: white; background: black; position: fixed; left: 33vw; width: 33vw; top: 0; height: 1em">received</div>
        <div style="color: white; background: black; position: fixed; left: 66vw; width: 33vw; top: 0; height: 1em">expected</div>
        <iframe src="file://${nameReference}" style="overflow: scroll; position: fixed; left: 0;    width: 33vw; top: 1em; height: calc(100vh - 1em)"></iframe>
        <iframe src="file://${nameReceived}"  style="overflow: scroll; position: fixed; left: 33vw; width: 33vw; top: 1em; height: calc(100vh - 1em)"></iframe>
        <iframe src="file://${nameExpected}"  style="overflow: scroll; position: fixed; left: 66vw; width: 33vw; top: 1em; height: calc(100vh - 1em)"></iframe>
      </body>
    </html>
`
  );
  openBrowser(filename);
}

/// Compare two HTML documents side-by-side in a browser if the callback
/// throws an exception, or if process.env.DEBUG is true.
function compare(received, original, callback, options: Options = {}) {
  let shown = false;
  try {
    const result = callback();
    if (result instanceof Error) throw result;
  } catch (err) {
    if (process.env.CI || snapshotUpdateState() === 'all') throw err;
    showTwo(received, original, options);
    shown = true;
    throw err;
  } finally {
    if (process.env.DEBUG && !shown) showTwo(received, original, options);
  }
}

/// Compare two HTML documents side-by-side in a browser with a reference, if the callback
/// throws an exception or if process.env.DEBUG is true.
function compareWithReference(
  reference,
  received,
  original,
  callback,
  options: Options = {}
) {
  let shown = false;
  try {
    const result = callback();
    if (result instanceof Error) throw result;
  } catch (err) {
    if (process.env.CI || snapshotUpdateState() === 'all') throw err;
    showThree(reference, received, original, options);
    shown = true;
    throw err;
  } finally {
    if (process.env.DEBUG && !shown)
      showThree(reference, received, original, options);
  }
}

/// Expect received toMatchSnapshot. If match fails, compare received vs. snapshot.
export function matchSnapshot(received, options: Options = {}) {
  compare(
    received,
    currentTestSnapshot(),
    () => {
      const oldMatched = snapshotState().matched;
      expect(received).toMatchSnapshot();
      const newMatched = snapshotState().matched;
      if (newMatched != oldMatched + 1 && snapshotUpdateState() !== 'all') {
        return new Error(`snapshot did not match`);
      }
    },
    options
  );
}

/// Expect received toMatchSnapshot. If match fails, compare received vs. snapshot and provide an original reference.
/// Use for round-trip tests employ a snapshot as their "approval" mark.
export function matchSnapshotWithReference(
  reference,
  received,
  options: Options = {}
) {
  compareWithReference(
    reference,
    received,
    currentTestSnapshot(),
    () => {
      const oldMatched = snapshotState().matched;
      expect(received).toMatchSnapshot();
      const newMatched = snapshotState().matched;
      if (newMatched != oldMatched + 1 && snapshotUpdateState() !== 'all')
        return new Error(`snapshot did not match`);
    },
    options
  );
}
