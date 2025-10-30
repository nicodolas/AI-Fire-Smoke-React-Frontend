import { useState, useEffect } from "react";
import { FiBell, FiTrash2, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import Layout from "../components/Layout";

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        // Giả lập dữ liệu — sau này thay bằng fetch từ Firestore
        setNotifications([
            {
                id: 1,
                title: "Phát hiện khói tại Camera #1",
                time: "10:15 10/10/2025",
                type: "fire",
                read: false,
            },
            {
                id: 2,
                title: "Hệ thống được cập nhật thành công",
                time: "09:40 10/10/2025",
                type: "system",
                read: true,
            },
            {
                id: 3,
                title: "Camera #3 mất kết nối",
                time: "08:55 10/10/2025",
                type: "warning",
                read: false,
            },
        ]);
    }, []);

    const markAsRead = (id) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
    };

    const deleteNotification = (id) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    const renderIcon = (type) => {
        switch (type) {
            case "fire":
                return <FiAlertCircle className="text-red-500" size={24} />;
            case "system":
                return <FiCheckCircle className="text-green-500" size={24} />;
            case "warning":
                return <FiAlertCircle className="text-yellow-500" size={24} />;
            default:
                return <FiBell size={24} />;
        }
    };

    return (
        <Layout>
            <div className="max-w-3xl mx-auto p-4">
                <div className="flex items-center mb-6">
                    <FiBell size={28} className="text-primary mr-2" />
                    <h1 className="text-2xl font-bold text-gray-800">Thông báo</h1>
                </div>

                {notifications.length === 0 ? (
                    <p className="text-gray-500 text-center">Không có thông báo nào.</p>
                ) : (
                    <div className="space-y-3">
                        {notifications.map((n) => (
                            <div
                                key={n.id}
                                className={`flex items-center justify-between p-4 rounded-2xl border shadow-sm transition ${n.read ? "bg-gray-50 border-gray-200" : "bg-white border-primary/40"
                                    }`}
                            >
                                <div className="flex items-center space-x-3">
                                    {renderIcon(n.type)}
                                    <div>
                                        <p className="font-medium text-gray-800">{n.title}</p>
                                        <p className="text-sm text-gray-500">{n.time}</p>
                                    </div>
                                </div>

                                <div className="flex space-x-2">
                                    {!n.read && (
                                        <button
                                            onClick={() => markAsRead(n.id)}
                                            className="text-blue-600 hover:text-blue-800"
                                            title="Đánh dấu đã đọc"
                                        >
                                            <FiCheckCircle size={20} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => deleteNotification(n.id)}
                                        className="text-red-500 hover:text-red-700"
                                        title="Xóa thông báo"
                                    >
                                        <FiTrash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}
