import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const db = mysql.createPool({
    host: process.env.DBHOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DBNAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

(async () => {
    try{
        const connection = await db.getConnection();
        console.log("✅ Подключено к базе данных");
        connection.release();
    } catch (err) {
        console.error("Ошибка подключения к базе данных", err);
    }
})();


export default db;




