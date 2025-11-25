import express from "express"
import db from "../userdb.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router()


router.post('/newitems', async (req, res) => {
    try {
        const { note_id, content, is_done } = req.body;

        if (!note_id || !content) {
            return res.status(400).json({ message: "❌ No data available" });
        }

        const [insertResult] = await db.query(
            `INSERT INTO notesitems (note_id, content, is_done) VALUES (?, ?, ?)`,
            [note_id, content, is_done || false]
        );

        const [rows] = await db.query(
            `SELECT * FROM notesitems WHERE item_id = ?`,
            [insertResult.insertId]
        );

        res.status(200).json({ message: "✅ Item добавлен", noteItem: rows[0] });

    } catch (err) {
        console.error("Error adding item:", err);
        res.status(500).json({ message: "❌ Server error" });
    }
});

router.get('/usernoteitems', authenticateToken, async (req, res) => {
    try {
        const noteId = req.query.note_id;

        const [rows] = await db.query(
            'SELECT * FROM notesitems WHERE note_id = ? ORDER BY created_at',
            [noteId]
        );

        res.status(200).json({ noteItems: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "❌ Server error" });
    }
});

router.delete('/notesitem/delete/:item_id', authenticateToken, async (req, res) => {
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

router.put('/noteitems/:item_id/status', authenticateToken, async (req, res) => {
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

router.put("/notesitems/update/:id", async (req, res) => {
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

export default router;