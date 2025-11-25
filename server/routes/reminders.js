// routes/reminders.js
import express from "express";
import db from "../userdb.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.put("/notes/:id/reminder", authenticateToken, async (req, res) => {
    const noteId = req.params.id;
    const userId = req.user.userId;
    const { reminder_type, reminder_time, timer_duration } = req.body;

    try {
        let finalReminderTime = reminder_time;
        if (reminder_type === 'timer' && timer_duration) {
            const now = new Date();
            finalReminderTime = new Date(now.getTime() + timer_duration * 60000);
            finalReminderTime = finalReminderTime.toISOString().slice(0, 19).replace("T", " ");
        }

        const result = await db.query(
            `UPDATE notes
            SET reminder_type = ?, reminder_time = ?, timer_duration = ?, is_reminder_sent = 0
            WHERE id = ? AND user_id = ?`,
            [reminder_type, finalReminderTime, timer_duration, noteId, userId]
        );

        res.json({ message: "Reminder saved" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
});

router.get("/notes/reminders", async (req, res) => {
    const [rows] = await db.query(`
        SELECT id, title, content, reminder_time, is_reminder_sent
        FROM notes
        WHERE reminder_time IS NOT NULL AND is_reminder_sent = 0
    `);
    res.json(rows);
});

router.put("/notes/:id/reminderSent", async (req, res) => {
    const { id } = req.params;
    await db.query(`UPDATE notes SET is_reminder_sent = 1 WHERE id = ?`, [id]);
    res.sendStatus(200);
});
export default router;
