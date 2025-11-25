export const ACTIONS = {
    //Notes
    SET_NOTES: "SET_NOTES",
    ADD_NOTE: "ADD_NOTE",
    UPDATE_NOTE: "UPDATE_NOTE",
    DELETE_NOTE: "DELETE_NOTE",
    UPDATE_NOTE_STATUS: "UPDATE_NOTE_STATUS",

    SET_NEW_TITLE: 'SET_NEW_TITLE',
    SET_NEW_CONTENT: 'SET_NEW_CONTENT',
    CLEAR_NEW_NOTE: 'CLEAR_NEW_NOTE',
    
    TOGGLE_ADDING: 'TOGGLE_ADDING',
    
    // Editing
    START_EDITING: 'START_EDITING',
    UPDATE_EDITING_TITLE: 'UPDATE_EDITING_TITLE',
    UPDATE_EDITING_CONTENT: 'UPDATE_EDITING_CONTENT',
    CANCEL_EDITING: 'CANCEL_EDITING',
    SAVE_EDITING: 'SAVE_EDITING',
    
    // Tags
    SET_ALL_TAGS: 'SET_ALL_TAGS',
    SET_NEW_TAG: 'SET_NEW_TAG',
    SET_ADDING_TAG_NOTE_ID: 'SET_ADDING_TAG_NOTE_ID',
    ADD_TAG_TO_NOTE: 'ADD_TAG_TO_NOTE',
    REMOVE_TAG_FROM_NOTE: 'REMOVE_TAG_FROM_NOTE',
    CLEAR_TAG_INPUT: 'CLEAR_TAG_INPUT',
    
    // Weather
    SET_WEATHER_CITY: 'SET_WEATHER_CITY',
    TOGGLE_WEATHER: 'TOGGLE_WEATHER',
    SET_WEATHER_DATA: 'SET_WEATHER_DATA',
    SET_WEATHER_LOADING: 'SET_WEATHER_LOADING',
    SET_WEATHER_ERROR: 'SET_WEATHER_ERROR',
    CLEAR_WEATHER_ERROR: 'CLEAR_WEATHER_ERROR',
    
    // UI
    TOGGLE_DARK_THEME: 'TOGGLE_DARK_THEME',
    TOGGLE_LEFT_PANEL: 'TOGGLE_LEFT_PANEL',
    SET_SELECTED_NOTE: 'SET_SELECTED_NOTE',
    SET_DRAGGING_ID: 'SET_DRAGGING_ID',
};

export const initialState = {
    notes: [],
    
    newNote: {
        title: '',
        content: ''
    },
    
    isAdding: {
        not_started: false,
        in_progress: false,
        done: false
    },
    
    editing: {
        noteId: null,
        title: '',
        content: ''
    },
    
    tags: {
        all: [],
        newTag: '',
        addingToNoteId: null
    },
    
    weather: {
        city: '',
        isVisible: false,
        data: null,
        loading: false,
        error: ''
    },
    
    ui: {
        darkTheme: localStorage.getItem("darkTheme") === 'true',
        leftPanelOpen: localStorage.getItem("isLeftPanelOpen") === "true",
        selectedNoteId: null,
        draggingId: null
    }
}

export function notesReducer(state, action){
    switch(action.type) {
        case ACTIONS.SET_NOTES:
            return {
                ...state,
                notes: action.payload
            };

        case ACTIONS.ADD_NOTE:
            return {
                ...state,
                notes: [...state.notes, action.payload]
            };
        
        case ACTIONS.UPDATE_NOTE:
            return {
                ...state,
                notes: state.notes.map(note => 
                    note.id === action.payload.id ? { ...note, ...action.payload } : note
                )
            };

        case ACTIONS.DELETE_NOTE:
            return {
                ...state,
                notes: state.notes.filter(note => note.id !== action.payload),
                ui: { ...state.ui, selectedNoteId: null }
            };

        case ACTIONS.UPDATE_NOTE_STATUS:
            return {
                ...state,
                notes: state.notes.map(note =>
                note.id === action.payload.noteId
                    ? { ...note, status: action.payload.status }
                    : note
                )
            };

        // ========= Creating new note =========
        case ACTIONS.SET_NEW_TITLE:
            return {
                ...state,
                newNote: { ...state.newNote, title: action.payload }
            };
        
        case ACTIONS.SET_NEW_CONTENT:
            return {
                ...state,
                newNote: { ...state.newNote, content: action.payload }
            };
        
        case ACTIONS.CLEAR_NEW_NOTE:
            return {
                ...state,
                newNote: { title: '', content: '' }
            };

        // ========= State adding =========
        case ACTIONS.TOGGLE_ADDING:
            return {
                ...state,
                isAdding: {
                    ...state.isAdding,
                    [action.payload]: !state.isAdding[action.payload]
                }
            };
        
        // ========= Editing =========
        case ACTIONS.START_EDITING:
            return {
                ...state,
                editing: {
                    noteId: action.payload.id,
                    title: action.payload.title,
                    content: action.payload.content
                }
            };
        
        case ACTIONS.UPDATE_EDITING_TITLE:
            return {
                ...state,
                editing: { ...state.editing, title: action.payload }
            };
        
        case ACTIONS.UPDATE_EDITING_CONTENT:
            return {
                ...state,
                editing: { ...state.editing, content: action.payload }
            };
            
        case ACTIONS.CANCEL_EDITING:
            return {
                ...state,
                editing: { noteId: null, title: '', content: '' }
            };
        
        case ACTIONS.SAVE_EDITING:
            return {
                ...state,
                notes: state.notes.map(note =>
                note.id.toString() === state.editing.noteId
                    ? { ...note, title: state.editing.title, content: state.editing.content }
                    : note
                ),
                editing: { noteId: null, title: '', content: '' }
            };

        // ========= Tags =========
        case ACTIONS.SET_ALL_TAGS:
            return {
                ...state,
                tags: { ...state.tags, all: action.payload }
            };
        
        case ACTIONS.SET_NEW_TAG:
            return {
                ...state,
                tags: { ...state.tags, newTag: action.payload }
            };
        
        case ACTIONS.SET_ADDING_TAG_NOTE_ID:
            return {
                ...state,
                tags: { ...state.tags, addingToNoteId: action.payload, newTag: '' }
            };
        
        case ACTIONS.ADD_TAG_TO_NOTE:
            return {
                ...state,
                notes: state.notes.map(note => {
                    if (note.id === action.payload.noteId) {
                        const existingIds = new Set((note.tags || []).map(t => t.id));
                        const newTags = action.payload.tags.filter(t => !existingIds.has(t.id));
                        return { ...note, tags: [...(note.tags || []), ...newTags] };
                    }
                    return note;
                }),
                tags: { ...state.tags, newTag: '', addingToNoteId: null }
            };
        
        case ACTIONS.REMOVE_TAG_FROM_NOTE:
            return {
                ...state,
                notes: state.notes.map(note =>
                note.id === action.payload.noteId
                    ? { ...note, tags: note.tags.filter(t => t.id !== action.payload.tagId) }
                    : note
                )
            };
            
        case ACTIONS.CLEAR_TAG_INPUT:
            return {
                ...state,
                tags: { ...state.tags, newTag: '', addingToNoteId: null }
            };
        
        // ========= Weather =========
        case ACTIONS.SET_WEATHER_CITY:
            return {
                ...state,
                weather: { ...state.weather, city: action.payload }
            };
            
        case ACTIONS.TOGGLE_WEATHER:
            return {
                ...state,
                weather: { ...state.weather, isVisible: !state.weather.isVisible }
            };
        
        case ACTIONS.SET_WEATHER_DATA:
            return {
                ...state,
                weather: { 
                    ...state.weather, 
                    data: action.payload, 
                    error: '',
                    loading: false 
                }
            };
        
        case ACTIONS.SET_WEATHER_LOADING:
            return {
                ...state,
                weather: { ...state.weather, loading: action.payload }
            };
        
        case ACTIONS.SET_WEATHER_ERROR:
            return {
                ...state,
                weather: { 
                    ...state.weather, 
                    error: action.payload, 
                    loading: false 
                }
            };
            
        case ACTIONS.CLEAR_WEATHER_ERROR:
            return {
                ...state,
                weather: { ...state.weather, error: '' }
            };
        
        // ========= UI =========
        case ACTIONS.TOGGLE_DARK_THEME:
        const newDarkTheme = !state.ui.darkTheme;
        localStorage.setItem("darkTheme", newDarkTheme);
            return {
                ...state,
                ui: { ...state.ui, darkTheme: newDarkTheme }
            };
        
        case ACTIONS.TOGGLE_LEFT_PANEL:
        const newPanelState = !state.ui.leftPanelOpen;
        localStorage.setItem("isLeftPanelOpen", newPanelState);
            return {
                ...state,
                ui: { ...state.ui, leftPanelOpen: newPanelState }
            };
            
        case ACTIONS.SET_SELECTED_NOTE:
            return {
                ...state,
                ui: { ...state.ui, selectedNoteId: action.payload }
            };
        
        case ACTIONS.SET_DRAGGING_ID:
            return {
                ...state,
                ui: { ...state.ui, draggingId: action.payload }
            };
        
        default:
        return state;

    }
}