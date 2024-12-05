import { Sequelize } from 'sequelize';
// import dotenv from 'dotenv';
// dotenv.config()

const connection: Sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './tashliyeah-db.sqlite',
    // username: process.env.DB_USERNAME || 'tashliyah',
    // password: process.env.DB_PASSWORD || 'mysecret',
});

export default connection;