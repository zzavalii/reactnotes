import { useRef, useEffect, useState } from 'react';
import '../header/Header.css'
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Header({ isWeather, toggleWeather, city, setCity, getCityWeather, weatherData, loading, setError, error, setWeatherData, toggleDarkTheme, darkTheme }) {

    const buttonWeatherRef = useRef(null);
    const buttonDarkThemeRef = useRef(null);
    const weatherRef = useRef(null);
    const userInfoRef = useRef(null);

    const location = useLocation();
    const navigate = useNavigate()
    const [isUserInfo, setUserInfo] = useState(false);

    function handlerUserInfo () {
        setUserInfo(prev => !prev)
    }

    function unlogin() {
        localStorage.removeItem("token")
        localStorage.setItem("isLoggedIn", "false");
        navigate('/login')
    }

    useEffect(() => {
        function handleOutsideClickUser(event) {
            if (
                userInfoRef.current &&
                !userInfoRef.current.contains(event.target)
            ) {
                if(isUserInfo) handlerUserInfo();
            }
        }
        document.addEventListener("mousedown", handleOutsideClickUser);
        return () => {
            document.removeEventListener("mousedown", handleOutsideClickUser);
        }
    }, [isUserInfo])

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
            document.body.classList.add("dark")
        } else {
            document.body.classList.remove("dark")
        }
    }, [darkTheme])

    return (
        <header className="p-1 mb-1 border-bottom">
            <div className="headerContainer"> 
                <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start">
                    <a href="/" className="d-flex align-items-center mb-2 mb-lg-0 text-dark text-decoration-none">
                        <svg className="bi me-2" width="40" height="32" role="img" aria-label="Bootstrap"><use></use></svg>
                    </a>

                    <div className="JapaneseText">ノートアプリ</div>

                    <nav className="navbar navbar">
                        <div className="container-fluid">
                            <button className="navbar-toggler" type="button" id="burger-btn" data-bs-toggle="collapse" data-bs-target="#navbarToggleExternalContent" aria-controls="navbarToggleExternalContent" aria-expanded="false" aria-label="Toggle navigation">
                                <span className="navbar-toggler-icon"></span>
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
                    <div className="dropdown text-end" id="rightestItem">
                        <a href="#" className="d-block link-dark text-decoration-none dropdown-toggle" id="dropdownUser1" data-bs-toggle="dropdown" aria-expanded="false">
                            <img src="https://github.com/mdo.png" alt="mdo" width="26" height="26" className="rounded-circle" />
                        </a>
                        <ul className="dropdown-menu text-small" aria-labelledby="dropdownUser1">
                            <li><a className="dropdown-item" id="profile" onClick={handlerUserInfo}>Profile</a></li>
                            <li><hr className="dropdown-divider" /></li>
                            <li><a className="dropdown-item" id="logout" onClick={unlogin}>Sign out</a></li>
                        </ul>
                    </div>
                </div>
            </div>
            {isUserInfo &&
                <div className="profile_header" ref={userInfoRef}>
                    <div className="userName">User: </div>
                    <div className="userEmail">Email: Vlad</div>
                    <div className="edit">Edit ✏️</div>
                </div>  
            }

            {isWeather &&
                <div className="bottomContainer" ref={weatherRef}>
                    <div className="weaterInputs">
                        <input
                            type="text"
                            id="cityName"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                        />
                        <input
                            type="button"
                            value="Search 🔎"
                            id="applyCity"
                            onClick={getCityWeather}
                        />
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