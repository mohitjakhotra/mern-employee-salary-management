import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const dbName = process.env.DB_NAME || 'db_penggajian3';
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = Number.parseInt(process.env.DB_PORT || '3306', 10);
const dbDialect = process.env.DB_DIALECT || 'mysql';

const db = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    port: Number.isNaN(dbPort) ? 3306 : dbPort,
    dialect: dbDialect
});

export default db;