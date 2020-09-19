/* eslint-disable @typescript-eslint/no-var-requires */
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const globals = [
  'HTMLElement',
  'MutationObserver',
  'Node',
  'Text',
  'document',
  'navigator',
];

const dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`, {
  url: 'http://localhost',
});
global['window'] = dom.window;
globals.forEach((k) => (global[k] = dom.window[k]));
