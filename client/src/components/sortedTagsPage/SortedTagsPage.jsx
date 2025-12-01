import { useEffect, useState, useRef } from "react";
import styles from './SortedTagsPage.module.css'
import { Link } from "react-router-dom";

export default function SortedTagsPage() {
    const [tags, setTags] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedTags, setSelectedTags] = useState(new Set());
    const token = localStorage.getItem("token");

    //dark theme
    const [darkTheme, setDarkTheme] = useState(() => {
        return localStorage.getItem("darkTheme") === 'true'; 
    })

    const buttonDarkThemeRef = useRef(null);
    
    
        useEffect(() => {
            if (darkTheme) {
                document.body.classList.add("darker");
            } else {
                document.body.classList.remove("darker");
            }
        }, [darkTheme]);
    
        function toggleDarkTheme() {
            setDarkTheme(prev => {
                const newTheme = !prev;
                localStorage.setItem("darkTheme", newTheme);  
                return newTheme;
            });
        }

    useEffect(() => {
        async function fetchTagsPage() {
            try {
                const response = await fetch("http://localhost:3001/allnote/tags", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) throw new Error("Server error");
                const data = await response.json();
                setTags(data); 
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchTagsPage();
    }, [token]);

    const tagColors = [
        '#FFB6C1', '#FFA07A', '#FFD700', '#98FB98', 
        '#87CEEB', '#DDA0DD', '#F0E68C', '#B0E0E6',
        '#FFDAB9', '#E6E6FA', '#FFE4E1', '#D8BFD8'
    ];

    function getTagColor(index) {
        return tagColors[index % tagColors.length];
    }

    function toggleTag(tagName) {
        setSelectedTags(prev => {
            const newSet = new Set(prev);
            if (newSet.has(tagName)) {
                newSet.delete(tagName);
            } else {
                newSet.add(tagName);
            }
            return newSet;
        });
    }

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Loading tags...</p>
            </div>
        );
    }

    const totalTags = Object.keys(tags).length;
    const totalNotes = Object.values(tags).reduce((sum, notes) => sum + notes.length, 0);

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.header}>
                <h1 className={` ${styles.pageTitle} ${darkTheme? styles.darker : ''}`}>Sorted tags:</h1>
                <div className={styles.stats}>
                    <div className={` ${styles.statCard} ${darkTheme? styles.darker : ''}`}>
                        
                        <span className={` ${styles.statNumber} ${darkTheme? styles.darker : ''}`}>{totalTags}</span>
                        <span className={styles.statLabel}>Tags</span>
                    </div>
                    <div className={` ${styles.statCard} ${darkTheme? styles.darker : ''}`}>
                        <span className={` ${styles.statNumber} ${darkTheme? styles.darker : ''}`}>{totalNotes}</span>
                        <span className={styles.statLabel}>Notes</span>
                    </div>
                </div>
            </div>

            {Object.keys(tags).length === 0 ? (
                <div className={styles.emptyState}>
                    <h2>No tags yet</h2>
                    <p>Start adding tags to your notes to organize them better!</p>
                </div>
            ) : (
                <div className={styles.tagsContainer}>
                    {Object.entries(tags).map(([tagName, notes], index) => (
                        <div 
                            key={tagName} 
                            className={`${styles.tagBlock} ${selectedTags.has(tagName) ? styles.expanded : ''}`}
                        >
                            <div 
                                className={` ${styles.tagHeader} 
                                    ${darkTheme ? styles.darker : ''}
                                `}
                                onClick={() => toggleTag(tagName)}
                            >
                                <div 
                                    className={styles.tagNameBlock}
                                    style={{ backgroundColor: getTagColor(index) }}
                                >
                                    <span className={styles.tagIcon}>#</span>
                                    <span className={styles.tagName}>{tagName}</span>
                                    <span className={styles.noteCount}>{notes.length}</span>
                                </div>
                                <button className={styles.expandButton}>
                                    {selectedTags.has(tagName) ? '▼' : '▶'}
                                </button>
                            </div>

                            <div
                                className={`
                                    ${styles.notesWrapper} 
                                    ${selectedTags.has(tagName) ? styles.show : ''} 
                                    ${darkTheme ? styles.darker : ''}
                                `}
                            >
                                <div className={styles.listNotes}>
                                    {notes.map((note) => (
                                        <div className={` ${styles.note} ${darkTheme? styles.darker : ''}`} key={note.id}>
                                            <div className={styles.noteHeader}>
                                                <h5 className={styles.noteTitle}>{note.title || 'Untitled'}</h5>
                                                <span className={`note-status status-${note.status || 'not_started'}`}>
                                                    {note.status?.replace('_', ' ') || 'not started'}
                                                </span>
                                            </div>
                                            <p className={styles.noteContent}>{note.content || 'No content'}</p>
                                            <div className={styles.noteFooter}>
                                                <span className={styles.noteDate}>
                                                    📅 {note.created_at ? new Date(note.created_at).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    }) : 'No date'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <Link to="/notes">
                    <input type="button" className='back' value="Back to main"/>
            </Link>
            <input type="button" className='darkthemebutton' name="" value="DarkTheme" ref={buttonDarkThemeRef} onClick={toggleDarkTheme} id="" />
        </div>
    );
}