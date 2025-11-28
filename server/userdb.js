import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const db = mysql.createPool({
    host: process.env.DBHOST,
    user: process.env.DBUSER,
    password: process.env.PASSWORD,
    database: process.env.DBNAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    dateStrings: true
});

(async () => {
    try{
        const connection = await db.getConnection();
        console.log("✅ Connected to DB");
        connection.release();
    } catch (err) {
        console.error("Connect error to database", err);
    }
})();


export default db;




