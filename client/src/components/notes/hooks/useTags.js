import { useCallback } from 'react';
import { ACTIONS } from '../store/notesReducer';

export function useTags(dispatch, token) {

    const fetchTags = useCallback(async () => {
        try {
            const result = await fetch("http://localhost:3001/tags", {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!result.ok) throw new Error("Server error");
            const data = await result.json();

            dispatch({
                type: ACTIONS.SET_ALL_TAGS,
                payload: data.tags || []
            });

        } catch (err) {
            console.error('Error fetching tags:', err);
        }
    }, [token, dispatch]);

    const addNewTag = useCallback(async (noteId, tagName) => {
        if (!tagName.trim()) return;

        const normalizedTag = tagName.replace(/^#/, '').trim();

        try {
            const response = await fetch(`http://localhost:3001/notes/${noteId}/addnewtag`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ tags: [normalizedTag] })
            });

            if (!response.ok) throw new Error("Server Error");
            const data = await response.json();

            dispatch({
                type: ACTIONS.ADD_TAG_TO_NOTE,
                payload: { noteId, tags: data.tags }
            });

            await fetchTags();

        } catch (err) {
            console.error('Error adding tag:', err);
            alert("Failed to add tag");
        }
    }, [token, dispatch, fetchTags]);

    const deleteNoteTag = useCallback(async (noteId, tagId) => {
        try {
            const response = await fetch(`http://localhost:3001/notes/delete/${noteId}/tags/${tagId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.ok) {
                dispatch({
                    type: ACTIONS.REMOVE_TAG_FROM_NOTE,
                    payload: { noteId, tagId }
                });

                await fetchTags();
            } else {
                console.error('Error when deleting a tag');
            }

        } catch (err) {
            console.error('Error deleting tag:', err);
        }
    }, [token, dispatch, fetchTags]);

    return {
        fetchTags,
        addNewTag,
        deleteNoteTag
    };
}