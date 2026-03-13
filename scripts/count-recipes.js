const m = require("../public/assets-web/manifest.json");
const r = Object.keys(m.recipes);
const rl = r.map(n => n.toLowerCase());

function count(label, fn) {
  const matches = r.filter((n, i) => fn(rl[i]));
  console.log(`${label}: ${matches.length}`);
  return matches;
}

count("Shell", n => n.startsWith("shell ") && n.indexOf("summer") === -1);
count("Ironwood", n => n.startsWith("ironwood"));
count("Log", n => n.startsWith("log "));
count("Wooden (not block/mosaic/knot/plank)", n => (n.startsWith("wooden ") || n.startsWith("wooden-")) && n.indexOf("wooden-block") !== 0 && n.indexOf("wooden-mosaic") !== 0 && n.indexOf("wooden-knot") !== 0 && n.indexOf("wooden-plank") !== 0);
count("Wooden-Block", n => n.startsWith("wooden-block"));
count("Iron (not ironwood)", n => (n.startsWith("iron ") || n.startsWith("iron-")) && n.indexOf("ironwood") !== 0);
count("Gold/Golden (all)", n => n.startsWith("gold") || n.startsWith("lucky gold"));
count("Fruit", n => ["apple","cherry ","cherry-","orange","peach","pear","coconut","fruit"].some(f => n.startsWith(f)) && n.indexOf("cherry-blossom") === -1);
count("Festive+Illuminated", n => n.startsWith("festive") || n.startsWith("illuminated") || n.startsWith("big festive") || n.startsWith("tabletop festive") || n.startsWith("holiday") || n.startsWith("jingle") || n === "gift pile" || n === "sleigh");
count("Fences", n => n.indexOf("fence") !== -1);
count("Bunny+Egg", n => n.indexOf("bunny") !== -1 || n.indexOf("-egg") !== -1 || n.indexOf("egg ") !== -1 || n === "wobbling zipper toy");
count("Cherry Blossom", n => n.indexOf("cherry-blossom") !== -1 || n.indexOf("sakura") !== -1 || n === "blossom-viewing lantern" || n === "outdoor picnic set");
count("Mermaid", n => n.startsWith("mermaid"));
count("Spooky", n => n.startsWith("spooky"));
count("Turkey Day", n => n.startsWith("turkey day"));
count("Bamboo (all)", n => n.startsWith("bamboo"));
count("Mushroom/Mush", n => n.startsWith("mush") || n.startsWith("mushroom"));

console.log("\n--- Totals ---");
console.log("Total recipes in manifest:", r.length);
