// Entry for make.fun bounty gta6-clipper-01: "Clip GTA 6 for the most YouTube views".
//
// The entry itself is the video: a vertical Short cut from Kai Cenat's first
// GTA 6 stream, with a make.fun pitch carried on screen and the bounty's line
// and play code in its description. This program's only job is to hand the
// video's address to the house: it reads VIDEO.json from this repository and
// writes it to the output directory, where the gate reads it.
//
// Node 22+, standard library only. Outside the grader, run:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Resolve everything from this file's location, never from the working
// directory: the grader runs `node /bot/main.ts` from elsewhere.
const repoRoot = dirname(fileURLToPath(import.meta.url));
const botDir = process.env.MAKEFUN_BOT_DIR ?? repoRoot;
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const videoPath = join(botDir, 'VIDEO.json');

if (!existsSync(videoPath)) {
  console.error(`VIDEO.json not found at ${videoPath}`);
  process.exit(1);
}

let video;
try {
  video = JSON.parse(readFileSync(videoPath, 'utf8'));
} catch (err) {
  console.error(`VIDEO.json could not be parsed: ${(err as Error).message}`);
  process.exit(1);
}

if (typeof video?.url !== 'string' || !video.url.startsWith('https://')) {
  console.error('VIDEO.json must hold a video address under "url".');
  process.exit(1);
}

// The house only counts a YouTube video: refuse anything else early, with a
// clear error, instead of handing the gate an address it cannot read.
let parsed;
try {
  parsed = new URL(video.url);
} catch {
  console.error(`VIDEO.json "url" is not a valid address: ${video.url}`);
  process.exit(1);
}

const youTubeHosts = new Set([
  'www.youtube.com',
  'youtube.com',
  'youtu.be',
  'm.youtube.com',
]);

if (!youTubeHosts.has(parsed.hostname)) {
  console.error(`VIDEO.json "url" is not a YouTube address: ${video.url}`);
  process.exit(1);
}

mkdirSync(outputDir, { recursive: true });
copyFileSync(videoPath, join(outputDir, 'VIDEO.json'));
console.log(`Wrote ${video.url} to ${join(outputDir, 'VIDEO.json')}`);
