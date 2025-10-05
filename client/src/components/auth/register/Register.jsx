import styles from "../Auth.module.css";
import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, Link } from "react-router-dom";

export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [code, setCode] = useState("");
    const [errors, setErrors] = useState({ email: "", password: "" });
    const [step, setStep] = useState("form"); // form, verification

    const navigate = useNavigate();

    const EMAIL_REGEXP = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/iu;

    function isEmailValid(value) {
        return EMAIL_REGEXP.test(value);
    }

    async function SendMailConfirmation() {
        const response = await fetch("http://localhost:3001/sendMail", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usermail: email })
        })

        if (!response.ok) {
            const data = await response.json();
            setErrors({ email: data.message || "Не удалось отправить код" });
        } else {
            alert("Код отправлен на почту!");
        }
    }

    async function handleClickRegister(e) {
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

        const checkMailResponse = await fetch("http://localhost:3001/checkEmail", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usermail: email })
        });

        const checkMailData = await checkMailResponse.json();

        if (!checkMailResponse.ok) {
            setErrors({ email: checkMailData.message || "Пользователь с такой почтой уже существует" });
            return;
        };

        setStep("verification");

    }

    async function VerifyAccount() {

        if (!code || code.length !== 6) {
            setErrors({ ...errors, code: "Введите 6-значный код" });
            return;
        }

        const verifyResult = await fetch("http://localhost:3001/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, code })
        });

        const dataVerifRes = await verifyResult.json();
        setErrors({ ...errors, code: "" });

        if (!dataVerifRes.message) {
            setErrors({ ...errors, code: dataVerifRes.message || "❌ Неверный код" });
            return;
        }

        if (verifyResult.ok) {
            try {
                const response = await fetch("http://localhost:3001/registration", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email, password })
                })

                const data = await response.json();
                alert(data.message);
            } catch (err) {
                console.error("Ошибка запроса:", err);
            }
        }

        navigate("/notes")
    }

    return (
        <div className={`text-center ${styles.authWrapper}`}>
            <form className={`form-signup ${styles.signupForm}`}>
                <h1 className="h3 mb-3 font-weight-normal">Registration</h1>
                {step === "form" && (
                    <>
                        <input
                            type="email"
                            id="signup_input_email"
                            className={`form-control ${styles.inputField} ${styles.emailInput}`}
                            placeholder="name@example.com"
                            autoFocus
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        {errors.email && <div id="signup_emailError" className="form-text text-danger">{errors.email}</div>}
                        <input
                            type="password"
                            id="signup_input_password"
                            className={`form-control ${styles.inputField} ${styles.passwordInput}`}
                            placeholder="Password"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {errors.password && <div id="signup_passwordError" className="form-text text-danger">{errors.password}</div>}
                        <button className={styles.signup_success} type="button" onClick={handleClickRegister}>Sign up</button>
                    </>
                )}
                {step === "verification" && (
                    <>
                        <div className="mb-3" id="verificationBlock">
                            <label htmlFor="verificationCode" className="form-label">Введите 6-значный код</label>
                            <input
                                name="verificationCode"
                                type="text"
                                id="verificationCode"
                                className={`form-control ${styles.inputField}`}
                                placeholder="XXXXXX"
                                maxLength="6"
                                pattern="\d{6}"
                                inputMode="numeric"
                                onChange={(e) => setCode(e.target.value)}
                            />
                            <button className="btn btn-lg btn-success btn-block" type="button" id="sendMailConfirmation" onClick={SendMailConfirmation}>Send code</button>
                            <div className="form-text">Введите код из письма, состоящий из 6 цифр.</div>
                        </div>
                        {/* <div class="checkbox mb-3">
                            <label>
                            <input type="checkbox" value="remember-me"> Remember me
                            </label>
                        </div> */}
                        <button className="btn btn-lg btn-success btn-block pt-2" type="button" id="email_confirm" onClick={VerifyAccount}>Confirm</button>
                    </>
                )}
                <p className="p-2" id="textSignIn">Already have an account? <Link to={"/login"} className={styles.linkSignIn}>Sign in</Link></p>
                <p className="mt-5 mb-3 text-muted">&copy; zzavalii</p>
            </form>
        </div>
    )
}