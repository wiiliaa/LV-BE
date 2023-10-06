/* eslint-disable prettier/prettier */
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const config: TypeOrmModuleOptions = {
  type: 'postgres',
  host: '26.45.245.198',
  port: 5432,
  username: 'postgres',
  password: 'Deocobiet135',
  database: 'LuanVan',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true,
  logging: true,
};

export default config;
