import assert from "node:assert/strict";
import test from "node:test";
import { applyAction, createState, MAX_OFFLINE_MS, settleState } from "../src/game.js";

test("offline settlement changes needs", () => {
  const start = 1_000_000;
  const state = createState(start);
  const settled = settleState(state, start + 2 * 3_600_000);
  assert.equal(settled.hunger, 64);
  assert.equal(settled.energy, 65);
  assert.ok(settled.cleanliness < state.cleanliness);
});

test("offline settlement is capped at 24 hours", () => {
  const state = createState(1);
  const settled = settleState(state, 1 + MAX_OFFLINE_MS * 5);
  assert.equal(settled.hunger, 0);
  assert.equal(settled.lastUpdatedAt, 1 + MAX_OFFLINE_MS * 5);
});

test("care actions update values and counters", () => {
  const state = { ...createState(1), hunger: 40, energy: 50 };
  const fed = applyAction(state, "feed", 2);
  assert.equal(fed.hunger, 64);
  assert.equal(fed.counts.feed, 1);
  const played = applyAction(fed, "play", 3);
  assert.equal(played.energy, 36);
  assert.equal(played.counts.play, 1);
});
