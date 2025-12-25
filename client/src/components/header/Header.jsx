import { useRef, useEffect, useState } from 'react';
import '../header/Header.css'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCitySuggestions } from '../notes/hooks/useCitySuggestions';

export default function Header({toggleLeftPanel ,isWeather, toggleWeather, city, setCity, getCityWeather, weatherData, loading, setError, error, setWeatherData, toggleDarkTheme, darkTheme }) {

    const buttonWeatherRef = useRef(null);
    const buttonDarkThemeRef = useRef(null);
    const weatherRef = useRef(null);

    const location = useLocation();
    const navigate = useNavigate()

    const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
    const { suggestions } = useCitySuggestions(city, API_KEY);
    const [showSuggestions, setShowSuggestions] = useState(true);

    const handleSuggestionClick = (cityName) => {
        setCity(cityName);
        setShowSuggestions(false);
    };
    //Weather outside click handler
    useEffect(() => {
        function handleOutsideClick(event) {
            if (
                buttonWeatherRef.current &&
                !buttonWeatherRef.current.contains(event.target) &&
                weatherRef.current &&
                !weatherRef.current.contains(event.target)
            ) {
                if (isWeather) toggleWeather();
            }
        }
        document.addEventListener("mousedown", handleOutsideClick);
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        }
    }, [isWeather, toggleWeather]);

    useEffect(() => {
        if (!isWeather) {
            setWeatherData(null);
            setCity('');
            setError('');
        }
    }, [isWeather]);


    useEffect(() => {
        if (darkTheme) {
            document.body.classList.add("darker")
        } else {
            document.body.classList.remove("darker")
        }
    }, [darkTheme])


    return (
        <header className="p-1 mb-1 border-bottom">
            <div className="headerContainer"> 
                <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start">
                    <a href="" className="d-flex align-items-center mb-2 mb-lg-0 text-dark text-decoration-none">
                        <svg className="bi me-2" width="40" height="32" role="img" aria-label="Bootstrap"><use></use></svg>
                    </a>

                    <div className="JapaneseText">ノートアプリ</div>

                    <nav className="navbar navbar">
                        <div className="container-fluid">
                            <button onClick={toggleLeftPanel} className="navbarToggler" type="button" id="burger-btn" data-bs-toggle="collapse" data-bs-target="#navbarToggleExternalContent" aria-controls="navbarToggleExternalContent" aria-expanded="false" aria-label="Toggle navigation">
                                {darkTheme ? 
                                    <img src="images/burger.svg" className='burgerIcon' alt="" /> 
                                : <img src="images/burgerblack.svg" className='burgerIcon' alt="" />}
                            </button>
                        </div>
                    </nav>

                    <ul className="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-center mb-md-0">
                        <li><Link
                            to="/notes"
                            className={'nav-link px-2 link-secondary ' + (location.pathname === "/notes" ? "underline" : "link-secondary")}
                            id="progressTracker">
                            Progress tracker
                        </Link></li>
                        <li><Link
                            to="/overview"
                            className={'nav-link px-2 link-secondary ' + (location.pathname === "/overview" ? "underline" : "link-secondary")}
                            id="overview">
                            Overview
                        </Link></li>
                    </ul>
                    <div
                        className="weather"
                        id="headerButton"
                        onClick={toggleWeather}
                        ref={buttonWeatherRef}
                    >
                        Weather
                    </div>
                    <div
                        className="darktheme"
                        id="headerButton"
                        onClick={toggleDarkTheme}
                        ref={buttonDarkThemeRef}
                    >
                        Light/Dark
                    </div>
                </div>
            </div>

            {isWeather &&
                <div className="bottomContainer" ref={weatherRef}>
                    <div className="weaterInputs">
                        <input
                            type="text"
                            id="cityName"
                            value={city}
                            onChange={(e) => {
                                setCity(e.target.value);
                                setShowSuggestions(true);
                            }}
                            placeholder="Enter city"
                        />
                        <input
                            type="button"
                            value="Search"
                            id="applyCity"
                            onClick={getCityWeather}
                        />

                        {showSuggestions && suggestions.length > 0 && (
                            <ul className="citySuggestions">
                                {suggestions.map((c, index) => (
                                    <li
                                        key={index}
                                        onClick={() => handleSuggestionClick(c.name)}
                                    >
                                        {c.name}, {c.country}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    {loading && <p>Downloading...</p>}
                    {error && <p style={{ color: "red" }}>{error}</p>}
                    <div className='outputText'>
                        {weatherData && (
                            <>
                                <h3>{weatherData.name}</h3>
                                <p>Temperature: {Math.round(weatherData.main.temp)}°C</p>
                                <p>Weather: {weatherData.weather[0].description}</p>
                                <p>Humidity: {weatherData.main.humidity}</p>
                                <p>Wind: {weatherData.wind.speed} m/s</p>
                                <img src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`} alt="weather icon" />
                                <p>Max. daily temp.: {Math.round(weatherData.main.temp_max)}°C</p>
                                <p>Min. daily temp.: {Math.round(weatherData.main.temp_min)}°C</p>
                            </>
                        )}
                    </div>
                </div>
            }
        </header>
    )
}