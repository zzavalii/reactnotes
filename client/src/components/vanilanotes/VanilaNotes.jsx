import React, { useReducer, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Стили Quill

export default function VanilaNotes() {
//     const [value, setValue] = useState("");

//     // Настройка тулбара
//    const modules = {
//     toolbar: [
//         [{ header: [1, 2, 3, false] }],           // Заголовки
//         ["bold", "italic", "underline", "strike"], // Форматирование
//         [{ align: [] }],                           // Выравнивание: left, center, right, justify
//         [{ list: "ordered" }, { list: "bullet" }], // Списки
//         [{ color: [] }, { background: [] }],       // Цвет текста и фон
//         ["link", "image", "video"],                // Ссылки, картинки, видео
//         ["clean"],                                 // Сброс форматирования
//     ],
//     };

//     const formats = [
//         "header",
//         "bold", "italic", "underline", "strike",
//         "list", "bullet",
//         "link", "image",
//     ];

//     return (
//         <div style={{ margin: "2rem" }}>
//             <ReactQuill
//                 theme="snow"
//                 value={value}
//                 onChange={setValue}
//                 modules={modules}
//                 formats={formats}
//                 placeholder="Введите текст..."
//             />
//         </div>
//     );


    const initialValue = { num: 0 }

    const [number, dispatch] = useReducer(reducer, initialValue)

    function reducer(state, action) {
        switch(action.type){
            case "ACTIONS_PLUS":
                return {
                    num: state.num + action.payload
                }

            case "ACTIONS_MINUS":
                return {
                    num: state.num - action.payload
                }

            default:
                return state;
        }
    }

    return (
        <>
            <div className="con">
                <h2>{number.num}</h2>
            </div>

            <button onClick={() => {
                dispatch({type: "ACTIONS_PLUS", payload: 2})
            }}>plus</button>
            <button onClick={() => {
                dispatch({type: "ACTIONS_MINUS", payload: 1})
            }}>minus</button>
        </>
    )
}
