import { useEffect, useRef, useState } from "react"
import Header from "../header/header";
import { useNavigate } from 'react-router-dom';
import './Overview.css'
import ItemsModal from '../modal/ItemsModal'

export default function Overview() {
    // -- All useStates --
    const [notes, setNotes] = useState([]);
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [isAdding, setIsAdding] = useState({
        not_started: false
    });

    const [editingNoteId, setEditingNoteId] = useState(null);
    const [editingTitle, setEditingTitle] = useState('');
    const [editingContent, setEditingContent] = useState('');
    // //Weather states
    const [city, setCity] = useState('');
    const [isWeather, setWeather] = useState(false);
    const [weatherData, setWeatherData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [draggingId, setDraggingId] = useState(null);
    const [selectedNoteId, setSelectedNoteId] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const containerRef = useRef(null);
    const notesRef = useRef({});


    //dark theme
    const [darkTheme, setDarkTheme] = useState(() => {
        const savedTheme = localStorage.getItem("darkTheme");
        if (savedTheme === 'true') {
            return savedTheme;
        }
    })
    // -- All useStates --

    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

    function toggleSwapWeather() {
        setWeather(prev => !prev);
    }

    function toggleDarkTheme() {
        setDarkTheme(prev => {
            localStorage.setItem("darkTheme", !prev);
            return !prev;
        });
    }

    async function getCityWeather() {
        if (!city.trim()) {
            setError("Please enter the city");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
            const res = await fetch(weatherUrl);
            if (!res.ok) throw new Error("Не удалось получить погоду");
            const data = await res.json();
            setWeatherData(data);
        } catch (err) {
            setError("Error of downloading info", err)
        } finally {
            setLoading(false);
        }
    }

    async function deleteNotes(noteId) {
        try {
            const response = await fetch(`http://localhost:3001/notes/delete/${noteId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            })
            if (response.ok) {
                setNotes(prev => prev.filter(n => n.id !== noteId));
            } else {
                console.error('Ошибка при удалении');
            }
        } catch (err) {
            console.error(err);
        }
    }

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
                console.error("Ошибка при редактировании");
            }

            const data = await response.json()

            setNotes(prev => prev.map(n => n.id.toString() === editingNoteId ? data.note : n));
            setEditingNoteId(null);
            setEditingTitle('');
            setEditingContent('');

        } catch (err) {
            console.error(err);
        }
    }

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

    //unlogin
    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const now = Date.now() / 1000;
            if (payload.exp < now) {
                localStorage.removeItem("token");
                localStorage.setItem("isLoggedIn", "false");
                navigate("/login");
            }
        } catch (err) {
            console.error("Невалидный токен", err);
            localStorage.removeItem("token");
            localStorage.setItem("isLoggedIn", "false");
            navigate("/login");
        }
    }, [navigate, token])

    //render notes
    useEffect(() => {
        async function fetchNotes() {
            try {
                const response = await fetch("http://localhost:3001/usernotes", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!response.ok) throw new Error("Ошибка сервера");
                const data = await response.json();
                setNotes(data.notes);
            } catch (err) {
                console.error(err);
            }
        }
        fetchNotes();
        const saved = localStorage.getItem("noteColors");
        if (saved) {
            try {
                setNoteColors(JSON.parse(saved))
            } catch (err) {
                console.error(err)
            }
        }
    }, [token]);

    useEffect(() => {
        notes.forEach(note => {
            const pos = JSON.parse(localStorage.getItem(`note-pos-${note.id}`));
            if (pos && notesRef.current[note.id]) {
                const el = notesRef.current[note.id];
                el.style.position = "absolute";
                el.style.left = pos.x + "px";
                el.style.top = pos.y + "px";
            }
        });
    }, [notes]);

    // ----- Dragging ----- //
    const handleDragOver = e => e.preventDefault();

    const handleDrop = e => {
        e.preventDefault();
        const noteId = e.dataTransfer.getData("text/plain");
        const el = notesRef.current[noteId];
        if (!el) return;

        const offsetX = parseInt(el.dataset.offsetX);
        const offsetY = parseInt(el.dataset.offsetY);

        const containerRect = containerRef.current.getBoundingClientRect();
        let x = e.clientX - containerRect.left - offsetX;
        let y = e.clientY - containerRect.top - offsetY;

        x = Math.max(0, Math.min(x, containerRect.offsetWidth - el.offsetWidth));
        y = Math.max(0, Math.min(y, containerRect.offsetHeight - el.offsetHeight));

        el.style.position = "absolute";
        el.style.left = x + "px";
        el.style.top = y + "px";

        // сохраняем позицию
        localStorage.setItem(`note-pos-${noteId}`, JSON.stringify({ x, y }));

        // фиксация — иногда помогает, если браузер сбрасывает offset
        el.draggable = false;
        setTimeout(() => { el.draggable = true; }, 0);
    };

    let zCounter = 1;

    const handleMouseDown = (e, noteId) => {
        const el = notesRef.current[noteId];
        if (!el) return;

        el.style.zIndex = ++zCounter;

        const startX = e.clientX;
        const startY = e.clientY;
        const rect = el.getBoundingClientRect();
        const offsetX = startX - rect.left;
        const offsetY = startY - rect.top;

        const handleMouseMove = (eMove) => {
            let x = eMove.clientX - containerRef.current.getBoundingClientRect().left - offsetX;
            let y = eMove.clientY - containerRef.current.getBoundingClientRect().top - offsetY;

            x = Math.max(0, Math.min(x, containerRef.current.offsetWidth - el.offsetWidth));
            y = Math.max(0, Math.min(y, containerRef.current.offsetHeight - el.offsetHeight));

            el.style.position = "absolute";
            el.style.left = x + "px";
            el.style.top = y + "px";
        };

        const handleMouseUp = (eUp) => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);

            const x = parseInt(el.style.left);
            const y = parseInt(el.style.top);
            localStorage.setItem(`note-pos-${noteId}`, JSON.stringify({ x, y }));
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };
    // ----- Dragging ----- //

    const [noteColors, setNoteColors] = useState({});
    const palette = ["#ffffff", "#fff6a1", "#a1e5ff", "#c1ffc1", "#85BAA1", "#E5A9A9"];

    function changeNoteColor(noteId) {
        setNoteColors(prev => {
            const currentColor = prev[noteId] || palette[0];
            const nextIndex = (palette.indexOf(currentColor) + 1) % palette.length;
            const newColors = { ...prev, [noteId]: palette[nextIndex] };

            localStorage.setItem("noteColors", JSON.stringify(newColors));
            return newColors;
        });
    }

    async function createNote(title, content, status) {
        try {
            const response = await fetch("http://localhost:3001/newnote", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ title, content, status })
            });
            if (!response.ok) throw new Error("Ошибка сервера");
            const data = await response.json();
            setNotes(prev => [...prev, data.note]);
        } catch (err) {
            console.error(err);
            alert("❌ Не удалось сохранить заметку");
        }
    }

    
    function addNote(status) {
        if (!newTitle.trim() || !newContent.trim()) {
            alert("❌ Заполните все поля");
            return;
        }
        createNote(newTitle, newContent, status);
        setNewTitle("");
        setNewContent("");
        toggleAdding(status);
    }

    function toggleAdding(status){
        setIsAdding(prev => ({
            ...prev,
            [status]: !prev[status],
        }))
    }

    const addingRef = useRef(null);

    useEffect(() => {
        function handleOutsideClick(event){
            if(addingRef.current && !addingRef.current.contains(event.target)){
                if(isAdding.not_started){
                    toggleAdding("not_started");
                }
            }
        }
        document.addEventListener("mousedown", handleOutsideClick);
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        }
    }, [isAdding])

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

            if(!response.ok){
                console.error("Ошибка при редактировании");
            }

            const data = await response.json()

            setNotes(prev => prev.map(n => n.id.toString() === editingNoteId ? data.note : n));
            setEditingNoteId(null);
            setEditingTitle('');
            setEditingContent('');

        } catch (err) {
            console.error(err);
        }
    }

    const outsSaveRef = useRef(null)


    useEffect(() => {
        function handleOutsideClickSave(event) {
            if (editingNoteId && outsSaveRef.current && !outsSaveRef.current.contains(event.target)) {
            saveEditedNote();
            cancelEditing();
            }
        }

        if (editingNoteId) {
            document.addEventListener("mousedown", handleOutsideClickSave);
        }

        return () => {
            document.removeEventListener("mousedown", handleOutsideClickSave);
        };
    }, [editingNoteId, saveEditedNote, cancelEditing]);

    function startEditing(note){
        setEditingNoteId(note.id.toString());
        setEditingTitle(note.title);
        setEditingContent(note.content);
    }

    function cancelEditing(){
        setEditingNoteId(null);
        setEditingTitle('');
        setEditingContent('');
    }

    return (
        <>
            <Header
                isWeather={isWeather}
                toggleWeather={toggleSwapWeather}
                city={city}
                setCity={setCity}
                getCityWeather={getCityWeather}
                weatherData={weatherData}
                loading={loading}
                error={error}
                setError={setError}
                setWeatherData={setWeatherData}
                toggleDarkTheme={toggleDarkTheme}
                darkTheme={darkTheme}
            />

            <div
                className="overview_container"
                ref={containerRef}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                {notes.map((note) => (
                    <div
                        className="noteOverviewContainer"
                        onClick={() => setSelectedNoteId(note.id)}
                        key={note.id}
                        id={`note-${note.id}`}
                        ref={el => {
                            if (!notesRef.current) notesRef.current = {};
                            if (el) notesRef.current[note.id] = el;
                            else delete notesRef.current[note.id];
                        }}
                        onMouseDown={editingNoteId?.toString() === note.id.toString() ? undefined : (e) => handleMouseDown(e, note.id)}
                        style={{ backgroundColor: noteColors[note.id] || palette[0] }}
                    >
                        <div
                                className="dragHandleOverview"
                                // draggable
                                // onDragStart={e => handleDragStart(e, item.item_id)}
                                // onDragEnd={handleDragEnd}
                            >
                                ⋮⋮
                            </div>
                        {editingNoteId?.toString() === note.id.toString() ? (
                        <div ref={outsSaveRef}>
                            <input
                                type="text"
                                placeholder="Введите заголовок..."
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                id="new_note_inputTitle"
                                autoFocus
                            />
                            <input
                                type="text"
                                placeholder="Введите заметку..."
                                value={editingContent}
                                onChange={(e) => setEditingContent(e.target.value)}
                                id="new_note_input"
                                onClick={(e) => e.stopPropagation()}
                            />
                            <div className="editContainerButton">
                                <button className='saveEditingButton' onClick={(e) => {
                                    e.stopPropagation()
                                    saveEditedNote()
                                }}>Save</button>
                                <button className='cancelEditingButton' onClick={cancelEditing}>Cancel</button>
                            </div>
                        </div>) : (
                            <>
                                <h3>{note.title}</h3>
                                <p>{note.content}</p>
                                <div className="btnsContainer">
                                    <button id='btnChange' onClick={(e) => {
                                        e.stopPropagation()
                                        changeNoteColor(note.id)
                                    }}>Change</button>
                                    <button id='btnEdit' onClick={(e) => {
                                        e.stopPropagation()
                                        startEditing(note)
                                    }}>Edit</button>
                                    <button id='btnDelete' onClick={() => {
                                        e.stopPropagation()
                                        deleteNotes(note.id)
                                    }}>x</button>
                                </div>
                            </>
                        )}
                    </div>
                ))}

                {isAdding.not_started ? (
                        <div className="note_wrapperOverview" ref={addingRef}>
                            <div id='inputsContainerOverview'>
                                <input
                                    type="text"
                                    placeholder="Введите заголовок..."
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    id="new_note_inputTitle"
                                    autoFocus
                                />
                                <input
                                    type="text"
                                    placeholder="Введите заметку..."
                                    value={newContent}
                                    onChange={(e) => setNewContent(e.target.value)}
                                    id="new_note_input"
                                />
                            </div>
                            <button onClick={() => addNote("not_started")} id='saveBtnOverview'>Save</button>
                        </div>
                    ) : (
                        <button className="add_button" id='overviewAddButton' onClick={() => toggleAdding("not_started")}>+ Add Note</button>
                    )}
            </div>
            {selectedNoteId && (
                <ItemsModal
                    key={selectedNoteId}
                    noteId={selectedNoteId}
                    token={token}
                    onClose={() => setSelectedNoteId(null)}
                />
            )}
        </>
    )
}