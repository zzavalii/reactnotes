import { useEffect, useState } from "react";
import styles from './SortedTagsPage.module.css'

export default function SortedTagsPage() {
    const [tags, setTags] = useState({});
    const token = localStorage.getItem("token");

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
            }
        }
        fetchTagsPage();
    }, [token]);

    return (
        <div className={styles.tagsContainer}>
            {Object.entries(tags).map(([tagName, notes]) => (
                <div key={tagName} className={styles.tagBlock}>
                    <div className={styles.tagNameBlock}>#{tagName}</div>
                    <div className={styles.ListNotes}>
                        {notes.map((note) => (
                            <div className={styles.note} key={note.id}>
                                <h5>{note.title}</h5>
                                <p>{note.content}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
