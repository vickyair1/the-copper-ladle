// The Copper Ladle — handover program (Node 22, standard library only).
// The grader runs this file twice from a read-only copy of the repository;
// each run must produce identical bytes under /output (or MAKEFUN_OUTPUT_DIR
// when run outside the grader). It gathers the playable game, the screenshots
// the maker took of it, and the dossier the judge reads, then stops.

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyTree(from, to) {
  if (!existsSync(from)) return;
  cpSync(from, to, { recursive: true });
}

function handOver() {
  mkdirSync(outputDir, { recursive: true });
  rmSync(join(outputDir, 'game'), { recursive: true, force: true });
  rmSync(join(outputDir, 'screenshots'), { recursive: true, force: true });
  copyTree(join(repoRoot, 'game'), join(outputDir, 'game'));
  copyTree(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'));

  // The dossier is built from exactly what was copied, with the gate's caps:
  // dossier text at most 160 KiB, at most 4 screenshots of 256 KiB each, and
  // the game tree inside 993 files / 48 MiB with paths under 1000 bytes.
  const dossier = buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  });
  writeFileSync(join(outputDir, 'dossier.json'), dossier);
}

handOver();
