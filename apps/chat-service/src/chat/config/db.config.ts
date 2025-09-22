import { registerAs } from "@nestjs/config";
import path from "path";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions.js";


export default registerAs('db.config', (): PostgresConnectionOptions => ({
	type: 'postgres',
	host: process.env.POSTGRES_HOST || 'localhost',
    port: +(process.env.POSTGRES_PORT || '5432'),
    username: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    database: process.env.POSTGRES_DB || 'mydatabase',
    entities: [path.resolve(__dirname, '../entities/*.entity.{ts,js}')],
    synchronize: true,
}))