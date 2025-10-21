import '../introduce/Introduce.css'

import { Link } from 'react-router-dom'

export default function Introduce () {

    return (
        <>
            <header className="">
                <div className="headerContainerIntroduce"> 
                    <div className="d-flex flex-wrap align-items-center">
                        {/* <div className="Japanese introduceName">ノートアプリ</div> */}

                        <div className="headerButtons">
                            
                            <Link
                                className='allLinks'
                                to="/login">
                                <div className='signInBtn'>Login</div>
                            </Link>

                            <Link
                                to="/register"
                                className='allLinks'>
                                <div className='signUpBtn'>Registration</div>
                            </Link>

                            {/* <div
                                className="darkThemeIntroduce"
                                id="headerButtonIntroduce"
                                // onClick={toggleDarkTheme}
                                // ref={buttonDarkThemeRef}
                            >
                                Light/Dark
                            </div> */}

                            <div className="themeToggleContainer">
                                <input type="checkbox" id="themeToggle" className="themeToggle" />
                                <label htmlFor="themeToggle" className="themeToggleLabel">
                                    <span className="themeIcon sun">Light</span>
                                    <span className="themeIcon moon">Dark</span>
                                </label>
                            </div>
                        </div>
                        
                    </div>
                </div>
            </header>

            <div className="container1">
                <div class="wrapper">
                    <div class="box1 box">
                        <div className="imageMain">
                            <img src="images\weather.jpg" alt="" />
                        </div>
                    </div>
                    <div class="box2 box">
                        <div className="con2">
                            <div className="imageSecondary">
                                <img src="images\Formatting.jpg" alt="" />
                            </div>  
                            <div className="conText4">
                                <h2>Formatting is available across the board, for every taste and color, drag and drop as you need.</h2>
                                <p><b>&copy; ノートアプリ</b> &middot; October 05, 2025</p>
                            </div>
                        </div>
                    </div>
                    <div class="box3 box">
                        <span className='appName'>ノートアプリ (Note application)</span> 
                        - a great solution if you need a place to keep your notes handy. Everything you need for taking notes is right here. 
                    </div>
                    <div class="box4 box">
                        <div className="con2">
                            <div className="imageSecondary">
                                <img src="images\mainscreen1.jpg" alt="" />
                            </div>  
                            <div className="conText4">
                                <h2>Conveniently track the progress of your notes, distribute them however you wish</h2>
                                <p><b>&copy; ノートアプリ</b> &middot; August 19, 2025</p>
                            </div>
                        </div>
                    </div>

                    <div class="box5 box">
                        <div className="container1_underform">
                            <div className="text_underform">
                                <h2 className='dontbeshy'>Don't be shy</h2>
                                <h4>If you would like to see improvements, please email us. We are always happy to hear your feedback.</h4>
                            </div>

                            <div className="feedback">
                                <p>Your email address</p> 
                                <div className="emailInputButtons"> 
                                    <input type="text" className='emailInput' />
                                    <input type="button" className='emailSubmit' value='Submit' />
                                </div>   
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* <div className="container2">
                
            </div> */}
        </>
    )
}