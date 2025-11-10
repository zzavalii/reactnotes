import { useEffect, useState } from "react";

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
        <div className="tagsContainer">
            {Object.entries(tags).map(([tagName, notes]) => (
                <div key={tagName} className="tagBlock">
                    <h2>{tagName}</h2>
                    <ul>
                        {notes.map((note) => (
                            <li className="note" key={note.id}>
                                <h3>{note.title}</h3>
                                <p>{note.content}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}
