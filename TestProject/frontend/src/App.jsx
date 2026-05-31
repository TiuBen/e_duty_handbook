import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";

import UserPage from "./pages/UserPage";

export default function App() {
    return (
        <BrowserRouter>
            <AppLayout>
                <Routes>
                    <Route path="/" element={<Navigate to="/users" />} />

                    <Route path="/users" element={<UserPage />} />
                </Routes>
            </AppLayout>
        </BrowserRouter>
    );
}
