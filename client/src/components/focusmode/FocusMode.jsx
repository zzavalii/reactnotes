import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './FocusMode.css';
import { STATUS_CONFIG } from '../../config/noteStatuses';

export default function FocusMode() {

    const [notes, setNotes] = useState([]);
    const [selectedNote, setSelectedNote] = useState(null);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");

    // Timer state
    const [timerMinutes, setTimerMinutes] = useState(25);
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [timerActive, setTimerActive] = useState(false);

    // Stopwatch state
    const [stopwatchTime, setStopwatchTime] = useState(0);
    const [stopwatchActive, setStopwatchActive] = useState(false);

    const timerIntervalRef = useRef(null);
    const stopwatchIntervalRef = useRef(null);

    const [timerType, setTimerType] = useState('timer');

    const buttonDarkThemeRef = useRef(null);
    
    const [darkTheme, setDarkTheme] = useState(() => {
        return localStorage.getItem("darkTheme") === 'true'; 
    })

    useEffect(() => {
        if (darkTheme) {
            document.body.classList.add("darker");
        } else {
            document.body.classList.remove("darker");
        }
    }, [darkTheme]);

    function toggleDarkTheme() {
        setDarkTheme(prev => {
            const newTheme = !prev;
            localStorage.setItem("darkTheme", newTheme);  
            return newTheme;
        });
    }

    // render note
    useEffect(() => {
        fetchNotes();
    }, []);

    async function fetchNotes() {
        try {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");
            const res = await fetch("http://localhost:3001/usernotes", {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Failed to fetch notes");

            const data = await res.json();
            setNotes(data.notes || []);
        } catch (err) {
            console.error(err);
            console.log("Error loading notes");
        } finally {
            setLoading(false);
        }
    }

    // Timer logic
    useEffect(() => {
        if (timerActive && (timerMinutes > 0 || timerSeconds > 0)) {
            timerIntervalRef.current = setInterval(() => {
                if (timerSeconds === 0) {
                    if (timerMinutes === 0) {
                        playNotificationSound();
                        setTimerActive(false);
                        alert("Timer finished!");
                    } else {
                        setTimerMinutes(prev => prev - 1);
                        setTimerSeconds(59);
                    }
                } else {
                    setTimerSeconds(prev => prev - 1);
                }
            }, 1000);
        } else {
            clearInterval(timerIntervalRef.current);
        }

        return () => clearInterval(timerIntervalRef.current);
    }, [timerActive, timerMinutes, timerSeconds]);

    // Stopwatch logic
    useEffect(() => {
        if (stopwatchActive) {
            stopwatchIntervalRef.current = setInterval(() => {
                setStopwatchTime(prev => prev + 1);
            }, 1000);
        } else {
            clearInterval(stopwatchIntervalRef.current);
        }

        return () => clearInterval(stopwatchIntervalRef.current);
    }, [stopwatchActive]);

    function showNotification(title, body) {
        if (Notification.permission === "granted") {
            new Notification(title, { body });
        }
    }

    function playNotificationSound() {
        const audio = new Audio("/sound/confident-543.ogg");
        audio.play().catch(err => console.error("Audio playback error:", err));
    }

    useEffect(() => {
        if (Notification.permission !== "granted") {
            Notification.requestPermission();
        }
    }, []);

    function formatTime(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    function handleNoteClick(note) {
        setSelectedNote(note);
        setTimerActive(false);
        setStopwatchActive(false);
        setTimerMinutes(25);
        setTimerSeconds(0);
        setStopwatchTime(0);
    }

    function closeNote() {
        setSelectedNote(null);
        setTimerActive(false);
        setStopwatchActive(false);
    }

    async function updateNoteStatus(noteId, newStatus) {
        try {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");
            const res = await fetch(`http://localhost:3001/notes/${noteId}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!res.ok) throw new Error("Failed to update status");

            const data = await res.json();
            setNotes(prev => prev.map(n => n.id === noteId ? data.updatedNote : n));
            if (selectedNote?.id === noteId) { 
                setSelectedNote(data.updatedNote); 
            }
        } catch (err) {
            console.error(err);
            console.log("Error updating status");
        }
    }

    const [editingNoteId, setEditingNoteId] = useState(null);
    const [editingTitle, setEditingTitle] = useState('');
    const [editingContent, setEditingContent] = useState('');
    const outsSaveRefTitle = useRef(null)
    const outsSaveRefContent = useRef(null)

    async function saveEditedNote() {
        try {
            const response = await fetch(`http://localhost:3001/notes/update/${editingNoteId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ title: editingTitle, content: editingContent })
            });

            if (!response.ok) {
                console.error("Error while editing");
            }

            const data = await response.json();
            const updated = data.updatedNote || data.note; 

            setNotes(prev =>
                prev.map(n => n.id.toString() === editingNoteId ? data.note : n)
            );

            if (selectedNote && selectedNote.id.toString() === editingNoteId) {
                setSelectedNote(updated);
            }

            setEditingNoteId(null);
            setEditingTitle('');
            setEditingContent('');
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        function handleOutsideClickSave(event) {
            if (editingNoteId) {
                const clickedOutsideTitle = outsSaveRefTitle.current && !outsSaveRefTitle.current.contains(event.target);
                const clickedOutsideContent = outsSaveRefContent.current && !outsSaveRefContent.current.contains(event.target);

                if (clickedOutsideTitle && clickedOutsideContent) {
                    saveEditedNote();
                    cancelEditing();
                }
            }
        }

        if (editingNoteId) {
            document.addEventListener("mousedown", handleOutsideClickSave);
        }

        return () => {
            document.removeEventListener("mousedown", handleOutsideClickSave);
        };
    }, [editingNoteId, saveEditedNote, cancelEditing]);

    function startEditing(note) {
        setEditingNoteId(note.id.toString());
        setEditingTitle(note.title);
        setEditingContent(note.content);
    }

    function cancelEditing() {
        setEditingNoteId(null);
        setEditingTitle('');
        setEditingContent('');
    }

    return (
        <>
            <div className="focus-mode-container">

                <div className="notes-grid">
                    {notes.length === 0 ? (
                        <div className="empty-state">
                            No notes yet. Create your first note!
                        </div>
                    ) : (
                        notes.map(note => (
                            <div
                                key={note.id}
                                onClick={() => handleNoteClick(note)}
                                className="note-card"
                                style={{
                                    borderLeftColor: STATUS_CONFIG[note.status]?.color || '#ccc'
                                }}
                            >
                                <div className="note-card-header">
                                    <h3 className="note-card-title">
                                        {note.title || 'Untitled'}
                                    </h3>
                                    <span 
                                        style={{
                                            color: STATUS_CONFIG[note.status]?.color || '#666',
                                            backgroundColor: STATUS_CONFIG[note.status]?.bgColor || '#f3f4f6'
                                        }} 
                                        className={`note-status status-${note.status || 'not_started'}`}
                                    >
                                            {note.status?.replace('_', ' ') || 'not started'}
                                    </span>
                                </div>
                                <p className="note-card-content">
                                    {note.content || 'No content'}
                                </p>
                            </div>
                        ))
                    )}
                </div>

                {/* Modal with Note Details and Timers */}
                {selectedNote && (
                    <div className="modal-overlay" onClick={closeNote}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            {/* Note Content */}
                            <div className="modal-note-section">
                                <div className="modal-header">

                                {editingNoteId?.toString() === selectedNote.id.toString() ? (
                                    <div ref={outsSaveRefTitle}>
                                        <input
                                            type="text"
                                            placeholder="Enter a title..."
                                            value={editingTitle}
                                            onChange={(e) => setEditingTitle(e.target.value)}
                                            id="new_note_inputTitle"
                                            className="new_note_inputTitle"
                                            // onClick={(e) => e.stopPropagation()}
                                            // autoFocus
                                        ></input>
                                    </div>
                                    ) : (
                                    <>
                                        <h2 className="modal-title">
                                            {selectedNote.title || 'Untitled'}
                                        </h2>
                                    </>

                                    )}
                                    <button onClick={closeNote} className="close-button">
                                        ✕
                                    </button>
                                </div>

                                <div className="status-selector">
                                    <label className="status-label">Status:</label>
                                    <select
                                        value={selectedNote.status || 'not_started'}
                                        onChange={e => updateNoteStatus(selectedNote.id, e.target.value)}
                                        className="status-select"
                                    >
                                        <option value="not_started">Not Started</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="done">Done</option>
                                    </select>
                                </div>

                                <div className="note-content-section">
                                    <h3 className="content-heading">Content:</h3>
                                    {editingNoteId?.toString() === selectedNote.id.toString() ? (
                                        <div ref={outsSaveRefContent}>
                                            <input
                                                type="text"
                                                placeholder="Enter a note..."
                                                value={editingContent}
                                                onChange={(e) => setEditingContent(e.target.value)}
                                                id="new_note_input"
                                                className=''
                                            />
                                            <div className="editContainerButton">
                                                <button className="saveEditingButton" onClick={(e) => {
                                                    e.stopPropagation()
                                                    saveEditedNote()
                                                }}>Save</button>
                                                <button className="cancelEditingButton" onClick={(e) => {
                                                    e.stopPropagation()
                                                    cancelEditing()
                                                }}>Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="content-text">
                                                {selectedNote.content || 'No content'}
                                            </p>
                                        </>
                                    )}
                                </div>

                                <button 
                                    id='btnEdit' 
                                    className="btnEdit" 
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        startEditing(selectedNote)
                                }}>Edit</button>
                            </div>

                            {/* Timers Panel */}
                            <div className="timers-panel">

                                <div className="timerTypePicker">
                                    <input type="button" 
                                        onClick={() => {setTimerType("timer")}} 
                                        className={`timerButtonPicker ${timerType === 'timer' ? 'active' : ' '}`} 
                                        value="Timer"
                                    />
                                    <input type="button" 
                                        onClick={() => {setTimerType("stopwatch")}} 
                                        className={`stopwatchButtonPicker ${timerType === 'stopwatch' ? 'active' : ' '}`} 
                                        value="Stopwatch"
                                    />
                                </div>

                                {timerType === 'timer' && (<>

                                    {/* Timer */}
                                    <div className="timer-card">
                                        <h3 className="timer-heading">Timer ⏱</h3>

                                        <div className={`timer-display ${timerActive ? 'active' : ''}`}>
                                            {timerMinutes.toString().padStart(2, '0')}:{timerSeconds.toString().padStart(2, '0')}
                                        </div>

                                        {!timerActive && (
                                            <div className="timer-inputs">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="99"
                                                    value={timerMinutes}
                                                    onChange={e => setTimerMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                                                    className="timer-input"
                                                    placeholder="Min"
                                                />
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="59"
                                                    value={timerSeconds}
                                                    onChange={e => setTimerSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                                                    className="timer-input"
                                                    placeholder="Sec"
                                                />
                                            </div>
                                        )}

                                        <div className="timer-controls">
                                            <button
                                                onClick={() => setTimerActive(!timerActive)}
                                                disabled={!timerActive && timerMinutes === 0 && timerSeconds === 0}
                                                className={`timer-button ${timerActive ? 'pause' : 'start'}`}
                                            >
                                                {timerActive ? '⏸ Pause' : '▶ Start'}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setTimerActive(false);
                                                    setTimerMinutes(25);
                                                    setTimerSeconds(0);
                                                }}
                                                className="timer-button reset"
                                            >
                                                Reset
                                            </button>
                                        </div>
                                    </div>
                                </>
                                )}

                                {timerType === 'stopwatch' && (
                                    <>
                                        {/* Stopwatch */}
                                        <div className="timer-card">
                                            <h3 className="timer-heading">Stopwatch</h3>

                                            <div className={`timer-display ${stopwatchActive ? 'active-stopwatch' : ''}`}>
                                                {formatTime(stopwatchTime)}
                                            </div>

                                            <div className="timer-controls">
                                                <button
                                                    onClick={() => setStopwatchActive(!stopwatchActive)}
                                                    className={`timer-button ${stopwatchActive ? 'pause' : 'start'}`}
                                                >
                                                    {stopwatchActive ? '⏸ Pause' : '▶ Start'}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setStopwatchActive(false);
                                                        setStopwatchTime(0);
                                                    }}
                                                    className="timer-button reset"
                                                >
                                                    Reset
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}

                            </div>
                        </div>
                    </div>
                )}
                <Link to="/notes">
                    <input type="button" className='back' value="Back to main"/>
                </Link>

                <input type="button" className='darkthemebutton' name="" value="DarkTheme" ref={buttonDarkThemeRef} onClick={toggleDarkTheme} id="" />
            </div>
        </>
    );
}