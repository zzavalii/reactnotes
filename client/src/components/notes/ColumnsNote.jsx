import './ColumnsNote.css';
import { useReducer, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../header/header';
import ItemsModal from '../modal/ItemsModal';
import TogglePanel from '../togglePanel/TogglePanel';
import NoteColumn from './NoteColumn';

import { notesReducer, initialState, ACTIONS } from './store/notesReducer';
import { useNotes } from './hooks/useNotes';
import { useTags } from './hooks/useTags';
import { useWeather } from './hooks/useWeather';

const COLUMNS = [
    { id: 'not_started', title: 'Not Started', className: 'note_notstarted' },
    { id: 'in_progress', title: 'In Progress', className: 'note_inprogress' },
    { id: 'done', title: 'Done', className: 'note_done' }
];

export default function ColumnNotes() {

    const [state, dispatch] = useReducer(notesReducer, initialState);

    const navigate = useNavigate();
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const isLoggedIn = localStorage.getItem("isLoggedIn") || sessionStorage.getItem("isLoggedIn");
    const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

    const notesAPI = useNotes(state, dispatch, token);
    const tagsAPI = useTags(dispatch, token);
    const weatherAPI = useWeather(state, dispatch, API_KEY);

    const columnRefs = useRef({});
    const blueLineRef = useRef(null);
    const addingRef = useRef(null);
    const windowTagRef = useRef(null);
    const outsSaveRef = useRef(null);

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
            console.error("Invalid token", err);
            localStorage.removeItem("token");
            localStorage.setItem("isLoggedIn", "false");
            navigate("/login");
        }
    }, [navigate, token, isLoggedIn]);

    //render notes
    useEffect(() => {
        notesAPI.fetchNotes();
        tagsAPI.fetchTags();
    }, [token]);

    //blue line 
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

    //outside click form adding
    useEffect(() => {
        function handleOutsideClick(event) {
            if (addingRef.current && !addingRef.current.contains(event.target)) {
                COLUMNS.forEach(column => {
                    if (state.isAdding[column.id]) {
                        if (state.newNote.title.trim() || state.newNote.content.trim()) {
                            notesAPI.addNote(column.id);
                        } else {
                            dispatch({ type: ACTIONS.TOGGLE_ADDING, payload: column.id });
                        }
                    }
                });
            }
        }

        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, [state.isAdding, state.newNote, notesAPI]);

    //outside click form tags
    useEffect(() => {
        function handleOutsideClickTag(event) {
            if (windowTagRef.current && !windowTagRef.current.contains(event.target)) {
                if (state.tags.newTag.trim()) {
                    tagsAPI.addNewTag(state.tags.addingToNoteId, state.tags.newTag);
                } else {
                    dispatch({ type: ACTIONS.CLEAR_TAG_INPUT });
                }
            }
        }

        document.addEventListener("mousedown", handleOutsideClickTag);
        return () => document.removeEventListener("mousedown", handleOutsideClickTag);
    }, [state.tags.addingToNoteId, state.tags.newTag, tagsAPI]);

    //outside click editing form
    useEffect(() => {
        function handleOutsideClickSave(event) {
            if (state.editing.noteId && outsSaveRef.current && !outsSaveRef.current.contains(event.target)) {
                notesAPI.saveEditedNote();
            }
        }

        document.addEventListener("mousedown", handleOutsideClickSave);
        return () => document.removeEventListener("mousedown", handleOutsideClickSave);
    }, [state.editing.noteId, notesAPI.saveEditedNote])

    const notesByColumn = useMemo(() => ({
        not_started: state.notes.filter(note => note.status === 'not_started'),
        in_progress: state.notes.filter(note => note.status === 'in_progress'),
        done: state.notes.filter(note => note.status === 'done')
    }), [state.notes]);

    const getDragAfterElement = useCallback((container, y) => {
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
    }, []);

    //  DragOver for column
    const handleColumnDragOver = useCallback((e, colId) => {
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
    }, [getDragAfterElement]);

    //  Drop for column
    const handleColumnDrop = useCallback((e, colId) => {
        e.preventDefault();
        const noteId = e.dataTransfer.getData('text/plain');
        if (!noteId) return;

        const columnEl = columnRefs.current[colId];
        const afterElement = getDragAfterElement(columnEl, e.clientY);
        const afterId = afterElement ? afterElement.dataset.id : null;

        // Обновляем позицию заметки в локальном состоянии
        const copy = [...state.notes];
        const movedIndex = copy.findIndex(n => n.id.toString() === noteId.toString());
        if (movedIndex === -1) return;

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

        dispatch({ type: ACTIONS.SET_NOTES, payload: copy });
        notesAPI.updateNoteStatus(moved.id, colId);

        if (blueLineRef.current && blueLineRef.current.parentNode) {
            blueLineRef.current.parentNode.removeChild(blueLineRef.current);
        }
    }, [state.notes, getDragAfterElement, notesAPI]);

    // Start drg&drp
    const handleNoteDragStart = useCallback((e, note) => {
        e.dataTransfer.setData('text/plain', note.id.toString());
        dispatch({ type: ACTIONS.SET_DRAGGING_ID, payload: note.id.toString() });
        e.currentTarget.classList.add('dragging');
    }, []);

    // End drg&drp
    const handleNoteDragEnd = useCallback((e) => {
        dispatch({ type: ACTIONS.SET_DRAGGING_ID, payload: null });
        e.currentTarget.classList.remove('dragging');

        if (blueLineRef.current && blueLineRef.current.parentNode) {
            blueLineRef.current.parentNode.removeChild(blueLineRef.current);
        }
    }, []);

    const handleStartEditing = useCallback((note) => {
        dispatch({
            type: ACTIONS.START_EDITING,
            payload: {
                id: note.id,
                title: note.title,
                content: note.content
            }
        });
    }, []);

    const handleCancelEditing = useCallback(() => {
        dispatch({ type: ACTIONS.CANCEL_EDITING });
    }, []);


    return (
        <>
            <Header
                isWeather={state.weather.isVisible}
                toggleWeather={() => dispatch({ type: ACTIONS.TOGGLE_WEATHER })}
                city={state.weather.city}
                setCity={(city) => dispatch({ type: ACTIONS.SET_WEATHER_CITY, payload: city })}
                getCityWeather={weatherAPI.getCityWeather}
                weatherData={state.weather.data}
                loading={state.weather.loading}
                error={state.weather.error}
                setError={(error) => dispatch({ type: ACTIONS.SET_WEATHER_ERROR, payload: error })}
                setWeatherData={(data) => dispatch({ type: ACTIONS.SET_WEATHER_DATA, payload: data })}
                toggleDarkTheme={() => dispatch({ type: ACTIONS.TOGGLE_DARK_THEME })}
                darkTheme={state.ui.darkTheme}
                toggleLeftPanel={() => dispatch({ type: ACTIONS.TOGGLE_LEFT_PANEL })}
            />

            <div className="note_panel">
                <div className="left_panel">
                    <TogglePanel isOpen={state.ui.leftPanelOpen} />
                </div>

                <div className="note_container">
                    {COLUMNS.map(column => (
                        <NoteColumn
                            key={column.id}
                            column={column}
                            notes={notesByColumn[column.id]}
                            isAdding={state.isAdding[column.id]}
                            newTitle={state.newNote.title}
                            newContent={state.newNote.content}
                            editingNoteId={state.editing.noteId}
                            editingTitle={state.editing.title}
                            editingContent={state.editing.content}
                            allTags={state.tags.all}
                            newTag={state.tags.newTag}
                            addingTagNoteId={state.tags.addingToNoteId}
                            columnRef={el => columnRefs.current[column.id] = el}
                            addingRef={addingRef}
                            outsSaveRef={outsSaveRef}
                            windowTagRef={windowTagRef}
                            onToggleAdding={() => dispatch({ type: ACTIONS.TOGGLE_ADDING, payload: column.id })}
                            onSetNewTitle={(title) => dispatch({ type: ACTIONS.SET_NEW_TITLE, payload: title })}
                            onSetNewContent={(content) => dispatch({ type: ACTIONS.SET_NEW_CONTENT, payload: content })}
                            onAddNote={() => notesAPI.addNote(column.id)}
                            onStartEditing={handleStartEditing}
                            onUpdateEditingTitle={(title) => dispatch({ type: ACTIONS.UPDATE_EDITING_TITLE, payload: title })}
                            onUpdateEditingContent={(content) => dispatch({ type: ACTIONS.UPDATE_EDITING_CONTENT, payload: content })}
                            onSaveEditing={notesAPI.saveEditedNote}
                            onCancelEditing={handleCancelEditing}
                            onDeleteNote={notesAPI.deleteNote}
                            onSetNewTag={(tag) => dispatch({ type: ACTIONS.SET_NEW_TAG, payload: tag })}
                            onSetAddingTagNoteId={(id) => dispatch({ type: ACTIONS.SET_ADDING_TAG_NOTE_ID, payload: id })}
                            onAddNewTag={(noteId) => tagsAPI.addNewTag(noteId, state.tags.newTag)}
                            onDeleteTag={tagsAPI.deleteNoteTag}
                            onSelectNote={(id) => dispatch({ type: ACTIONS.SET_SELECTED_NOTE, payload: id })}
                            onDragStart={handleNoteDragStart}
                            onDragEnd={handleNoteDragEnd}
                            onDragOver={handleColumnDragOver}
                            onDrop={handleColumnDrop}
                        />
                    ))}
                </div>
            </div>

            {state.ui.selectedNoteId && (
                <ItemsModal
                    key={state.ui.selectedNoteId}
                    noteId={state.ui.selectedNoteId}
                    token={token}
                    onClose={() => dispatch({ type: ACTIONS.SET_SELECTED_NOTE, payload: null })}
                />
            )}
        </>
    )
}

