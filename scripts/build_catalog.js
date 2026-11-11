/**
 * iNote Web Apps catalog builder
 * - Scans HTML files recursively under App
 * - Reads <meta name="inote:*"> metadata
 * - Skips apps with inote:publish=false
 * - Writes apps.json consumed by index.html
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const APP_ROOT = path.join(ROOT, "App");
const OUTPUT = path.join(ROOT, "apps.json");

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : (entry.isFile() && /\.html?$/i.test(entry.name) ? [full] : []);
  });
}
function getMeta(source, key) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(`<meta\\s+[^>]*name=["']inote:${escaped}["'][^>]*content=["']([^"']*)["'][^>]*>`, "i"),
    new RegExp(`<meta\\s+[^>]*content=["']([^"']*)["'][^>]*name=["']inote:${escaped}["'][^>]*>`, "i")
  ];
  for (const re of patterns) {
    const match = source.match(re);
    if (match) return decodeEntities(match[1].trim());
  }
  return "";
}
function decodeEntities(value) {
  return value.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}
function getTitle(source, fallback) {
  const custom = getMeta(source, "title");
  if (custom) return custom;
  const match = source.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? decodeEntities(match[1].replace(/\s+/g, " ").trim()) : fallback;
}
function relativeUrl(file) {
  return path.relative(ROOT, file).split(path.sep).map(encodeURIComponent).join("/");
}
const apps = walk(APP_ROOT).map((file) => {
  const source = fs.readFileSync(file, "utf8");
  const publish = getMeta(source, "publish").toLowerCase();
  if (publish === "false" || publish === "no" || publish === "0") return null;
  const rel = path.relative(APP_ROOT, file).split(path.sep).join("/");
  const fallback = path.basename(file, path.extname(file)).replace(/[_-]+/g, " ");
  return {
    id: rel.toLowerCase().replace(/[^a-z0-9가-힣]+/g, "-").replace(/^-|-$/g, ""),
    title: getTitle(source, fallback),
    description: getMeta(source, "description") || "iNote Web Apps 도구",
    category: getMeta(source, "category") || "기타",
    icon: getMeta(source, "icon") || "🧰",
    keywords: getMeta(source, "keywords"),
    version: getMeta(source, "version"),
    updated: getMeta(source, "updated"),
    badge: getMeta(source, "badge").toLowerCase(),
    badgeUntil: getMeta(source, "badge-until"),
    url: relativeUrl(file),
    file: rel
  };
}).filter(Boolean).sort((a, b) => {
  const order = ["Torque", "Engineering", "Utility", "기타"];
  const ai = order.indexOf(a.category), bi = order.indexOf(b.category);
  return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi) || a.title.localeCompare(b.title, "ko");
});
fs.writeFileSync(OUTPUT, JSON.stringify({ generatedAt: new Date().toISOString(), count: apps.length, apps }, null, 2) + "\n", "utf8");
console.log(`iNote Web Apps: ${apps.length}개 앱 목록 생성 완료 → apps.json`);
