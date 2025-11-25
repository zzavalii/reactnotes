import { memo } from 'react';
import NoteItem from './NoteItem';
import './ColumnsNote.css'

const NoteColumn = memo(function NoteColumn({
    column, notes, isAdding,
    newTitle, newContent, editingNoteId, editingTitle, editingContent,
    allTags,newTag,addingTagNoteId,
    columnRef, addingRef, outsSaveRef, windowTagRef,
    onToggleAdding, onSetNewTitle, onSetNewContent,
    onAddNote, onStartEditing, onUpdateEditingTitle, onUpdateEditingContent, onSaveEditing, onCancelEditing,
    onDeleteNote, onSetNewTag, onSetAddingTagNoteId, onAddNewTag, onDeleteTag,
    onSelectNote, onDragStart, onDragEnd, onDragOver, onDrop
}) {
    return (
        <div
            id={column.id}
            className={`note_column ${column.className}`}
            ref={columnRef}
            onDragOver={(e) => onDragOver(e, column.id)}
            onDrop={(e) => onDrop(e, column.id)}
        >
            <div className={`groundTitle_${column.id === 'not_started' ? 'notStarted' : column.id === 'in_progress' ? 'inProgress' : 'Done'}`}>
                <p>○ {column.title} {notes.length}</p>
            </div>

            {notes.map((note) => (
                <NoteItem
                    key={note.id}
                    note={note}
                    isEditing={editingNoteId?.toString() === note.id.toString()}
                    editingTitle={editingTitle}
                    editingContent={editingContent}
                    allTags={allTags}
                    newTag={newTag}
                    isAddingTag={addingTagNoteId === note.id}
                    outsSaveRef={outsSaveRef}
                    windowTagRef={windowTagRef}
                    onStartEditing={onStartEditing}
                    onUpdateEditingTitle={onUpdateEditingTitle}
                    onUpdateEditingContent={onUpdateEditingContent}
                    onSaveEditing={onSaveEditing}
                    onCancelEditing={onCancelEditing}
                    onDeleteNote={onDeleteNote}
                    onSetNewTag={onSetNewTag}
                    onSetAddingTagNoteId={onSetAddingTagNoteId}
                    onAddNewTag={onAddNewTag}
                    onDeleteTag={onDeleteTag}
                    onSelectNote={onSelectNote}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                />
            ))}

            {isAdding ? (
                <div className={`note_wrapper_${column.id === 'not_started' ? 'notStarted' : column.id === 'in_progress' ? 'InProgress' : 'Done'}`} ref={addingRef}>
                    <div id={`inputsContainer_${column.id === 'not_started' ? 'notStarted' : column.id === 'in_progress' ? 'InProgress' : 'Done'}`}>
                        <input
                            type="text"
                            placeholder="Enter a title..."
                            value={newTitle}
                            onChange={(e) => onSetNewTitle(e.target.value)}
                            id="new_note_inputTitle"
                            autoFocus
                        />
                        <input
                            type="text"
                            placeholder="Enter a note..."
                            value={newContent}
                            onChange={(e) => onSetNewContent(e.target.value)}
                            id="new_note_input"
                        />
                    </div>
                    <button
                        onClick={onAddNote}
                        id={`saveBtn_${column.id === 'not_started' ? 'notStarted' : column.id === 'in_progress' ? 'inProgress' : 'Done'}`}
                    >
                        Save
                    </button>
                </div>
            ) : (
                <button
                    className="add_button"
                    id={`add_note_${column.id}`}
                    onClick={onToggleAdding}
                >
                    + Add Note
                </button>
            )}
        </div>
    );
});

export default NoteColumn;