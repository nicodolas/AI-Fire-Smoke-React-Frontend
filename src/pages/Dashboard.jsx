import Layout from "../components/Layout";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
    FiCamera,
    FiBell,
    FiDatabase,
    FiSettings,
    FiUsers,
} from "react-icons/fi";

export default function Dashboard() {
    const { role } = useAuth();
    const navigate = useNavigate();

    const baseFeatures = [
        { icon: <FiCamera size={36} />, label: "Xem Camera", color: "bg-blue-500", path: "/cameras" },
        { icon: <FiBell size={36} />, label: "Thông báo", color: "bg-cyan-500", path: "/notifications" },
        { icon: <FiDatabase size={36} />, label: "Nhật ký phát hiện", color: "bg-sky-500", path: "/alert" },
        { icon: <FiSettings size={36} />, label: "Cài đặt", color: "bg-indigo-500", path: "/settings" },
    ];

    const adminFeatures = [
        { icon: <FiUsers size={36} />, label: "Quản lý người dùng", color: "bg-pink-500", path: "/admin/users" },
        { icon: <FiDatabase size={36} />, label: "Quản lý camera", color: "bg-purple-500", path: "/admin/cameras" },
    ];

    const features = role === "admin" ? [...baseFeatures, ...adminFeatures] : baseFeatures;

    const handleFeatureClick = (f) => {
        if (["Quản lý người dùng", "Quản lý camera"].includes(f.label) && role !== "admin") {
            alert("Bạn không có quyền truy cập chức năng này.");
            return;
        }
        navigate(f.path);
    };

    return (
        <Layout>
            <div className="flex flex-col items-center text-center">
                <h1 className="text-3xl font-bold text-primary mb-2">Trung tâm điều khiển</h1>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                    {features.map((f, i) => (
                        <button
                            key={i}
                            onClick={() => handleFeatureClick(f)}
                            className={`flex flex-col items-center justify-center ${f.color} text-white rounded-2xl w-28 h-28 shadow-lg hover:scale-105 transition`}
                        >
                            {f.icon}
                            <span className="mt-2 text-sm font-medium">{f.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </Layout>
    );
}
