import { readFileSync, writeFileSync, readdirSync } from "fs";
import { fileURLToPath } from "url";

const outDir = fileURLToPath(new URL("../../SEO/output/", import.meta.url));
const chars = new Set();
for (const f of readdirSync(outDir)) {
  if (!/^blog_.+\.md$/.test(f)) continue;
  for (const c of readFileSync(outDir + f, "utf8")) {
    if (/[一-鿿]/.test(c)) chars.add(c);
  }
}
const sorted = [...chars].sort().join("");
const dst = fileURLToPath(new URL("./data/common-chars.txt", import.meta.url));
writeFileSync(dst, sorted);
console.log(`已写入 ${chars.size} 个常用汉字 → ${dst}`);
