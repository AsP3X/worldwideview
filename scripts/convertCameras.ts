import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

// Inline the converter logic so we can run without ts-path aliases
import { convertToGeoJson } from "../src/lib/geojson/converter";

const inputPath = resolve(__dirname, "../public/cameras.json");
const outputPath = resolve(__dirname, "../public/cameras_geojson.json");

const raw = JSON.parse(readFileSync(inputPath, "utf-8"));
const geoJson = convertToGeoJson(raw);

writeFileSync(outputPath, JSON.stringify(geoJson, null, 2), "utf-8");

// eslint-disable-next-line no-console
console.log(`✅ Converted ${geoJson.features.length} features`);
// eslint-disable-next-line no-console
console.log(`   Output: ${outputPath}`);
