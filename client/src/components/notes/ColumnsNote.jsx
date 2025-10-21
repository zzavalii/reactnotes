import './ColumnsNote.css'
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom';
import Header from '../header/header';
import ItemsModal from '../modal/ItemsModal';

export default function ColumnNotes() {
    // -- All useStates --
    const [notes, setNotes] = useState([]);
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [isAdding, setIsAdding] = useState({
        not_started: false,
        in_progress: false,
        done: false
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

    //dark theme
    const [darkTheme, setDarkTheme] = useState(() => {
        const savedTheme = localStorage.getItem("darkTheme");
        if (savedTheme === 'true') {
            return savedTheme;
        }
    })
    const [selectedNoteId, setSelectedNoteId] = useState(null);
    // -- All useStates --

    const navigate = useNavigate();
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const isLoggedIn = localStorage.getItem("isLoggedIn") || sessionStorage.getItem("isLoggedIn");
    const email = localStorage.getItem("email") || sessionStorage.getItem("email");
    const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

    function toggleAdding(status) {
        setIsAdding(prev => ({
            ...prev,
            [status]: !prev[status],
        }))
    }

    function toggleSwapWeather() {
        setWeather(prev => !prev);
    }

    function toggleDarkTheme() {
        setDarkTheme(prev => {
            localStorage.setItem("darkTheme", !prev);
            return !prev;
        });
    }

    const columnRefs = useRef({});
    const blueLineRef = useRef(null);
    const buttonWeatherRef = useRef(null);
    const addingRef = useRef(null);

    useEffect(() => {
        function handleOutsideClick(event) {
            if (addingRef.current && !addingRef.current.contains(event.target)) {
                if (isAdding.not_started) {
                    if (newTitle.trim() && newContent.trim()) {
                        addNote("not_started");
                    } else {
                        toggleAdding("not_started");
                    }
                }
                if (isAdding.in_progress) {
                    if (newTitle.trim() && newContent.trim()) {
                        addNote("in_progress");
                    } else {
                        toggleAdding("in_progress");
                    }
                }
                if (isAdding.done) {
                    if (newTitle.trim() && newContent.trim()) {
                        addNote("done");
                    } else {
                        toggleAdding("done");
                    }
                }
            }
        }
        document.addEventListener("mousedown", handleOutsideClick);
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        }
    }, [isAdding, newTitle, newContent])

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

    //unlogin
    useEffect(() => {
        if (!token || !isLoggedIn) {
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
    }, [token]);

    useEffect(() => {
        const el = document.createElement('div');
        el.id = 'blueLine';
        blueLineRef.current = el;
        return () => {
            if (blueLineRef.current && blueLineRef.current.parentNode) {
                blueLineRef.current.parentNode.removeChild(blueLineRef.current);
            }
        };
    }, []);

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

    async function updateNoteStatus(noteId, newStatus) {
        try {
            await fetch(`http://localhost:3001/notes/${noteId}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
        } catch (err) {
            console.error("Ошибка при обновлении статуса:", err);
        }
    }

    function getDragAfterElement(container, y) {
        if (!container) return null;
        const draggableElements = [...container.querySelectorAll('.note:not(.dragging)')];
        let closest = { offset: Number.NEGATIVE_INFINITY, element: null };
        for (const child of draggableElements) {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                closest = { offset, element: child };
            }
        }
        return closest.element;
    }

    //dragging notes
    function handleColumnDragOver(e, colId) {
        e.preventDefault();
        const columnEl = columnRefs.current[colId];
        if (!columnEl) return;

        const afterElement = getDragAfterElement(columnEl, e.clientY);

        if (blueLineRef.current && blueLineRef.current.parentNode) {
            blueLineRef.current.parentNode.removeChild(blueLineRef.current);
        }

        if (afterElement == null) {
            const addBtn = columnEl.querySelector('.add_button');
            if (addBtn) columnEl.insertBefore(blueLineRef.current, addBtn);
            else columnEl.appendChild(blueLineRef.current);
        } else {
            columnEl.insertBefore(blueLineRef.current, afterElement);
        }
    }

    async function handleColumnDrop(e, colId) {
        e.preventDefault();
        const noteId = e.dataTransfer.getData('text/plain');
        if (!noteId) return;

        const columnEl = columnRefs.current[colId];
        const afterElement = getDragAfterElement(columnEl, e.clientY);
        const afterId = afterElement ? afterElement.dataset.id : null;

        setNotes(prevNotes => {
            const copy = [...prevNotes];
            const movedIndex = copy.findIndex(n => n.id.toString() === noteId.toString());
            if (movedIndex === -1) return prevNotes;
            const [moved] = copy.splice(movedIndex, 1);
            moved.status = colId;

            if (afterId) {
                const afterIdx = copy.findIndex(n => n.id.toString() === afterId.toString());
                const insertAt = afterIdx === -1 ? (() => {
                    let last = -1;
                    copy.forEach((n, i) => { if (n.status === colId) last = i; });
                    return last === -1 ? copy.length : last + 1;
                })() : afterIdx;
                copy.splice(insertAt, 0, moved);
            } else {
                let last = -1;
                copy.forEach((n, i) => { if (n.status === colId) last = i; });
                const insertAt = last === -1 ? copy.length : last + 1;
                copy.splice(insertAt, 0, moved);
            }

            updateNoteStatus(moved.id, colId);

            return copy;
        });

        if (blueLineRef.current && blueLineRef.current.parentNode) {
            blueLineRef.current.parentNode.removeChild(blueLineRef.current);
        }
    }

    function handleNoteDragStart(e, note) {
        e.dataTransfer.setData('text/plain', note.id.toString());
        setDraggingId(note.id.toString());
        e.currentTarget.classList.add('dragging');
    }

    function handleNoteDragEnd(e) {
        setDraggingId(null);
        e.currentTarget.classList.remove('dragging');
        if (blueLineRef.current && blueLineRef.current.parentNode) {
            blueLineRef.current.parentNode.removeChild(blueLineRef.current);
        }
    }

    const notStartedNotes = notes.filter(note => note.status === 'not_started');
    const inProgressNotes = notes.filter(note => note.status === 'in_progress');
    const doneNotes = notes.filter(note => note.status === 'done');

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
    


    function cancelEditing() {
        setEditingNoteId(null);
        setEditingTitle('');
        setEditingContent('');
    }


    // ===================== RENDER ======================== //
    function renderNotesColumn(columnNotes) {
        return columnNotes.map((note) => (
            <div
                className="note"
                key={note.id}
                data-id={note.id}
                draggable={editingNoteId?.toString() !== note.id.toString()}
                onDragStart={(e) => handleNoteDragStart(e, note)}
                onDragEnd={(e) => handleNoteDragEnd(e)}
                onClick={() => setSelectedNoteId(note.id)}
            >
                {editingNoteId?.toString() === note.id.toString() ? (
                    <div ref={outsSaveRef}>
                        <input
                            type="text"
                            placeholder="Enter title..."
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            id="new_note_inputTitle"
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                        />
                        <input
                            type="text"
                            placeholder="Enter a note..."
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            id="new_note_input"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <div className="editContainerButton">
                            <button className='saveEditingButton' onClick={(e) => {
                                e.stopPropagation()
                                saveEditedNote()
                            }}>Save
                            </button>
                            <button className='cancelEditingButton' onClick={(e) => {
                                e.stopPropagation()
                                cancelEditing()
                            }}>Cancel</button>
                        </div>
                    </div>) : (
                    <>
                        <div className="btnsContainer">
                            <button id='btnEdit' onClick={(e) => {
                                e.stopPropagation()
                                startEditing(note)
                            }}>Edit</button>
                            <button id='btnDelete' onClick={(e) => {
                                e.stopPropagation()
                                deleteNotes(note.id)
                            }
                            }>×</button>
                        </div>
                        <h5>{note.title}</h5>
                        <p>{note.content}</p>
                    </>
                )}
            </div>
        ));
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

            <div className="note_panel">
                <div className="left_panel">
                    <div className="block"></div>
                </div>

                <div className="note_container">

                    <div
                        id="not_started"
                        className="note_column note_notstarted"
                        ref={el => columnRefs.current['not_started'] = el}
                        onDragOver={(e) => handleColumnDragOver(e, 'not_started')}
                        onDrop={(e) => handleColumnDrop(e, 'not_started')}
                    >
                        <div className="groundTitle_notStarted"><p>○ Not Started {notStartedNotes.length}</p></div>

                        {renderNotesColumn(notStartedNotes)}

                        {isAdding.not_started ? (
                            <div className="note_wrapper_notStarted" ref={addingRef}>
                                <div id='inputsContainer_notStarted'>
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
                                <button onClick={() => addNote("not_started")} id='saveBtn_notStarted'>Save</button>
                            </div>
                        ) : (
                            <button className="add_button" id='add_note_notstarted' onClick={() => toggleAdding("not_started")}>+ Add Note</button>
                        )}
                    </div>

                    <div
                        id="in_progress"
                        className="note_column note_inprogress"
                        ref={el => columnRefs.current['in_progress'] = el}
                        onDragOver={(e) => handleColumnDragOver(e, 'in_progress')}
                        onDrop={(e) => handleColumnDrop(e, 'in_progress')}
                    >
                        <div className="groundTitle_inProgress"><p>○ In progress {inProgressNotes.length}</p></div>

                        {renderNotesColumn(inProgressNotes)}

                        {isAdding.in_progress ? (
                            <div className="note_wrapper_InProgress" ref={addingRef}>
                                <div id='inputsContainer_InProgress'>
                                    <input type="text" placeholder="Введите заголовок..." value={newTitle} onChange={(e) => setNewTitle(e.target.value)} id="new_note_inputTitle" autoFocus />
                                    <input type="text" placeholder="Введите заметку..." value={newContent} onChange={(e) => setNewContent(e.target.value)} id="new_note_input" />
                                </div>
                                <button onClick={() => addNote("in_progress")} id='saveBtn_inProgress'>Save</button>
                            </div>
                        ) : (
                            <button className="add_button" id='add_note_inprogress' onClick={() => toggleAdding("in_progress")}>+ Add Note</button>
                        )}
                    </div>

                    <div
                        id="done"
                        className="note_column note_done"
                        ref={el => columnRefs.current['done'] = el}
                        onDragOver={(e) => handleColumnDragOver(e, 'done')}
                        onDrop={(e) => handleColumnDrop(e, 'done')}
                    >
                        <div className="groundTitle_Done"><p>○ Done {doneNotes.length}</p></div>

                        {renderNotesColumn(doneNotes)}

                        {isAdding.done ? (
                            <div className="note_wrapper_Done" ref={addingRef}>
                                <div id='inputsContainer_Done'>
                                    <input type="text" placeholder="Введите заголовок..." value={newTitle} onChange={(e) => setNewTitle(e.target.value)} id="new_note_inputTitle" autoFocus />
                                    <input type="text" placeholder="Введите заметку..." value={newContent} onChange={(e) => setNewContent(e.target.value)} id="new_note_input" />
                                </div>
                                <button onClick={() => addNote("done")} id='saveBtn_Done'>Save</button>
                            </div>
                        ) : (
                            <button className="add_button" id='add_note_done' onClick={() => toggleAdding("done")}>+ Add Note</button>
                        )}
                    </div>
                </div>
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
