import { memo } from 'react';
import './ColumnsNote.css'

const NoteItem = memo(function NoteItem({
    note,
    isEditing,
    editingTitle,
    editingContent,
    allTags,
    newTag,
    isAddingTag,
    outsSaveRef,
    windowTagRef,
    onStartEditing,
    onUpdateEditingTitle,
    onUpdateEditingContent,
    onSaveEditing,
    onCancelEditing,
    onDeleteNote,
    onSetNewTag,
    onSetAddingTagNoteId,
    onAddNewTag,
    onDeleteTag,
    onSelectNote,
    onDragStart,
    onDragEnd
}) {
    return (
        <div
            className="note"
            data-id={note.id}
            draggable={!isEditing}
            onDragStart={(e) => onDragStart(e, note)}
            onDragEnd={(e) => onDragEnd(e)}
            onClick={() => onSelectNote(note.id)}
        >
            {isEditing ? (
                <div ref={outsSaveRef}>
                    <input
                        type="text"
                        placeholder="Enter title..."
                        value={editingTitle}
                        onChange={(e) => onUpdateEditingTitle(e.target.value)}
                        id="new_note_inputTitle"
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                    />
                    <input
                        type="text"
                        placeholder="Enter a note..."
                        value={editingContent}
                        onChange={(e) => onUpdateEditingContent(e.target.value)}
                        id="new_note_input"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <div className="editContainerButton">
                        <button
                            className='saveEditingButton'
                            onClick={(e) => {
                                e.stopPropagation();
                                onSaveEditing();
                            }}
                        >
                            Save
                        </button>
                        <button
                            className='cancelEditingButton'
                            onClick={(e) => {
                                e.stopPropagation();
                                onCancelEditing();
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="btnsContainer">
                        <button
                            id='btnEdit'
                            onClick={(e) => {
                                e.stopPropagation();
                                onStartEditing(note);
                            }}
                        >
                            Edit
                        </button>
                        <button
                            id='btnDelete'
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteNote(note.id);
                            }}
                        >
                            ×
                        </button>
                    </div>

                    <h5 className='titleNoteText'>{note.title}</h5>
                    <p>{note.content}</p>

                    <div className="tagsBlock">
                        {note.tags && note.tags.length > 0 && (
                            <div className="tagsList">
                                {note.tags.map((tag) => (
                                    <div key={tag.id} className="oneTagItem">
                                        <span className="tagItem">#{tag.name}</span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteTag(note.id, tag.id);
                                            }}
                                            className='deleteTagBtn'
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {isAddingTag ? (
                            <div className="addTagForm" ref={windowTagRef}>
                                <input
                                    type="text"
                                    placeholder="Enter the tag..."
                                    value={newTag}
                                    onChange={(e) => onSetNewTag(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    autoFocus
                                    className='inputTagName'
                                />

                                {allTags.length > 0 && (
                                    <div className="tagsDropdown">
                                        {allTags.map((tag, i) => (
                                            <div
                                                key={i}
                                                className="tagOption"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onSetNewTag(tag);
                                                }}
                                            >
                                                #{tag}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="blockTagsBtns">
                                    <button
                                        className='btnSaveTag'
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onAddNewTag(note.id);
                                        }}
                                    >
                                        Save
                                    </button>
                                    <button
                                        className='btnCloseTagWindow'
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onSetAddingTagNoteId(null);
                                        }}
                                    >
                                        ✖
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                id="btnAddTags"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSetAddingTagNoteId(note.id);
                                }}
                            >
                                + Add Tag
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}, (prevProps, nextProps) => {

    return (
        prevProps.note.id === nextProps.note.id &&
        prevProps.note.title === nextProps.note.title &&
        prevProps.note.content === nextProps.note.content &&
        prevProps.note.tags?.length === nextProps.note.tags?.length &&
        prevProps.isEditing === nextProps.isEditing &&
        prevProps.isAddingTag === nextProps.isAddingTag &&
        prevProps.editingTitle === nextProps.editingTitle &&
        prevProps.editingContent === nextProps.editingContent &&
        prevProps.newTag === nextProps.newTag
    );
});

export default NoteItem;