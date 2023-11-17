import {
  bigint,
  timestamp,
  mysqlTableCreator,
  double,
  varchar,
} from 'drizzle-orm/mysql-core';

export const mysqlTable = mysqlTableCreator((name) => `hive_${name}`);

export const cpuUsage = mysqlTable('cpuUsage', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  userId: varchar('userId', { length: 255 }),
  usage: double('usage'),
  timestamp: timestamp('timestamp').defaultNow(),
});
