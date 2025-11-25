import { useReducer, useEffect, useRef, useMemo, useCallback, useState } from 'react';
import './FocusMode.css';
// import Header from '../header/header';


// import TogglePanel from '../togglePanel/TogglePanel';

// import { notesReducer, initialState, ACTIONS } from './notes/store/notesReducer';
// import { useNotes } from './hooks/useNotes';
// import { useTags } from './hooks/useTags';
// import { useWeather } from './hooks/useWeather';

export default function FocusMode() {
    const [notes, setNotes] = useState([]);
    const [selectedNote, setSelectedNote] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Timer state
    const [timerMinutes, setTimerMinutes] = useState(25);
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [timerActive, setTimerActive] = useState(false);
    
    // Stopwatch state
    const [stopwatchTime, setStopwatchTime] = useState(0);
    const [stopwatchActive, setStopwatchActive] = useState(false);
    
    const timerIntervalRef = useRef(null);
    const stopwatchIntervalRef = useRef(null);

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
            alert("Error loading notes");
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
                        setTimerActive(false);
                        playNotificationSound();
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

    function playNotificationSound() {
        const audio = new Audio("/sound/confident-543.ogg");
        audio.play().catch(e => console.log("Sound error:", e));
    }

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
        // Reset timers when selecting new note
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
            alert("Error updating status");
        }
    }

    if (loading) {
        return <div className="loading-container">Loading...</div>;
    }

    return (
        <>
        <div className="focus-mode-container">
            <h1 className="focus-mode-title">Focus Mode</h1>

            {/* Notes List */}
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
                        >
                            <div className="note-card-header">
                                <h3 className="note-card-title">
                                    {note.title || 'Untitled'}
                                </h3>
                                <span className={`note-status status-${note.status || 'not_started'}`}>
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
                                <h2 className="modal-title">
                                    {selectedNote.title || 'Untitled'}
                                </h2>
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
                                    <option value="completed">Completed</option>
                                </select>
                            </div>

                            <div className="note-content-section">
                                <h3 className="content-heading">Content:</h3>
                                <p className="content-text">
                                    {selectedNote.content || 'No content'}
                                </p>
                            </div>
                        </div>

                        {/* Timers Panel */}
                        <div className="timers-panel">
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
                        </div>
                    </div>
                </div>
            )}
        </div>
        </>
    );
}