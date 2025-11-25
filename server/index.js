import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from './routes/auth.js';
import notesRoutes from './routes/note.js';
import itemsRoutes from './routes/items.js';
import reminderRoutes from './routes/reminders.js';
import tagsRoutes from './routes/tags.js';

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

app.use("/", authRoutes);
app.use("/", notesRoutes);
app.use("/", itemsRoutes);
app.use("/", reminderRoutes);
app.use("/", tagsRoutes);

app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ 
        message: "❌ Internal server error",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.listen(PORT, () => { console.log(`server is running on ${PORT}`) })