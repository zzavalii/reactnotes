import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Стили Quill

export default function TextEditor() {
    const [value, setValue] = useState("");

    // Настройка тулбара
   const modules = {
    toolbar: [
        [{ header: [1, 2, 3, false] }],           // Заголовки
        ["bold", "italic", "underline", "strike"], // Форматирование
        [{ align: [] }],                           // Выравнивание: left, center, right, justify
        [{ list: "ordered" }, { list: "bullet" }], // Списки
        [{ color: [] }, { background: [] }],       // Цвет текста и фон
        ["link", "image", "video"],                // Ссылки, картинки, видео
        ["clean"],                                 // Сброс форматирования
    ],
    };

    const formats = [
        "header",
        "bold", "italic", "underline", "strike",
        "list", "bullet",
        "link", "image",
    ];

    return (
        <div style={{ margin: "2rem" }}>
            <ReactQuill
                theme="snow"
                value={value}
                onChange={setValue}
                modules={modules}
                formats={formats}
                placeholder="Введите текст..."
            />
        </div>
    );
}
