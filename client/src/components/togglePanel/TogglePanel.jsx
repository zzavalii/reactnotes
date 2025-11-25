import './TogglePanel.css'
import { Link } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TogglePanel ({isOpen}) {
    const userInfoRef = useRef(null);
    const [isUserInfo, setUserInfo] = useState(false);
    const [isUserPanel, setUserPanel] = useState(false);
    const navigate = useNavigate();
    const [firstLetter, setFirstLetter] = useState(null)

    function handlerUserInfo () {
        setUserInfo(prev => !prev)
    }

    function handlerUserPanel () {
        setUserPanel(prev => !prev)
    }
    
    function unlogin() {
        localStorage.removeItem("token")
        localStorage.setItem("isLoggedIn", "false");
        navigate('/login')
    }
    
    const [userEmail, setUserEmail] = useState("");
    
    useEffect(() => {
        const savedEmail = localStorage.getItem("email") || sessionStorage.getItem("email");
        if (savedEmail) setUserEmail(savedEmail);
    }, []);

    useEffect(() => {
        if(userEmail){
            setFirstLetter(userEmail[0].toUpperCase());
        }
    }, [userEmail])

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

    return (
        <div className={`TogglePanelBlock ${isOpen ? 'open' : ''}`}>
            {isOpen && (
                <>
                    <div className="allToggleList">
                        <div className="infoAccountEmail">
                            <div className="userEmailInfo" onClick={handlerUserPanel}>
                                <div className="avatar">{firstLetter}</div>
                                {userEmail}
                            </div>
                        </div>
                            {isUserPanel && 
                                <>
                                    <div className="panelUserInfo">
                                        <div className="profile btnPanel" id="profile" onClick={handlerUserInfo}>Profile</div>
                                        <div className="logout btnPanel" id="logout" onClick={unlogin}>Sign out</div>
                                    </div>
                                </>
                            }

                        <div className="list">
                            <Link className="divButtonTagsGroup" to="/pagetags">
                                <div>
                                    Sorted tags
                                </div>
                            </Link>
                            <Link className="divButtonTagsGroup" to="/focusmode">
                                <div>
                                    Focus mode ⏱
                                </div>
                            </Link>
                            <Link className="divButtonTagsGroup" to="/viewcalendar">
                                <div>
                                    Calendar view
                                </div>
                            </Link>
                            <Link className="divButtonTagsGroup" to="/viewvanila">
                                <div>
                                    Vanila view
                                </div>
                            </Link>
                        </div>
                    </div>
                </>
            )}

            {isUserInfo &&
                <div className="profile_header" ref={userInfoRef}>
                    <div className="userName">User: </div>
                    <div className="userEmail">Email: {userEmail}</div>
                    <div className="edit">Edit</div>
                </div>  
            }
        </div>
    )
}