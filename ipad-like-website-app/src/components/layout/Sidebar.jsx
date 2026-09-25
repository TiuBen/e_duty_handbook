import { NavLink } from "react-router-dom";
import menus from "../../api/navMenus";

export default function Sidebar() {
    return (
        <div className="w-40 border-r bg-white">
            <div className="p-4 font-bold text-xl">E-Duty</div>

            <nav className="flex flex-col">
                {menus.map((menu) => (
                    <NavLink
                        key={menu.path}
                        to={menu.path}
                        className={({ isActive }) =>
                            `
                                px-4
                                py-3
                                transition
                                ${isActive ? "bg-blue-50 text-blue-600 font-medium" : "hover:bg-gray-100"}
                                `
                        }
                    >
                        {menu.title}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
}
