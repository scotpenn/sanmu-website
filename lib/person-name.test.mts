import assert from "node:assert/strict";
import test from "node:test";
import { joinPersonName } from "./person-name.ts";

test("Chinese names are joined surname-first without a space", () => {
  assert.equal(joinPersonName("王", "小明"), "王小明");
  assert.equal(joinPersonName("歐陽", "娜娜"), "歐陽娜娜");
});

test("non-Chinese names use given-name-first order", () => {
  assert.equal(joinPersonName("Wang", "Ming"), "Ming Wang");
  assert.equal(joinPersonName("王", "Ming"), "Ming 王");
});
