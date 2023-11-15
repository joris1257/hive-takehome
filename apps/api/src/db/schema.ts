import {
  bigint,
  timestamp,
  mysqlTableCreator,
  double,
} from 'drizzle-orm/mysql-core';

export const mysqlTable = mysqlTableCreator((name) => `hive_${name}`);

export const cpuUsage = mysqlTable('cpuUsage', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  usage: double('usage'),
  timestamp: timestamp('timestamp').defaultNow(),
});
