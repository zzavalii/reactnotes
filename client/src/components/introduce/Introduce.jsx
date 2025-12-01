import styles from '../introduce/Introduce.module.css'

import { Link } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react';

export default function Introduce () {

    const [darkTheme, setDarkTheme] = useState(() => {
        return localStorage.getItem("darkThemeIntroduce") === 'true';
    });
    function toggleDarkTheme() {
        setDarkTheme(prev => {
            localStorage.setItem("darkThemeIntroduce", !prev);
            return !prev;
        });
    }

    useEffect(() => {
            if (darkTheme) {
                document.body.classList.add("darkIntroduce")
            } else {
                document.body.classList.remove("darkIntroduce")
            }
        }, [darkTheme])

    useEffect(() => {
        document.body.classList.add("introducePage");

        return () => {
            document.body.classList.remove("introducePage");
        };
    }, []);

    return (
        <>
            <div className={`${styles.bodyIntroduce} ${darkTheme ? styles.darkIntroduce : ''}`}>
                <header className="">
                    <div className={`${styles.headerContainerIntroduce} ${darkTheme ? styles.darkIntroduce : ''}`}>
                        <div className={`d-flex flex-wrap align-items-center`}>

                            <div className={styles.headerButtons}>
                                
                                <Link
                                    className={styles.allLinks}
                                    to="/login">
                                    <div className={`${styles.signInBtn} ${darkTheme ? styles.darkIntroduce : ''}`}>Login</div>
                                </Link>

                                <Link
                                    to="/register"
                                    className={styles.allLinks}>
                                    <div className={`${styles.signUpBtn} ${darkTheme ? styles.darkIntroduce : ''}`}>Registration</div>
                                </Link>

                                <div
                                className={styles.themeToggleContainer} 
                                >
                                    <input  checked={darkTheme}
                                            onChange={toggleDarkTheme} type="checkbox" id="themeToggle" className={styles.themeToggle} />
                                    <label htmlFor="themeToggle" className={styles.themeToggleLabel}>
                                        <span className={`${styles.themeIcon} ${styles.sun}`}>Light</span>
                                        <span className={`${styles.themeIcon} ${styles.moon}`}>Dark</span>
                                    </label>
                                </div>
                            </div>
                            
                        </div>
                    </div>
                </header>

                <div className={`${styles.container1} ${darkTheme ? styles.darkIntroduce : ''}`}>
                    <div class={styles.wrapper}>
                        <div className={`${styles.box1} ${styles.box}`}>
                            <div className={styles.imageMain}>
                                <img src="images\weather.jpg" alt="" />
                            </div>
                        </div>
                        <div className={`${styles.box2} ${styles.box}`}>
                            <div className={styles.con2}>
                                <div className={styles.imageSecondary}>
                                    <img src="images\Formatting.jpg" alt="" />
                                </div>  
                                <div className={styles.conText4}>
                                    <h2>Formatting is available across the board, for every taste and color, drag and drop as you need.</h2>
                                    <p><b>&copy; ノートアプリ</b> &middot; October 05, 2025</p>
                                </div>
                            </div>
                        </div>
                        <div className={`${styles.box3} ${styles.box}`}>
                            <span className={styles.appName}>ノートアプリ (Note application)</span> 
                            - a great solution if you need a place to keep your notes handy. Everything you need for taking notes is right here. 
                        </div>
                        <div className={`${styles.box4} ${styles.box}`}>
                            <div className={styles.con2}>
                                <div className={styles.imageSecondary}>
                                    <img src="images\mainscreen1.jpg" alt="" />
                                </div>  
                                <div className={styles.conText4}>
                                    <h2>Conveniently track the progress of your notes, distribute them however you wish</h2>
                                    <p><b>&copy; ノートアプリ</b> &middot; August 19, 2025</p>
                                </div>
                            </div>
                        </div>

                        <div className={`${styles.box5} ${styles.box}`}>
                            <div className={` ${styles.container1_underform} ${darkTheme ? styles.darkIntroduce : ''}`}>
                                <div className={styles.text_underform}>
                                    <h2 className={styles.dontbeshy}>Don't be shy</h2>
                                    <h4>If you would like to see improvements, please email us. We are always happy to hear your feedback.</h4>
                                </div>

                                <div className={styles.feedback}>
                                    <p>Your email address</p> 
                                    <div className={styles.emailInputButtons}> 
                                        <input type="text" className={styles.emailInput} />
                                        <input type="button" className={styles.emailSubmit} value='Submit' />
                                    </div>   
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                <div className={`${styles.container2} ${darkTheme ? styles.darkIntroduce : ''}`}>
                    <div class={styles.wrapper2}>
                        <div className={`${styles.box6} ${styles.box}`}>
                                <div className={styles.imageBoxRightCon2}>
                                    <img src="images\newFocusMode1.jpg" alt="" />
                                </div>  
                                <div className={styles.threeBlocksUnderShy}>
                                    <h2>Focus panel</h2>
                                    <p><b>&copy; ノートアプリ</b> &middot; October 05, 2025</p>
                                </div>
                        </div>
                        <div className={`${styles.box7} ${styles.box}`}>
                            <div className={styles.imageBox7}>
                                <img src="images\newSortedTags1.jpg" alt="" />
                            </div>
                            <div className={styles.threeBlocksUnderShy}> 
                                <h3>A convenient page for entries sorted by tags has been added.</h3>
                                <p><b>&copy; ノートアプリ</b> &middot; November 29, 2025</p>
                            </div>
                        </div>
                        <div className={`${styles.box8} ${styles.box}`}>
                            <div className={`${styles.box8LastRow}`}>
                                <div className={styles.imageBox8}>
                                    <img src="images\focusmode.jpg" alt="" />
                                </div> 
                                <div className={styles.threeBlocksUnderShy}> 
                                    <h3>The focus page will help you concentrate on a specific task.</h3> 
                                    <p><b>&copy; ノートアプリ</b> &middot; December 1, 2025</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}