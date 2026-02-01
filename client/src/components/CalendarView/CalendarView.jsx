import { useEffect, useState, useRef } from 'react';
import styles from './CalendarView.module.css';
import { STATUS_CONFIG } from '../../config/noteStatuses';
import { Link } from 'react-router-dom';

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const CalendarView = () => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const timelineRef = useRef(null);

    const buttonDarkThemeRef = useRef(null);
    
    const [darkTheme, setDarkTheme] = useState(() => {
        return localStorage.getItem("darkTheme") === 'true'; 
    })

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
        fetchNotes();
    }, []);

    useEffect(() => {
        const el = timelineRef.current;
        if (!el) return;

        const onWheel = (e) => {
            if (e.deltaY !== 0) {
                e.preventDefault();
                el.scrollLeft += e.deltaY;
            }
        };

        el.addEventListener('wheel', onWheel, { passive: false });
        return () => el.removeEventListener('wheel', onWheel);
    }, []);

    const fetchNotes = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:3001/notes/calendar', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                }
            });

            const data = await response.json();
            setNotes(data.notes || []);
        } catch (err) {
            console.error('Error loading notes:', err);
            setNotes([]);
        } finally {
            setLoading(false);
        }
    };

    const updateNoteStatus = async (noteId, newStatus) => {
        try {
            const response = await fetch(`http://localhost:3001/notes/${noteId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) throw new Error('Failed to update status');

            const data = await response.json();
            
            // Update local state
            setNotes(prevNotes => 
                prevNotes.map(note => 
                    note.id === noteId ? { ...note, status: newStatus } : note
                )
            );
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Failed to update note status');
        }
    };

    const filterNotes = (notesList) => {
        return notesList.filter(note => {
            const matchesStatus = selectedStatus === 'all' || note.status === selectedStatus;
            const matchesSearch = !searchQuery || 
                note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                note.content?.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesStatus && matchesSearch;
        });
    };

    const groupNotesByMonth = (notesList) => {
        return notesList.reduce((acc, note) => {
            const date = new Date(note.created_at);
            const key = `${date.getFullYear()}-${date.getMonth()}`;

            if (!acc[key]) {
                acc[key] = {
                    year: date.getFullYear(),
                    month: date.getMonth(),
                    notes: []
                };
            }

            acc[key].notes.push(note);
            return acc;
        }, {});
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;

        return date.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    const handleStatusChange = (e, noteId) => {
        e.stopPropagation();
        const newStatus = e.target.value;
        updateNoteStatus(noteId, newStatus);
    };

    const scrollToStart = () => {
        timelineRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
    };

    const scrollToEnd = () => {
        timelineRef.current?.scrollTo({
            left: timelineRef.current.scrollWidth,
            behavior: 'smooth'
        });
    };

    const filteredNotes = filterNotes(notes);
    const notesByMonth = groupNotesByMonth(filteredNotes);
    const totalNotes = filteredNotes.length;

    if (loading) {
        return (
            <div className={styles.timelineLoading}>
                <div className={styles.spinner}></div>
                <p>Loading notes...</p>
            </div>
        );
    }

    return (
        <div className={styles.timelineWrapper}>
            <div className={styles.header}>
                <div className={styles.headerTop}>
                    <h2 className={styles.timelineTitle}>
                        Notes Timeline
                        <span className={styles.notesCount}>{totalNotes}</span>
                    </h2>

                    <div className={styles.controls}>
                        <button
                            onClick={scrollToStart}
                            className={styles.scrollBtn}
                            title="Scroll to start"
                        >
                            ⟨⟨
                        </button>
                        <button
                            onClick={scrollToEnd}
                            className={styles.scrollBtn}
                            title="Scroll to end"
                        >
                            ⟩⟩
                        </button>
                    </div>
                </div>

                <div className={styles.filters}>
                    <input
                        type="text"
                        placeholder="Search notes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.searchInput}
                    />

                    <div className={styles.statusFilters}>
                        <button
                            className={`${styles.filterBtn} ${selectedStatus === 'all' ? styles.active : ''}`}
                            onClick={() => setSelectedStatus('all')}
                        >
                            All
                        </button>
                        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                            <button
                                key={key}
                                className={`${styles.filterBtn} ${selectedStatus === key ? styles.active : ''}`}
                                onClick={() => setSelectedStatus(key)}
                                style={{
                                    borderColor: selectedStatus === key ? config.color : '#e5e7eb',
                                    backgroundColor: selectedStatus === key ? config.bgColor : 'white',
                                    color: selectedStatus === key ? config.color : '#666'
                                }}
                            >
                                {config.status}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {Object.keys(notesByMonth).length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>📝</div>
                    <h3>No notes found</h3>
                    <p>
                        {searchQuery || selectedStatus !== 'all'
                            ? 'Try changing your filters'
                            : 'Create your first note to get started'}
                    </p>
                </div>
            ) : (
                <div className={styles.timeline} ref={timelineRef}>
                    {Object.values(notesByMonth)
                        .sort((a, b) => b.year - a.year || b.month - a.month)
                        .map(group => (
                            <div
                                key={`${group.year}-${group.month}`}
                                className={styles.timelineMonth}
                            >
                                <div className={styles.monthHeader}>
                                    <div className={styles.monthTitle}>
                                        {monthNames[group.month]} {group.year}
                                    </div>
                                    <div className={styles.monthCount}>
                                        {group.notes.length} {group.notes.length === 1 ? 'note' : 'notes'}
                                    </div>
                                </div>

                                <div className={styles.monthNotes}>
                                    {group.notes.map(note => (
                                        <div
                                            key={note.id}
                                            className={styles.timelineNote}
                                            style={{
                                                borderLeftColor: STATUS_CONFIG[note.status]?.color || '#ccc'
                                            }}
                                        >
                                            <div className={styles.noteHeader}>
                                                <div className={styles.noteDate}>
                                                    {formatDate(note.created_at)}
                                                    <span className={styles.noteTime}>
                                                        {formatTime(note.created_at)}
                                                    </span>
                                                </div>
                                                
                                                <select
                                                    value={note.status}
                                                    onChange={(e) => handleStatusChange(e, note.id)}
                                                    className={styles.statusSelect}
                                                    style={{
                                                        color: STATUS_CONFIG[note.status]?.color || '#666',
                                                        backgroundColor: STATUS_CONFIG[note.status]?.bgColor || '#f3f4f6'
                                                    }}
                                                >
                                                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                                        <option key={key} value={key}>
                                                            {config.status}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className={styles.noteTitle}>
                                                {note.title}
                                            </div>

                                            <div className={styles.noteContent}>
                                                {note.content}
                                            </div>
                                        </div>
                                    ))}
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
};

export default CalendarView;