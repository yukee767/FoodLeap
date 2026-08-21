import 'dotenv/config';
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://foodleap:foodleap_dev@localhost:5432/foodleap',
  entities: [__dirname + '/../entities/*.{ts,js}'],
  migrations: [__dirname + '/../migrations/*.{ts,js}'],
  synchronize: false,
  logging: process.env.NODE_ENV !== 'production',
});

export async function initDb() {
  if (!AppDataSource.isInitialized) await AppDataSource.initialize();
  return AppDataSource;
}
