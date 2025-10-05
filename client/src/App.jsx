import './App.css'
import Login from './components/auth/login/Login';
import Register from './components/auth/register/Register'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ColumnNotes from './components/notes/ColumnsNote';
import Overview from './components/overview/Overview';
import VanilaNotes from './components/vanilanotes/VanilaNotes'


function App() {

  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/register" replace />} />

        <Route path="/register" element={<Register/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/notes" element={<ColumnNotes/>}/>
        <Route path="/overview" element={<Overview/>}/>
        <Route path="/vanila" element={<VanilaNotes/>}/>
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
