import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_LOCALE,
  TRADITIONAL_LOCALE,
  eventStatusLabel,
} from "./i18n.ts";

test("eventStatusLabel keeps simplified statuses for simplified pages", () => {
  assert.equal(eventStatusLabel("即将举办", DEFAULT_LOCALE), "即将举办");
  assert.equal(eventStatusLabel("报名中", DEFAULT_LOCALE), "报名中");
  assert.equal(eventStatusLabel("已举办", DEFAULT_LOCALE), "已举办");
});

test("eventStatusLabel localizes event statuses for traditional pages", () => {
  assert.equal(eventStatusLabel("即将举办", TRADITIONAL_LOCALE), "即將舉辦");
  assert.equal(eventStatusLabel("报名中", TRADITIONAL_LOCALE), "報名中");
  assert.equal(eventStatusLabel("已举办", TRADITIONAL_LOCALE), "已舉辦");
});
