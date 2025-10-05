import { useEffect, useState, useRef } from "react";
import './ItemsModal.css'

import ReactQuill from "react-quill";
import "react-quill/dist/quill.bubble.css";

export default function ItemsModal({ noteId, token, onClose }) {
    const [items, setItems] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newContent, setNewContent] = useState("");
    const inputRef = useRef(null);
    const blueLineRef = useRef(null);
    const [draggingItemId, setDraggingItemId] = useState()

    const containerRef = useRef(null);
    const saveTimeoutsRef = useRef(new Map());

    useEffect(() => {
        async function fetchItems() {
            try {
                const res = await fetch(`http://localhost:3001/usernoteitems?note_id=${noteId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                setItems(data.noteItems || []);
            } catch (err) {
                console.error(err);
            }
        }
        fetchItems();
    }, [noteId, token]);

    async function addItem(content) {
        try {
            const res = await fetch("http://localhost:3001/newitems", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ note_id: noteId, content, is_done: false })
            });
            const data = await res.json();
            setItems(prev => [...prev, data.noteItem]);
        } catch (err) {
            console.error(err);
        }
    }

    async function toggleItem(id, isDone) {
        try {
            await fetch(`http://localhost:3001/noteitems/${id}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ is_done: isDone })
            });
            setItems(prev =>
                prev.map(item =>
                    item.item_id === id ? { ...item, is_done: isDone } : item
                )
            );
        } catch (err) {
            console.error(err);
        }
    }

    async function deleteItem(id) {
        try {
            await fetch(`http://localhost:3001/notesitem/delete/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            setItems(prev => prev.filter(item => item.item_id !== id));
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        function handleOutsideClick(e) {
            if (isAdding && inputRef.current && !inputRef.current.contains(e.target)) {
                const content = newContent.trim();
                if (content) {
                    addItem(content);
                }
                setNewContent("");
                setIsAdding(false);
            }
        }
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, [isAdding, newContent]);

    useEffect(() => {
        const line = document.createElement('div');
        line.id = 'blueLineItem';
        blueLineRef.current = line;
        return () => {
            if (blueLineRef.current && blueLineRef.current.parentNode) {
                blueLineRef.current.parentNode.removeChild(blueLineRef.current);
            }
        };
    }, []);

    // ---- Drag & Drop ---- //
    function getDragAfterElement(container, y) {
        if (!container) return null;
        const draggableElements = [...container.querySelectorAll('.itemBlock:not(.dragging)')];
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

    function handleDragStart(e, draggedId) {
        e.dataTransfer.effectAllowed = "move";
        setDraggingItemId(draggedId);
    }

    function handleDragOver(e, overId) {
        e.preventDefault();
        const container = document.querySelector(".allContainerItems");
        if (!container) return;

        const afterElement = getDragAfterElement(container, e.clientY);

        if (blueLineRef.current && blueLineRef.current.parentNode) {
            blueLineRef.current.parentNode.removeChild(blueLineRef.current);
        }

        if (afterElement == null) {
            container.appendChild(blueLineRef.current);
        } else {
            container.insertBefore(blueLineRef.current, afterElement);
        }
    }

    function handleDragEnd() {
        if (blueLineRef.current && blueLineRef.current.parentNode) {
            blueLineRef.current.parentNode.removeChild(blueLineRef.current);
        }
        setDraggingItemId(null);
    }

    function handleDrop(e) {
        e.preventDefault();
        const container = document.querySelector(".allContainerItems");

        if (!container || !blueLineRef.current) {
            setDraggingItemId(null);
            return;
        }

        // найдём индекс куда вставить
        const afterElement = getDragAfterElement(container, e.clientY);
        setItems(prev => {
            const draggedIndex = prev.findIndex(item => item.item_id === draggingItemId);
            if (draggedIndex === -1) return prev;
            const updated = [...prev];
            const [dragged] = updated.splice(draggedIndex, 1);

            if (afterElement == null) {
                updated.push(dragged);
            } else {
                const overIndex = updated.findIndex(item => item.item_id.toString() === afterElement.dataset.id);
                updated.splice(overIndex, 0, dragged);
            }
            return updated;
        });

        // убираем линию
        if (blueLineRef.current && blueLineRef.current.parentNode) {
            blueLineRef.current.parentNode.removeChild(blueLineRef.current);
        }

        setDraggingItemId(null);
    }
    // ---- Drag & Drop ---- //


    // ---- сохранение контента айтема (с дебаунсом) ----
    function handleContentChange(id, value) {
        // обновляем локальный стейт сразу
        setItems(prev => prev.map(item => item.item_id === id ? { ...item, content: value } : item));

        // дебаунс: только одно отложенное сохранение на айтем
        const map = saveTimeoutsRef.current;
        if (map.has(id)) clearTimeout(map.get(id));

        const t = setTimeout(async () => {
            map.delete(id);
            try {
                // Поменяй URL на тот, что у тебя на бэкенде для обновления контента
                await fetch(`http://localhost:3001/notesitems/update/${id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ content: value })
                });
            } catch (err) {
                console.error("save content failed:", err);
            }
        }, 700);
        map.set(id, t);
    }
    // ---- Quill config (bubble = тулбар при выделении) ----
    const modules = {
    toolbar: [
        [{ font: [] }, { size: [] }],
        ["bold", "italic", "underline", "strike"],
        [{ color: [] }, { background: [] }],
        [{ script: "sub" }, { script: "super" }],
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ["blockquote", "code-block"],
        [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ direction: "rtl" }, { align: [] }],
        ["link", "image", "video"],
        ["clean"]
    ]
    };

    const formats = [
        "font", "size",
        "bold", "italic", "underline", "strike",
        "color", "background",
        "script", "header", "blockquote", "code-block",
        "list", "bullet", "check", "indent",
        "direction", "align",
        "link", "image", "video",
        "clean"
    ];

    return (
        <>
            <div className="blur-overlay" onClick={onClose} />
            <div className="opened_note">
                <h2>To Do List</h2>
                <div className="allContainerItems" ref={containerRef}>
                    {items.map(item => (
                        <div
                            key={item.item_id}
                            data-id={item.item_id}
                            className={`itemBlock ${draggingItemId === item.item_id ? "dragging" : ""}`}
                            onDragOver={e => handleDragOver(e, item.item_id)}
                            onDrop={handleDrop}
                        >
                            <div
                                className="dragHandle"
                                draggable
                                onDragStart={e => handleDragStart(e, item.item_id)}
                                onDragEnd={handleDragEnd}
                            >
                                ⋮⋮
                            </div>
                            <input
                                type="checkbox"
                                className="checkItem"
                                checked={item.is_done}
                                onChange={e => toggleItem(item.item_id, e.target.checked)}
                            />

                            <div className="quillWrapper textItem">
                                <ReactQuill
                                    theme="bubble"
                                    value={item.content || ""}
                                    onChange={val => handleContentChange(item.item_id, val)}
                                    modules={modules}
                                    formats={formats}
                                />
                            </div>

                            <button className="btnDeleteItem" onClick={() => deleteItem(item.item_id)}>🗑</button>
                        </div>
                    ))}

                    {isAdding && (
                        <div className="itemsContainer" ref={inputRef}>
                            <input
                                type="text"
                                value={newContent}
                                onChange={e => setNewContent(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        if (newContent.trim()) {
                                            addItem(newContent.trim());
                                        }
                                        setNewContent("");
                                        setIsAdding(false);
                                    }
                                }}
                                autoFocus
                                placeholder="Введите заметку..."
                            />
                        </div>
                    )}
                </div>
                <button
                    className="addNotesItemBtn"
                    onClick={() => setIsAdding(true)}
                >
                    + item
                </button>
            </div>
        </>
    )
}
