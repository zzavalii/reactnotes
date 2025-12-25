import express from "express";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import db from "../userdb.js";

const router = express.Router();
const saltRounds = 10;

const verificationCodes = new Map();

router.post("/registration", async (req, res) => {
    try {
        const checkQuery = `SELECT * FROM users WHERE email = ?`;
        const { email, password } = req.body;
        const [users] = await db.query(checkQuery, [email]);

        if (users.length > 0) {
            return res.status(400).json({ message: "❗ A user with this email already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const query = `INSERT INTO users (email, password)
        VALUES (?, ?);`

        const [result] = await db.query(query, [email, hashedPassword]);

        if (result.affectedRows > 0) {
            res.json({ message: "Entry successfully added!" });
        } else {
            console.error("Error: the entry was not added to the DB.");
            res.status(500).json({ message: "Server error" });
        }
    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({ message: "Server error" });
    }
})

router.post('/checkEmail', async (req, res) => {
    try {
        const { usermail } = req.body;
        const [result] = await db.query('SELECT * FROM users WHERE email = ?', [usermail]);

        if (result.length > 0) {
            return res.status(400).json({ message: '❗ A user with this email already exists.' });
        }

        res.json({ message: 'Email available' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post("/sendMail", (req, res) => {
    try {
        const { usermail } = req.body;

        const verificationCode = String(Math.floor(100000 + Math.random() * 900000))
        verificationCodes.set(usermail, verificationCode);

        setTimeout(() => {
            verificationCodes.delete(usermail);
        }, 2 * 60 * 1000);

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.GOOGLEPASSWORD
            }
        })

        const mailOptions = {
            from: "zavaliyvlad0@gmail.com",
            to: usermail,
            subject: "Verification code",
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
                    <h2 style="color: #444;">Hi, ${usermail}!</h2>
                    <p>Your email confirmation code:</p>
                    <p style="font-size: 24px; font-weight: bold; color: #007BFF; letter-spacing: 3px;">
                        ${verificationCode}
                    </p>
                    <p style="font-size: 14px; color: #666;">
                        This code is valid for 2 minutes. If you did not request confirmation, simply ignore this email.
                    </p>
                </div>
            `
        };

        transporter.sendMail(mailOptions)

    } catch (err) {
        console.error("Sending error:", err);
        res.status(500).json({ message: "Server error" });
    }

})

router.post("/verify", (req, res) => {
    const { email, code } = req.body;

    const storedCode = verificationCodes.get(email);

    if (!storedCode) {
        return res.status(400).json({ message: "Code not found or expired" });
    }
    if (storedCode !== code) {
        return res.status(400).json({ message: "Incorrect confirmation code" });
    }

    verificationCodes.delete(email);

    res.json({ message: "The code has been confirmed, you may proceed." });
});

router.post("/authorization", async (req, res) => {
    try {
        const { email, password, rememberMe } = req.body;

        const checkQuery = `SELECT * FROM users WHERE email = ?`;
        const [result] = await db.query(checkQuery, [email]);

        if (result.length < 1) {
            return res.status(400).json({ message: "❗ A user with this email already exists." });
        }

        const user = result[0];
        const isMatchPassword = await bcrypt.compare(password, user.password);

        if (!isMatchPassword) {
            return res.status(401).json({ message: "Incorrect password" });
        }

        const expiresIn = rememberMe ? '5d' : '5h';

        const token = jwt.sign(
            { userId: user.user_id },
            process.env.JWT_SECRET || "secret123",
            { expiresIn }
        );
        console.log(token);

        res.status(200).json({ message: "Authorization success", token, email: user.email, userId: user.user_id });

    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;