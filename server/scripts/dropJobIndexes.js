require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');

(async () => {
  await connectDB();
  const db = mongoose.connection.db;
  const indexes = await db.collection('jobs').indexes();
  console.log('Current indexes:', indexes.map((i) => i.name));

  for (const idx of indexes) {
    if (idx.name !== '_id_') {
      await db.collection('jobs').dropIndex(idx.name);
      console.log(`  ✓ dropped ${idx.name}`);
    }
  }

  await mongoose.disconnect();
  console.log('Done. Restart the server to recreate indexes with new options.');
  process.exit(0);
})();