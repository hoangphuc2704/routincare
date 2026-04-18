import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { gzipSync } from 'node:zlib';

const DIST_ASSETS_DIR = 'dist/assets';

const budgets = {
  maxTotalJsKb: Number(process.env.PERF_MAX_TOTAL_JS_KB ?? 1500),
  maxLargestJsKb: Number(process.env.PERF_MAX_LARGEST_JS_KB ?? 550),
  maxEntryJsKb: Number(process.env.PERF_MAX_ENTRY_JS_KB ?? 330),
  maxTotalCssKb: Number(process.env.PERF_MAX_TOTAL_CSS_KB ?? 180),
};

function bytesToKb(bytes) {
  return Number((bytes / 1024).toFixed(2));
}

function getFiles(dir) {
  return readdirSync(dir)
    .map((name) => join(dir, name))
    .filter((filePath) => statSync(filePath).isFile());
}

function summarizeFiles(files) {
  return files.map((filePath) => {
    const rawBytes = statSync(filePath).size;
    const gzippedBytes = gzipSync(readFileSync(filePath)).length;

    return {
      filePath,
      rawKb: bytesToKb(rawBytes),
      gzipKb: bytesToKb(gzippedBytes),
    };
  });
}

function sumBy(list, key) {
  return Number(list.reduce((acc, item) => acc + item[key], 0).toFixed(2));
}

function printSection(title, list) {
  console.log(`\n${title}`);
  if (list.length === 0) {
    console.log('  - none');
    return;
  }

  list
    .sort((a, b) => b.rawKb - a.rawKb)
    .forEach((item) => {
      console.log(`  - ${item.filePath}: raw ${item.rawKb} KB | gzip ${item.gzipKb} KB`);
    });
}

function ensureDistAssetsExists() {
  try {
    statSync(DIST_ASSETS_DIR);
  } catch {
    console.error(`Missing ${DIST_ASSETS_DIR}. Run npm run build first.`);
    process.exit(1);
  }
}

function main() {
  ensureDistAssetsExists();

  const files = getFiles(DIST_ASSETS_DIR);
  const jsFiles = files.filter((filePath) => extname(filePath) === '.js');
  const cssFiles = files.filter((filePath) => extname(filePath) === '.css');

  const jsSummary = summarizeFiles(jsFiles);
  const cssSummary = summarizeFiles(cssFiles);

  const totalJsKb = sumBy(jsSummary, 'rawKb');
  const totalCssKb = sumBy(cssSummary, 'rawKb');
  const largestJsKb = jsSummary.length ? Math.max(...jsSummary.map((item) => item.rawKb)) : 0;
  const entryJs = jsSummary.find((item) => /\/index-[^.]+\.js$/.test(item.filePath));
  const entryJsKb = entryJs?.rawKb ?? 0;

  printSection('JS assets', jsSummary);
  printSection('CSS assets', cssSummary);

  console.log('\nBudgets');
  console.log(`  - maxTotalJsKb: ${budgets.maxTotalJsKb}`);
  console.log(`  - maxLargestJsKb: ${budgets.maxLargestJsKb}`);
  console.log(`  - maxEntryJsKb: ${budgets.maxEntryJsKb}`);
  console.log(`  - maxTotalCssKb: ${budgets.maxTotalCssKb}`);

  console.log('\nCurrent totals');
  console.log(`  - totalJsKb: ${totalJsKb}`);
  console.log(`  - largestJsKb: ${largestJsKb}`);
  console.log(`  - entryJsKb: ${entryJsKb}`);
  console.log(`  - totalCssKb: ${totalCssKb}`);

  const failures = [];

  if (totalJsKb > budgets.maxTotalJsKb) {
    failures.push(`totalJsKb ${totalJsKb} exceeded ${budgets.maxTotalJsKb}`);
  }
  if (largestJsKb > budgets.maxLargestJsKb) {
    failures.push(`largestJsKb ${largestJsKb} exceeded ${budgets.maxLargestJsKb}`);
  }
  if (entryJsKb > budgets.maxEntryJsKb) {
    failures.push(`entryJsKb ${entryJsKb} exceeded ${budgets.maxEntryJsKb}`);
  }
  if (totalCssKb > budgets.maxTotalCssKb) {
    failures.push(`totalCssKb ${totalCssKb} exceeded ${budgets.maxTotalCssKb}`);
  }

  if (failures.length > 0) {
    console.error('\nPerformance baseline failed:');
    failures.forEach((line) => console.error(`  - ${line}`));
    process.exit(1);
  }

  console.log('\nPerformance baseline passed.');
}

main();
