import { useState, useEffect } from 'react';

export function useDarkTheme() {
    const [darkTheme, setDarkTheme] = useState(() => {
        return localStorage.getItem("darkTheme") === 'true';
    });

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

    return { darkTheme, toggleDarkTheme };
}