// When does a conversion count as finished? Tests use Node's fake timers,
// so "wait 1 second" runs instantly.
import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { createHistoryRecorder } from '../js/services/historyRecorder.js';

function setup() {
  mock.timers.enable({ apis: ['setTimeout'] });
  let saves = 0;
  const recorder = createHistoryRecorder({ onSettle: () => { saves += 1; } });
  return { recorder, saves: () => saves };
}

test('saves once, 1 second after typing stops', (t) => {
  const { recorder, saves } = setup();
  t.after(() => mock.timers.reset());

  recorder.notify('setInput'); // "1"
  mock.timers.tick(400);
  recorder.notify('setInput'); // "10": restarts the wait
  mock.timers.tick(400);
  recorder.notify('setInput'); // "100"
  mock.timers.tick(999);
  assert.equal(saves(), 0, 'not yet');
  mock.timers.tick(1);
  assert.equal(saves(), 1, 'saved after 1s of quiet');
  mock.timers.tick(5000);
  assert.equal(saves(), 1, 'and only once');
});

test('changing a unit or swapping also counts as an edit', (t) => {
  const { recorder, saves } = setup();
  t.after(() => mock.timers.reset());
  for (const action of ['setFrom', 'setTo', 'swapUnits']) {
    recorder.notify(action);
    mock.timers.tick(1000);
  }
  assert.equal(saves(), 3);
});

test('switching category, clearing or restoring cancels a pending save', (t) => {
  const { recorder, saves } = setup();
  t.after(() => mock.timers.reset());
  for (const action of ['selectCategory', 'clear', 'restore', 'recordConversion']) {
    recorder.notify('setInput');
    mock.timers.tick(500);
    recorder.notify(action);
    mock.timers.tick(2000);
  }
  assert.equal(saves(), 0);
});

test('flush saves immediately (Enter or Copy) and cancels the timer', (t) => {
  const { recorder, saves } = setup();
  t.after(() => mock.timers.reset());
  recorder.notify('setInput');
  recorder.flush();
  assert.equal(saves(), 1);
  mock.timers.tick(2000);
  assert.equal(saves(), 1, 'no second save from the old timer');
});

test('flushPending saves only if a save was waiting (page closing)', (t) => {
  const { recorder, saves } = setup();
  t.after(() => mock.timers.reset());
  recorder.flushPending();
  assert.equal(saves(), 0, 'nothing waiting');
  recorder.notify('setInput');
  recorder.flushPending();
  assert.equal(saves(), 1);
});
