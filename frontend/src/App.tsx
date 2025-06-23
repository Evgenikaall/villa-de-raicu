import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Desks from './pages/Desks';
import GuestsPage from "./pages/GuestsPage.tsx";

function App() {
    return (
        <BrowserRouter>
            <Navigation />
            <Routes>
                <Route path="/" element={<Navigate to="/desks" replace />} />
                <Route path="/desks" element={<Desks />} />
                <Route path="/guests" element={<GuestsPage/>} />
                {/* 404 fallback */}
                <Route path="*" element={<Navigate to="/desks" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
