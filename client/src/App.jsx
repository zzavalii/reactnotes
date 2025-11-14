import './App.css'
import Login from './components/auth/login/Login';
import Register from './components/auth/register/Register'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ColumnNotes from './components/notes/ColumnsNote';
import Overview from './components/overview/Overview';
import VanilaNotes from './components/vanilanotes/VanilaNotes'
import Introduce from './components/introduce/introduce';
import ReminderManager from './components/ReminderManager/ReminderManager'; 
import SortedTagsPage from './components/SortedTagsPage/SortedTagsPage';

function App() {
  return (
    <>
      <BrowserRouter>
        <ReminderManager />

        <Routes>
          <Route path="/" element={<Navigate to="/introduce" replace />} />
          <Route path="/introduce" element={<Introduce/>}/>
          <Route path="/register" element={<Register/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/pagetags" element={<SortedTagsPage/>} />
          <Route path="/notes" element={<ColumnNotes/>}/>
          <Route path="/overview" element={<Overview/>}/>
          <Route path="/vanila" element={<VanilaNotes/>}/>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App





