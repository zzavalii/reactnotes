import styles from "../Auth.module.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({ email: "", password: "" });

    const navigate = useNavigate();

    const EMAIL_REGEXP = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/iu;

    function isEmailValid(value) {
        return EMAIL_REGEXP.test(value);
    }

    async function handleClickSignIn(e) {
        e.preventDefault();

        if (!email && !password) {
            setErrors({ email: "Введите почту ❗", password: "Введите пароль ❗" });
            return;
        } else if (!email) {
            setErrors({ email: "Введите почту ❗" });
            return;
        } else if (!password) {
            setErrors({ password: "Введите пароль ❗" });
            return;
        }

        if (!isEmailValid(email)) {
            setErrors({ email: "Введите почту корректно ❗" });
            return;
        }

        try {
            const response = await fetch("http://localhost:3001/authorization", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 400) {
                    setErrors({...errors, email: data.message || "Неверная почта"})
                } else if (response.status === 401) {
                    setErrors({...errors, password: data.message || "Неверный пароль"})

                } else {
                    setErrors({...errors, email: "Ошибка входа"})
                }
                return;
            }

            if (response.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("isLoggedIn", "true");
                navigate("/notes")
            }
        } catch (error) {
            console.error("Ошибка при авторизации:", error);
            if (emailInError) emailInError.textContent = "Ошибка сервера";
        }

    }

    return (
        <div className={`bodyText text-center ${styles.authWrapper}`}>
            <form className={`form-signin ${styles.signupForm}`}>
                <h1 className="h3 mb-3 font-weight-normal">Please sign in</h1>
                <input
                    className={`form-control ${styles.inputField} ${styles.emailInput}`}
                    type="email"
                    id="signin_input_email"
                    placeholder="name@example.com"
                    required autoFocus
                    onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && <div id="signin_emailError" className="form-text text-danger">{errors.email}</div>}
                <input
                    className={`form-control ${styles.inputField} ${styles.passwordInput}`}
                    type="password"
                    id="signin_input_password"
                    placeholder="Password"
                    required 
                    onChange={(e) => setPassword(e.target.value)}
                />
                {/* className="btn btn-lg btn-primary btn-block mt-3" */}
                {errors.password && <div id="signin_passwordError" className="form-text text-danger">{errors.password}</div>}
                <button type="submit" className={styles.signin_success} onClick={handleClickSignIn}>Sign in</button>
                <p className="p-2" id="textSignUp">Don`t have an account? <Link to="/register" className={styles.linkSignUp}>Sign up</Link></p>
                <p className="mt-5 mb-3 text-muted">&copy; zzavalii</p>
            </form>
        </div>
    )
}