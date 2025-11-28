import express from "express";
import db from "../userdb.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/newnote", authenticateToken, async (req, res) => {
    const { title, content, status } = req.body;
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
        res.status(500).json({ message: "Server error" });
    }
});

router.get('/usernotes', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const query = 'SELECT * FROM notes WHERE user_id = ? ORDER BY created_at DESC';
        const [result] = await db.query(query, [userId]);

        res.json({ notes: result });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.put('/notes/:id/status', authenticateToken, async (req, res) => {
    const noteId = req.params.id;
    const { status } = req.body;
    try {
        const [query] = await db.query(
            `UPDATE notes SET status =? WHERE id = ?`,
            [status, noteId]
        );

        const [rows] = await db.query(
            `SELECT * FROM notes WHERE id = ?`,
            [noteId]
        );

        const updatedNote = rows[0];
        res.json({ updatedNote: updatedNote })
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching notes" });
    }
})

router.delete('/notes/delete/:id', authenticateToken, async (req, res) => {
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

        await db.query(`DELETE FROM notes WHERE id = ?`, [noteId]);

        await db.query('COMMIT');

        res.json({ deletedNote: resultRow });
    } catch (err) {
        await db.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ message: "Error deleting note and its items" });
    }
});

router.put('/notes/update/:id', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const noteId = req.params.id;
        const { title, content } = req.body;

        const [result] = await db.query(`
            UPDATE notes
            SET title = ?, content = ?
            WHERE id = ? AND user_id = ?`, [title, content, noteId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Note not found" });
        }

        const [updatedRows] = await db.query(
            `SELECT * FROM notes WHERE id = ? AND user_id = ?`, [noteId, userId]
        );

        res.json({ note: updatedRows[0] });
    } catch (err) {
        console.error(err);
    }
})

export default router; 