import { useCallback } from 'react';
import { ACTIONS } from '../store/notesReducer';

export function useNotes(state, dispatch, token) {

    const fetchNotes = useCallback(async () => {
        try {
            const response = await fetch("http://localhost:3001/usernotes", {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("Server error");
            const data = await response.json();

            const notesWithTags = await Promise.all(
                data.notes.map(async (note) => {
                    try {
                        const tagRes = await fetch(`http://localhost:3001/notes/${note.id}`);
                        if (!tagRes.ok) return { ...note, tags: [] };

                        const noteData = await tagRes.json();

                        const tags = noteData.tags?.map(t => {
                            if (typeof t === 'string') {
                                console.warn('Tags came as strings:', t);
                                return { id: null, name: t };
                            }
                            return { id: t.id, name: t.name };
                        }).filter(t => t.id !== null) || [];

                        return { ...note, tags };
                    } catch (err) {
                        console.error('Error fetching tags for note:', err);
                        return { ...note, tags: [] };
                    }
                })
            );

            dispatch({ type: ACTIONS.SET_NOTES, payload: notesWithTags });

        } catch (err) {
            console.error('Error fetching notes:', err);
        }
    }, [token, dispatch]);

    const createNote = useCallback(async (title, content, status) => {
        try {
            const response = await fetch("http://localhost:3001/newnote", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ title, content, status })
            });

            if (!response.ok) throw new Error("Server Error");
            const data = await response.json();

            dispatch({ type: ACTIONS.ADD_NOTE, payload: data.note });
            dispatch({ type: ACTIONS.CLEAR_NEW_NOTE });
            dispatch({ type: ACTIONS.TOGGLE_ADDING, payload: status });

        } catch (err) {
            console.error('Error creating note:', err);
            alert("Failed to save note");
        }
    }, [token, dispatch]);

    const updateNoteStatus = useCallback(async (noteId, newStatus) => {
        try {
            await fetch(`http://localhost:3001/notes/${noteId}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            dispatch({
                type: ACTIONS.UPDATE_NOTE_STATUS,
                payload: { noteId, status: newStatus }
            });

        } catch (err) {
            console.error("Error updating status:", err);
        }
    }, [token, dispatch]);

    const saveEditedNote = useCallback(async () => {
        const { noteId, title, content } = state.editing;

        if (!noteId) return;

        try {
            const response = await fetch(`http://localhost:3001/notes/update/${noteId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ title, content })
            });

            if (!response.ok) {
                console.error("Error while editing");
                return;
            }

            const data = await response.json();

            dispatch({
                type: ACTIONS.UPDATE_NOTE,
                payload: data.note
            });

            dispatch({ type: ACTIONS.CANCEL_EDITING });

        } catch (err) {
            console.error('Error saving note:', err);
        }
    }, [state.editing, token, dispatch]);

    const deleteNote = useCallback(async (noteId) => {
        try {
            const response = await fetch(`http://localhost:3001/notes/delete/${noteId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.ok) {
                dispatch({ type: ACTIONS.DELETE_NOTE, payload: noteId });
            } else {
                console.error('Error while delete');
            }
        } catch (err) {
            console.error('Error deleting note:', err);
        }
    }, [token, dispatch]);

    const addNote = useCallback((status) => {
        const { title, content } = state.newNote;

        if (!title.trim() && !content.trim()) {
            alert("Fill in all fields");
            return;
        }

        createNote(title, content, status);
    }, [state.newNote, createNote]);

    return {
        fetchNotes,
        createNote,
        updateNoteStatus,
        saveEditedNote,
        deleteNote,
        addNote
    };
}