import express from "express"
import db from "../userdb.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router()

router.post("/notes/:id/addnewtag", async (req, res) => {
    const { id } = req.params;
    const { tags } = req.body;

    if (!Array.isArray(tags)) {
        return res.status(400).json({ error: "tags must be Array" });
    }

    try {
        for (const tag of tags) {
            await db.query(
                "INSERT IGNORE INTO tags (name) VALUES (?)",
                [tag]
            );
        }

        const addedTags = [];
        for (const tag of tags) {
            const [rows] = await db.query("SELECT id, name FROM tags WHERE name = ?", [tag]);
            if (rows.length) {
                const tagId = rows[0].id;
                await db.query(
                    "INSERT IGNORE INTO note_tags (note_id, tag_id) VALUES (?, ?)",
                    [id, tagId]
                );
                addedTags.push({ id: tagId, name: tag });
            }
        }

        res.json({ success: true, tags: addedTags });

    } catch (error) {
        console.error("Error updating tags:", error);
        res.status(500).json({ error: "Server error" });
    }
});

router.get("/notes/:id", async (req, res) => {
    const { id } = req.params;

    const [noteRows] = await db.query("SELECT * FROM notes WHERE id = ?", [id]);
    if (!noteRows.length) return res.status(404).json({ error: "Notes not found" });

    const [tagRows] = await db.query(`
        SELECT t.id, t.name  
        FROM tags t
        JOIN note_tags nt ON nt.tag_id = t.id
        WHERE nt.note_id = ?
    `, [id]);

    const tags = tagRows.map(t => ({ id: t.id, name: t.name }));  
    res.json({ ...noteRows[0], tags });
});

router.get("/tags", async(req, res) => {
    try {
        const [rows] = await db.query("SELECT DISTINCT name FROM tags ORDER BY name ASC");
        res.json({ tags: rows.map(row => row.name) });
    } catch (err) {
        console.error("Error to get tags:", error);
        res.status(500).json({ error: "Server error" });
    }
})

router.delete("/notes/delete/:noteId/tags/:tagId", async (req, res) => {   
    const noteIdNum = Number(req.params.noteId);
    const tagIdNum = Number(req.params.tagId);

    try {
        const [result] = await db.query("DELETE FROM note_tags WHERE note_id = ? AND tag_id = ?", [noteIdNum, tagIdNum]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Tag not found for this note" });
        }

        const [stillUsed] = await db.query("SELECT * FROM note_tags WHERE tag_id = ?", [tagIdNum]);
        if (stillUsed.length === 0) {
            await db.query("DELETE FROM tags WHERE id = ?", [tagIdNum]);
        }

        res.json({ message: "Tag removed from note" });
    } catch (err) {
        console.error("Error deleting tag:", err);
        res.status(500).json({ error: "Server error" });
    }
});

router.get("/allnote/tags", async(req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                t.name AS tag_name,
                n.id AS note_id,
                n.title,
                n.content
            FROM tags t
            JOIN note_tags nt ON nt.tag_id = t.id
            JOIN notes n ON n.id = nt.note_id
            ORDER BY t.name;
        `);

        const grouped = rows.reduce((acc, row) => {
            if (!acc[row.tag_name]) acc[row.tag_name] = [];
            acc[row.tag_name].push({
                id: row.note_id,
                title: row.title,
                content: row.content
            });
            return acc;
        }, {});

        res.json(grouped);
    } catch (err) {
        console.error("Error to get tags:", error);
        res.status(500).json({ error: "Server error" });
    }
})

export default router;