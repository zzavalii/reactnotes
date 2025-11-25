import { useCallback } from 'react';
import { ACTIONS } from '../store/notesReducer';

export function useWeather(state, dispatch, apiKey) {

    const getCityWeather = useCallback(async () => {
        const city = state.weather.city;

        if (!city.trim()) {
            dispatch({
                type: ACTIONS.SET_WEATHER_ERROR,
                payload: "Please enter the city"
            });
            return;
        }

        dispatch({ type: ACTIONS.SET_WEATHER_LOADING, payload: true });
        dispatch({ type: ACTIONS.CLEAR_WEATHER_ERROR });

        try {
            const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
            const res = await fetch(weatherUrl);

            if (!res.ok) throw new Error("Не удалось получить погоду");

            const data = await res.json();

            dispatch({
                type: ACTIONS.SET_WEATHER_DATA,
                payload: data
            });

        } catch (err) {
            dispatch({
                type: ACTIONS.SET_WEATHER_ERROR,
                payload: "Error of downloading info"
            });
            console.error('Weather fetch error:', err);
        }
    }, [state.weather.city, apiKey, dispatch]);

    return {
        getCityWeather
    };
}
