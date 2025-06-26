import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Desks from "./pages/Desks";
import GuestsPage from "./pages/GuestsPage";
import HistoryPage from "./pages/HistoryPage";
import { useReservationCleaner } from "./hooks/useReservationCleaner";

function App() {
  useReservationCleaner();
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/desks" replace />} />
          <Route path="desks" element={<Desks />} />
          <Route path="guests" element={<GuestsPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="*" element={<Navigate to="/desks" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
