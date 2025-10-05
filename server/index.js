import db from "./userdb.js";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import bcrypt from 'bcrypt';
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

const saltRounds = 10;

const verificationCodes = new Map();

dotenv.config();

const PORT = process.env.PORT || 3001
const app = express()
app.use(
    cors({
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "DELETE"], 
        allowedHeaders: ["Content-Type", "Authorization"], 
    })
);
app.use(express.json());

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: "❌ Токен отсутствует" });

    jwt.verify(token, process.env.JWT_SECRET || "secret123", (err, user) => {
        if (err) return res.status(403).json({ message: "❌ Недействительный токен" });

        req.user = user;
        next();
    });
}

app.post("/registration", async (req,res) => {
    try{
        const checkQuery  = `SELECT * FROM users WHERE email = ?`;
        const {email, password} = req.body;
        const [users] = await db.query(checkQuery, [email]);

        if (users.length > 0) {
            return res.status(400).json({ message: "❗ Пользователь с такой почтой уже существует" });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const query = `INSERT INTO users (email, password)
        VALUES (?, ?);`

        const [result] = await db.query(query, [email, hashedPassword]);

        if (result.affectedRows > 0) {
            console.log("✅ Запись добавлена!");
            res.json({ message: "✅ Запись успешно добавлена!" });
        } else {
            console.error("❌ Ошибка: запись не была добавлена в БД.");
            res.status(500).json({ message: "❌ Ошибка сервера" });
        }  
    } catch (err) {
        console.error("Ошибка регистрации:", err);
        res.status(500).json({ message: "❌ Ошибка сервера" });
    }
})

app.post('/checkEmail', async (req, res) => {
    try {
        const { usermail } = req.body;
        const [result] = await db.query('SELECT * FROM users WHERE email = ?', [usermail]);

        if (result.length > 0) {
            return res.status(400).json({ message: '❗ Пользователь с такой почтой уже существует' });
        }

        res.json({ message: 'Email свободен' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

app.post("/sendMail", (req, res) => {
    try{
        const { usermail } = req.body;

        const verificationCode = String(Math.floor(100000 + Math.random() * 900000))
        verificationCodes.set(usermail, verificationCode);

        setTimeout(() => {
            verificationCodes.delete(usermail);
        }, 2 * 60 * 1000);

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth:{
                user: process.env.EMAIL,
                pass: process.env.GOOGLEPASSWORD
            }
        })

        const mailOptions = {
            from: "zavaliyvlad0@gmail.com",
            to: usermail,
            subject: "Код подтверждения",
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
                    <h2 style="color: #444;">Здравствуйте, ${usermail}!</h2>
                    <p>Ваш код для подтверждения почты:</p>
                    <p style="font-size: 24px; font-weight: bold; color: #007BFF; letter-spacing: 3px;">
                        ${verificationCode}
                    </p>
                    <p style="font-size: 14px; color: #666;">
                        Этот код действует 2 минуты. Если вы не запрашивали подтверждение — просто игнорируйте это письмо.
                    </p>
                </div>
            `
        };

        transporter.sendMail(mailOptions)

    } catch (err) {
        console.error("Ошибка при отправлении:", err);
        res.status(500).json({ message: "❌ Ошибка сервера" });
    }

})

app.post("/verify", (req, res) => {
    const { email, code } = req.body;

    const storedCode = verificationCodes.get(email);

    if (!storedCode) {
        return res.status(400).json({ message: "⛔ Код не найден или просрочен" });
    }
    if (storedCode !== code) {
        return res.status(400).json({ message: "❌ Неверный код подтверждения" });
    }

    verificationCodes.delete(email); 

    res.json({ message: "✅ Код подтверждён, можно продолжать" });
});

app.post("/authorization", async (req, res) => {
    try{
        const {email, password} = req.body;

        const checkQuery  = `SELECT * FROM users WHERE email = ?`;
        const [result] = await db.query(checkQuery, [email]);

        if (result.length < 1) {
            return res.status(400).json({ message: "❗ Пользоватея с такой почтой не существует" });
        }

        const user = result[0];
        const isMatchPassword = await bcrypt.compare(password, user.password);

        if (!isMatchPassword) {
            return res.status(401).json({ message: "❌ Неверный пароль" });
        }

        const token = jwt.sign(
            { userId: user.user_id },
            process.env.JWT_SECRET || "secret123",
            { expiresIn: "5h" }
        );
        console.log(token);
        res.status(200).json({ message: "✅ Успешная авторизация", token });

    } catch (err) {
        console.error("Ошибка регистрации:", err);
        res.status(500).json({ message: "❌ Ошибка сервера" });
    }
});

app.post("/newnote", authenticateToken, async (req, res) => {
    const {title, content, status} = req.body;
    const user_id = req.user.userId;

    try {
        const [insertResult] = await db.query(
            `INSERT INTO notes (user_id, title, content, status) VALUES (?, ?, ?, ?)`,
            [user_id, title, content, status]
        );

        const [rows] = await db.query(
            `SELECT * FROM notes WHERE id = ?`,
            [insertResult.insertId]
        );

        const newNote = rows[0];

        res.json({ message: "✅ Note added ", note: newNote });

    } catch (err) {
        console.error("Error adding note:", err);
        res.status(500).json({ message: "❌ Server error" });
    }
});

app.get('/usernotes', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId; 
        const query = 'SELECT * FROM notes WHERE user_id = ? ORDER BY created_at DESC';
        const [result] = await db.query(query, [userId]);

        res.json({ notes: result });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "❌ Ошибка сервера" });
    }
});

app.put('/notes/:id/status', authenticateToken, async(req,res) => {
    const noteId  = req.params.id;
    const { status } = req.body;
    try{
        const [query] = await db.query(
            `UPDATE notes SET status =? WHERE id = ?`,
            [status, noteId]
        );

        const [rows] = await db.query(
            `SELECT * FROM notes WHERE id = ?`,
            [noteId]
        );

        const updatedNote = rows[0];
        res.json({updatedNote: updatedNote})
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "❌ Error fetching notes" });
    }
})

app.delete('/notes/delete/:id', authenticateToken, async (req, res) => {
    const noteId = req.params.id;

    try {
        await db.query('BEGIN');

        const [rows] = await db.query(
            `SELECT * FROM notes WHERE id = ?`,
            [noteId]
        );

        const resultRow = rows[0];

        if (!resultRow) {
            await db.query('ROLLBACK');
            return res.status(404).json({ message: "Note not found" });
        }

        // await db.query(`DELETE FROM notesitem WHERE note_id = ?`, [noteId]);
        await db.query(`DELETE FROM notes WHERE id = ?`, [noteId]);

        await db.query('COMMIT');

        res.json({ deletedNote: resultRow });
    } catch (err) {
        await db.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ message: "❌ Error deleting note and its items" });
    }
});

app.put('/notes/update/:id', authenticateToken, async(req, res) => {
    try {
        const userId = req.user.userId; 
        const noteId = req.params.id;
        const { title, content } = req.body;

        const [result] = await db.query(`
            UPDATE notes
            SET title = ?, content = ?
            WHERE id = ? AND user_id = ?`, [title, content,noteId, userId]
        ); 
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Заметка не найдена" });
        }

        const [updatedRows] = await db.query(
            `SELECT * FROM notes WHERE id = ? AND user_id = ?`, [noteId, userId]
        );

        res.json({ note: updatedRows[0] });
    } catch (err) {
        console.error(err);
    }
})

app.post('/newitems', async (req, res) => {
    try {
        const { note_id, content, is_done } = req.body;

        if (!note_id || !content) {
            return res.status(400).json({ message: "❌ Отсутствуют обязательные данные" });
        }

        const [insertResult] = await db.query(
            `INSERT INTO notesitems (note_id, content, is_done) VALUES (?, ?, ?)`,
            [note_id, content, is_done || false]
        );

        const [rows] = await db.query(
            `SELECT * FROM notesitems WHERE item_id = ?`,
            [insertResult.insertId]
        );

        res.status(200).json({  message: "✅ Item добавлен", noteItem: rows[0]});

    } catch (err) {
        console.error("Ошибка добавления item:", err);
        res.status(500).json({ message: "❌ Ошибка сервера" });
    }
});

app.get('/usernoteitems', authenticateToken, async (req, res) => {
    try {
        const noteId = req.query.note_id;
        // if (!noteId) return res.status(400).json({ message: "❌ note_id обязателен" });

        const [rows] = await db.query(
            'SELECT * FROM notesitems WHERE note_id = ? ORDER BY created_at',
            [noteId]
        );

        res.status(200).json({ noteItems: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "❌ Ошибка сервера" });
    }
});



app.delete('/notesitem/delete/:item_id', authenticateToken, async (req, res) => {
    const itemId = req.params.item_id;

    try {
        const [result] = await db.query(
            'DELETE FROM notesitems WHERE item_id = ?',
            [itemId]
        );

        if (!result) {
            return res.status(404).json({ message: "Note item not found" });
        }

        res.json({ message: "✅ Note item deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "❌ Error deleting note item" });
    }
});

app.put('/noteitems/:item_id/status', authenticateToken, async (req, res) => {
    const itemId = req.params.item_id;
    const { is_done } = req.body;

    try {
        const [updateResult] = await db.query(
            'UPDATE notesitems SET is_done = ? WHERE item_id = ?',
            [is_done, itemId]
        );

        if (!updateResult) {
            return res.status(404).json({ message: "Note item not found" });
        }

        const [rows] = await db.query(
            'SELECT * FROM notesitems WHERE item_id = ?',
            [itemId]
        );

        res.json({ updatedNotesItem: rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "❌ Error updating note item" });
    }
});

app.put("/notesitems/update/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        await db.query("UPDATE notesitems SET content = ? WHERE item_id = ?", [content, id]);

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update item" });
    }
});

app.listen(PORT, ()=> {console.log(`server is running on ${PORT}`)})