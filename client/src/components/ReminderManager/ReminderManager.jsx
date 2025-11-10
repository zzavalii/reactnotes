import { useEffect } from "react";

export default function ReminderManager() {

    function showNotification(title, body) {
        if (Notification.permission === "granted") {
            new Notification(title, { body });
        }
    }

    function playNotificationSound() {
        const audio = new Audio("/sound/confident-543.ogg");
        audio.play().catch(err => console.error("Ошибка воспроизведения звука:", err));
    }

    useEffect(() => {
        if (Notification.permission !== "granted") {
            Notification.requestPermission();
        }
    }, []);

    useEffect(() => {
        const checkReminders = async () => {
            try {
                const res = await fetch("http://localhost:3001/notes/reminders")
                const notes = await res.json();

                const now = new Date();

                for (const note of notes) {
                    if (!note.reminder_time || note.is_reminder_sent) continue;

                    const reminderTime = new Date(note.reminder_time);

                    if (reminderTime <= now) {
                        showNotification(note.title, note.content);
                        playNotificationSound();
                        await fetch(`http://localhost:3001/notes/${note.id}/reminderSent`, {
                            method: "PUT",
                        });
                    }
                }
            } catch (error) {
                console.error("Ошибка проверки напоминаний:", error);
            }
        };

        checkReminders(); 
        const interval = setInterval(checkReminders, 60000); 
        return () => clearInterval(interval);
    }, []);

    return null;
}
