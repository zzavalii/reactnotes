import { useEffect, useState } from "react";

export function useCitySuggestions(city, apiKey) {
    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {
        if (city.trim().length < 2) {
            setSuggestions([]);
            return;
        }

        const timeoutId = setTimeout(async () => {
            try {
                const url = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=10&appid=${apiKey}`;
                const res = await fetch(url);
                const data = await res.json();

                const filtered = data.filter(item =>
                    item.name.toLowerCase().startsWith(city.toLowerCase())
                );

                setSuggestions(filtered);
            } catch (err) {
                console.error("City suggestions error:", err);
            }
        }, 100);

        return () => clearTimeout(timeoutId);

    }, [city, apiKey]);

    return { suggestions };
}
