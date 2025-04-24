import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminPanel from './components/Admin/AdminPanel';
import QuestionPackEditor from './components/Admin/QuestionPackEditor';
import Admin from './components/Admin/Admin'; // 👈 your component
import './App.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/admin/question-pack" element={<QuestionPackEditor />} />
        <Route path="/admin/question-pack/:packId" element={<QuestionPackEditor />} />
        <Route path="/admin/question-pack-editor" element={<QuestionPackEditor />} />
        <Route path="/admin/question-pack-editor/:packId" element={<QuestionPackEditor />} />
        
        {/* Home route */}
        <Route path="/" element={<Admin />} />
      </Routes>
    </Router>
  );
}

export default App;
