import { useState, useEffect } from "react";

export default function UserForm({ open, onClose, onSubmit, initialData }) {
    const [username, setUsername] = useState("");
    const [phonenumber, setPhonenumber] = useState("");

    useEffect(() => {
        if (initialData) {
            setUsername(initialData.username || "");
            setPhonenumber(initialData.phonenumber || "");
        } else {
            setUsername("");
            setPhonenumber("");
        }
    }, [initialData]);

    if (!open) return null;

    const handleSubmit = (e) => {
        e.preventDefault();

        onSubmit({
            username,
            phonenumber,
        });
    };

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-[400px]">
                <h2 className="text-xl font-semibold mb-4">{initialData ? "编辑用户" : "新增用户"}</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-1">用户名</label>

                        <input
                            className="w-full border rounded p-2"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block mb-1">手机号</label>

                        <input
                            className="w-full border rounded p-2"
                            value={phonenumber}
                            onChange={(e) => setPhonenumber(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 border rounded">
                            取消
                        </button>

                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
                            保存
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
