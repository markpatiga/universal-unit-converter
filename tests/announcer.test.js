// Screen-reader announcements: one message after typing pauses, no repeats.
import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { createAnnouncer } from '../js/ui/components/announcer.js';

function setup() {
  mock.timers.enable({ apis: ['setTimeout'] });
  const el = { textContent: '' };
  return { el, announcer: createAnnouncer(el, { delay: 700 }) };
}

test('announces only the last message, after typing pauses', (t) => {
  const { el, announcer } = setup();
  t.after(() => mock.timers.reset());
  announcer.announce('Result: 0.6 Mile');
  mock.timers.tick(200);
  announcer.announce('Result: 6.2 Mile');
  mock.timers.tick(200);
  announcer.announce('Result: 155.3 Mile');
  mock.timers.tick(699);
  assert.equal(el.textContent, '');
  mock.timers.tick(1);
  assert.equal(el.textContent, 'Result: 155.3 Mile');
});

test('does not repeat the same message', (t) => {
  const { el, announcer } = setup();
  t.after(() => mock.timers.reset());
  announcer.announce('Result: 1 Mile');
  mock.timers.tick(700);
  el.textContent = 'sentinel';
  announcer.announce('Result: 1 Mile');
  mock.timers.tick(700);
  assert.equal(el.textContent, 'sentinel', 'unchanged, so nothing re-announced');
});

test('an empty message announces nothing', (t) => {
  const { el, announcer } = setup();
  t.after(() => mock.timers.reset());
  announcer.announce('Result: 1 Mile');
  announcer.announce('');
  mock.timers.tick(1000);
  assert.equal(el.textContent, '');
});
