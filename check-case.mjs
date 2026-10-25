// Finds imports whose upper/lower case does not match the real file or folder name.
import fs from "node:fs";
import path from "node:path";

const root = path.resolve("src");
const exts = ["", ".js", ".jsx", ".css", ".json", "/index.js", "/index.jsx"];
let bad = 0;

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (/\.(jsx?|css)$/.test(name)) check(p);
  }
}

function realCase(full) {
  // walks each part of the path and compares it with what is really on disk
  const parts = path.relative(path.parse(full).root, full).split(path.sep);
  let cur = path.parse(full).root;
  for (const part of parts) {
    const list = fs.readdirSync(cur);
    const hit = list.find((n) => n === part);
    if (!hit) return list.find((n) => n.toLowerCase() === part.toLowerCase()) ? "case" : "missing";
    cur = path.join(cur, hit);
  }
  return "ok";
}

function check(file) {
  const text = fs.readFileSync(file, "utf8");
  const re = /(?:import|from)\s*(?:[^"']*?from\s*)?["'](\.{1,2}\/[^"']+)["']/g;
  let m;
  while ((m = re.exec(text))) {
    const spec = m[1];
    let status = "missing";
    for (const e of exts) {
      const full = path.resolve(path.dirname(file), spec + e);
      if (!fs.existsSync(full)) continue;
      const r = realCase(full);
      if (r === "ok") { status = "ok"; break; }
      status = r;
    }
    if (status !== "ok") {
      bad++;
      console.log(`${status === "case" ? "WRONG CASE" : "NOT FOUND "}  ${path.relative(".", file)}  ->  ${spec}`);
    }
  }
}

walk(root);
console.log(bad ? `\n${bad} problem(s) found. Fix the import so it matches the real name exactly.` : "All imports match. No case problems.");