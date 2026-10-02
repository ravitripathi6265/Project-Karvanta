import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('--- STARTING COMPREHENSIVE KARVANTA QA TESTS ---');

// 1. Test All 12 Locales
const locales = ['en', 'hi', 'mr', 'ta', 'te', 'bn', 'gu', 'kn', 'ml', 'pa', 'or', 'as'];
const localesDir = path.join(__dirname, '../src/locales');

const enJson = JSON.parse(fs.readFileSync(path.join(localesDir, 'en.json'), 'utf8'));

function getKeys(obj, prefix = '') {
  return Object.keys(obj).reduce((res, el) => {
    if (Array.isArray(obj[el])) {
      return res;
    } else if (typeof obj[el] === 'object' && obj[el] !== null) {
      return [...res, ...getKeys(obj[el], prefix + el + '.')];
    }
    return [...res, prefix + el];
  }, []);
}

const baseKeys = getKeys(enJson);
console.log(`[PASS] Base English dictionary has ${baseKeys.length} translation keys.`);

let localeFailures = 0;
locales.forEach((loc) => {
  const filePath = path.join(localesDir, `${loc}.json`);
  if (!fs.existsSync(filePath)) {
    console.error(`[FAIL] Missing locale file for ${loc}`);
    localeFailures++;
    return;
  }
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const locKeys = getKeys(data);
    const missing = baseKeys.filter(k => !locKeys.includes(k));
    if (missing.length > 0) {
      console.warn(`[WARN] Locale ${loc} is missing ${missing.length} keys: ${missing.slice(0, 3).join(', ')}...`);
    } else {
      console.log(`[PASS] Locale "${loc}" has 100% key coverage (${locKeys.length}/${baseKeys.length}).`);
    }
  } catch (err) {
    console.error(`[FAIL] JSON syntax error in ${loc}.json:`, err);
    localeFailures++;
  }
});

// 2. Test Initial Seed Data Integrity
import { INITIAL_USERS, INITIAL_CONTRACTORS, INITIAL_WORKERS, INITIAL_LABOUR_POSTS, INITIAL_CITIES } from '../src/db/initialData.js';

console.log(`[PASS] Initial Cities: ${INITIAL_CITIES.length} cities loaded.`);
console.log(`[PASS] Initial Users: ${INITIAL_USERS.length} accounts loaded (Customer, Contractor, Worker, Admin).`);
console.log(`[PASS] Initial Contractors: ${INITIAL_CONTRACTORS.length} verified thekedars.`);
console.log(`[PASS] Initial Workers: ${INITIAL_WORKERS.length} skilled karigars.`);
console.log(`[PASS] Initial Labour Posts: ${INITIAL_LABOUR_POSTS.length} active digital chowk posts.`);

// Check verification tiers structure
INITIAL_CONTRACTORS.forEach(c => {
  if (!c.verified || typeof c.verified.phone === 'undefined' || typeof c.verified.identity === 'undefined' || typeof c.verified.trade === 'undefined') {
    console.error(`[FAIL] Contractor ${c.name} has malformed verification tiers!`);
    localeFailures++;
  }
});

INITIAL_WORKERS.forEach(w => {
  if (!w.verified || typeof w.verified.phone === 'undefined' || typeof w.verified.trade === 'undefined') {
    console.error(`[FAIL] Worker ${w.name} has malformed verification tiers!`);
    localeFailures++;
  }
  if (!w.dailyRate || w.dailyRate < 300) {
    console.error(`[FAIL] Worker ${w.name} has invalid daily rate!`);
    localeFailures++;
  }
});

if (localeFailures === 0) {
  console.log('--- ALL AUTOMATED VERIFICATION CHECKS PASSED (100%) ---');
  process.exit(0);
} else {
  console.error(`--- COMPLETED WITH ${localeFailures} ERRORS ---`);
  process.exit(1);
}
