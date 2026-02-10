import dotenv from 'dotenv';
dotenv.config();

import { getDb, closeDb } from './connection';
import { SCHEMA } from './schema';

function migrate() {
  console.log('Running database migrations...');
  const db = getDb();
  db.exec(SCHEMA);
  console.log('Migrations completed successfully.');
  closeDb();
}

migrate();
