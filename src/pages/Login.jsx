import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate("/dashboard");
        } catch {
            setError("Sai email hoặc mật khẩu. Vui lòng thử lại.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-100 via-indigo-100 to-pink-100">
            <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
                <h1 className="text-3xl font-bold text-center text-primary mb-6">
                    🔥 Rabbit Fire
                </h1>

                {error && (
                    <div className="bg-red-100 text-red-600 text-sm p-2 rounded mb-4 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Nhập email của bạn"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Mật khẩu
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Nhập mật khẩu"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary text-white font-semibold py-2 rounded-lg hover:bg-accent transition"
                    >
                        Đăng nhập
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    © 2025 Rabbit Fire — Fire & Smoke Detection
                </p>
            </div>
        </div>
    );
}
