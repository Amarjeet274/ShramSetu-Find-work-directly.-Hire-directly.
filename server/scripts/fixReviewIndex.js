require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');

(async () => {
  await connectDB();
  const db = mongoose.connection.db;

  const indexes = await db.collection('reviews').indexes();
  console.log('Current indexes on reviews:');
  indexes.forEach((i) => console.log('  •', i.name, JSON.stringify(i.key)));

  for (const idx of indexes) {
    if (idx.name === '_id_') continue;

    // Drop any stale index that references 'hire' (old schema)
    if ('hire' in idx.key) {
      await db.collection('reviews').dropIndex(idx.name);
      console.log(`  ✓ dropped stale index: ${idx.name}`);
    }
  }

  // Also drop 'assignment_1_reviewer_1' if the shape changed — Mongoose will recreate it
  try {
    await db.collection('reviews').dropIndex('assignment_1_reviewer_1');
    console.log('  ✓ dropped assignment_1_reviewer_1 (will be recreated)');
  } catch (e) {
    // Index didn't exist — that's fine
  }

  console.log('\nDone. Restart the server so Mongoose recreates the correct indexes.');
  await mongoose.disconnect();
  process.exit(0);
})();