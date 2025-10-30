import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function Navbar() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/login");
    };

    return (
        <nav className="bg-primary text-white shadow-md">
            <div className="container mx-auto px-6 py-3 flex justify-between items-center">
                {/* Logo / Tên dự án */}
                <Link
                    to="/dashboard"
                    className="text-xl font-bold tracking-wide flex items-center gap-2"
                >
                    🔥 <span>Rabbit Fire</span>
                </Link>

                {/* Khu vực bên phải */}
                <div className="flex items-center gap-4">
                    {user && (
                        <span className="text-sm text-gray-200">
                            Xin chào, <span className="font-semibold">{user.email}</span>
                        </span>
                    )}

                    {user ? (
                        <button
                            onClick={handleLogout}
                            className="bg-secondary px-4 py-1 rounded-lg hover:bg-accent transition"
                        >
                            Đăng xuất
                        </button>
                    ) : (
                        <Link
                            to="/login"
                            className="bg-secondary px-4 py-1 rounded-lg hover:bg-accent transition"
                        >
                            Đăng nhập
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
