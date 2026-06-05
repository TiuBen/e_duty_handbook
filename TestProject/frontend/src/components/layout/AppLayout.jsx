import PageHeader from "../common/PageHeader";
import Sidebar from "./Sidebar";

export default function AppLayout({ children }) {
    return (
        <div className="flex h-screen">
            <Sidebar />

            <main className="flex-1 p-6 bg-gray-50 overflow-auto flex-col">{children}</main>
        </div>
    );
}
