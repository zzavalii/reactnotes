import { useState } from "react";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../reminder/ReminderForm.css'

export default function ReminderForm({ noteId, token }) {
    const [type, setType] = useState("date");
    const [dateTime, setDateTime] = useState(new Date());
    const [timer, setTimer] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit() {
        setLoading(true);
        try {
            const body =
                type === "date"
                    ? {
                        reminder_type: "date",
                        reminder_time: dateTime.toISOString().slice(0, 19).replace("T", " "),
                        timer_duration: null,
                    }
                    : {
                        reminder_type: "timer",
                        reminder_time: null,
                        timer_duration: parseInt(timer, 10),
                    };

            const res = await fetch(`http://localhost:3001/notes/${noteId}/reminder`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });

            if (!res.ok) throw new Error("Не удалось сохранить напоминание");
            alert("✅ Напоминание сохранено!");
            // onClose?.();
        } catch (err) {
            console.error(err);
            alert("❌ Ошибка при сохранении");
        } finally {
            setLoading(false);
        }
    }

    const [value, onChange] = useState(new Date());

    return (
        <>
            <div className="reminderForm" onClick={(e) => e.stopPropagation()}>

                <label className="labelTypePicker">
                    Type of notification
                    <select value={type} className="selectOfType" onChange={(e) => setType(e.target.value)}>
                        <option value="date">Data and time</option>
                        <option value="timer">Timer</option>
                    </select>
                </label>

                {type === "date" && (
                    <div>
                        <Calendar onChange={onChange} value={value} locale="en-US"/>
                    </div>
                )}

                {type === "timer" && (
                    <div className="timer-picker">
                        <label className="timer-label">Select time of notification</label>
                        <div className="timer-input-wrapper">
                            <input
                                type="time"
                                value={timer}
                                onChange={(e) => setTimer(e.target.value)}
                                className="timer-input"
                            />
                        </div>
                        <p className="timer-hint">Set the hour and minute for notification</p>
                    </div>
                )}



                <button onClick={handleSubmit} className="btnSaveTimeNotification">Save</button>
            </div>
        </>
    )
}