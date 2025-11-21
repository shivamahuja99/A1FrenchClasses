import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage, CoursesPage } from './views';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<CoursesPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
