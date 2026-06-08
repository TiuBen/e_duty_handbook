import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";

import UserPage from "./pages/UserPage";
import InfoPage from "./pages/InfoPage";
import PositionPage from "./pages/PositionPage";
import ShiftItemPage from "./pages/ShiftItemPage";
import SourcePage from "./pages/SourcePage";
import DutyLogPage from "./pages/DutyLogPage";
import CategoryPage from "./pages/CategoryPage";

export default function App() {
    return (
        <BrowserRouter>
            <AppLayout>
                <Routes>
                    <Route path="/" element={<Navigate to="/users" />} />

                    <Route path="/users" element={<UserPage />} />
                    <Route path="/infos" element={<InfoPage />} />
                    <Route path="/positions" element={<PositionPage />} />
                    <Route path="/sources" element={<SourcePage />} />
                    <Route path="/shift-items" element={<ShiftItemPage />} />
                    <Route path="/duty-logs" element={<DutyLogPage />} />
                    <Route path="/categories" element={<CategoryPage />} />
                </Routes>
            </AppLayout>
        </BrowserRouter>
    );
}
