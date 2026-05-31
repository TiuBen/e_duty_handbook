import { NavLink } from "react-router-dom";

export default function Sidebar() {
    return (
        <div className="w-60 border-r bg-white">
            <div className="p-4 font-bold text-xl">E-Duty</div>

            <nav className="flex flex-col">
                <NavLink to="/users" className="px-4 py-3 hover:bg-gray-100">
                    用户管理
                </NavLink>
            </nav>
        </div>
    );
}
