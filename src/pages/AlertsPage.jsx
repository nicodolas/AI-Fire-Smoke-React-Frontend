import { useEffect, useRef, useState } from "react";
import {
    collectionGroup,
    onSnapshot,
    doc,
    updateDoc,
} from "firebase/firestore";
import { db } from "../firebase.js";
import Layout from "../components/Layout";
import {
    FiAlertTriangle,
    FiCamera,
    FiClock,
    FiMapPin,
    FiX,
    FiFilter,
    FiTrash2,
    FiCheckSquare,
} from "react-icons/fi";

export default function AlertsPage() {
    const [alerts, setAlerts] = useState([]);
    const [filteredAlerts, setFilteredAlerts] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const containerRef = useRef(null);
    const [dragRect, setDragRect] = useState(null);
    const dragStartRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    // 🔹 Load realtime từ Firestore
    useEffect(() => {
        const ref = collectionGroup(db, "alerts");
        const unsub = onSnapshot(ref, (snap) => {
            const data = snap.docs
                .map((doc) => ({
                    id: doc.id,
                    userId: doc.ref.parent.parent.id,
                    ...doc.data(),
                }))
                .filter((a) => a.status !== "disable");

            data.sort(
                (a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0)
            );
            setAlerts(data);
            setFilteredAlerts(data);
        });
        return () => unsub();
    }, []);

    // 🔹 Lọc theo ngày và loại cảnh báo
    useEffect(() => {
        let result = [...alerts];
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            result = result.filter((a) => {
                if (!a.timestamp?.seconds) return false;
                const t = new Date(a.timestamp.seconds * 1000);
                return t >= start && t <= end;
            });
        }
        if (typeFilter !== "all") result = result.filter((a) => a.type === typeFilter);
        setFilteredAlerts(result);
    }, [alerts, startDate, endDate, typeFilter]);

    // 🔹 Toggle chọn
    const toggleSelect = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    // 🔹 Chọn tất cả / bỏ chọn tất cả
    const selectAll = () => {
        if (selectedIds.length === filteredAlerts.length) setSelectedIds([]);
        else setSelectedIds(filteredAlerts.map((a) => a.id));
    };

    // 🔹 Xóa logic (disable)
    const handleDeleteSelected = async () => {
        const promises = selectedIds.map(async (id) => {
            const alert = alerts.find((a) => a.id === id);
            const ref = doc(db, "users", alert.userId, "alerts", id);
            await updateDoc(ref, { status: "disable" });
        });
        await Promise.all(promises);
        setSelectedIds([]);
    };

    // 🔹 Đánh dấu đã xem khi click ảnh
    const handleImageClick = async (alert) => {
        setSelectedImage(alert.imageUrl);
        if (alert.status === "visible") {
            const ref = doc(db, "users", alert.userId, "alerts", alert.id);
            await updateDoc(ref, { status: "viewed" });
        }
    };

    const formatTime = (s) =>
        s ? new Date(s * 1000).toLocaleString("vi-VN") : "Không rõ";

    // ================================
    // 🔹 Kéo chọn nhiều (drag-select)
    // ================================
    const handleMouseDown = (e) => {
        if (e.button !== 0) return;
        setIsDragging(true);
        dragStartRef.current = { x: e.clientX, y: e.clientY };
        setDragRect({ x: e.clientX, y: e.clientY, width: 0, height: 0 });
    };

    const handleMouseMove = (e) => {
        if (!isDragging || !dragStartRef.current) return;
        const { x, y } = dragStartRef.current;
        const newRect = {
            x: Math.min(x, e.clientX),
            y: Math.min(y, e.clientY),
            width: Math.abs(e.clientX - x),
            height: Math.abs(e.clientY - y),
        };
        setDragRect(newRect);

        const cards = containerRef.current.querySelectorAll("[data-id]");
        const hovered = [];

        cards.forEach((card) => {
            const rect = card.getBoundingClientRect();
            const overlap =
                rect.right >= newRect.x &&
                rect.left <= newRect.x + newRect.width &&
                rect.bottom >= newRect.y &&
                rect.top <= newRect.y + newRect.height;
            if (overlap) hovered.push(card.dataset.id);
        });

        // 🔹 Giữ Alt để bỏ chọn vùng đó
        setSelectedIds((prev) => {
            const set = new Set(prev);
            if (e.altKey) hovered.forEach((id) => set.delete(id));
            else hovered.forEach((id) => set.add(id));
            return Array.from(set);
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setDragRect(null);
        dragStartRef.current = null;
    };

    // 🔹 Nhấn ESC để hủy chọn
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") setSelectedIds([]);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    // ================================

    return (
        <Layout>
            <div
                className="max-w-6xl mx-auto p-6 relative select-none"
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
            >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                    <div className="flex items-center space-x-2">
                        <FiAlertTriangle size={28} className="text-sky-600" />
                        <h1 className="text-2xl font-bold text-gray-800">
                            Nhật ký cảnh báo
                        </h1>
                    </div>

                    {/* Bộ lọc */}
                    <div className="flex flex-wrap items-center gap-3 bg-white border border-sky-200 rounded-xl px-4 py-2 shadow-sm">
                        <FiFilter className="text-sky-600" />
                        <div className="flex items-center gap-2 text-sm">
                            <label>Từ:</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:ring-1 focus:ring-sky-400"
                            />
                            <label>Đến:</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:ring-1 focus:ring-sky-400"
                            />
                        </div>

                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:ring-1 focus:ring-sky-400"
                        >
                            <option value="all">Tất cả</option>
                            <option value="fire">🔥 Lửa</option>
                            <option value="smoke">💨 Khói</option>
                        </select>

                        {filteredAlerts.length > 0 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    selectAll();
                                }}
                                className="text-sm flex items-center text-sky-700 hover:text-sky-900"
                            >
                                <FiCheckSquare className="mr-1" />
                                {selectedIds.length === filteredAlerts.length
                                    ? "Bỏ chọn tất cả"
                                    : "Chọn tất cả"}
                            </button>
                        )}
                    </div>
                </div>

                {/* Thanh công cụ khi có chọn */}
                {selectedIds.length > 0 && (
                    <div className="mb-4 flex justify-between items-center bg-sky-50 border border-sky-200 rounded-xl p-3">
                        <p className="text-sky-700 text-sm font-medium">
                            Đã chọn {selectedIds.length} cảnh báo
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedIds([]);
                                }}
                                className="flex items-center bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-300 transition text-sm"
                            >
                                Hủy chọn
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSelected();
                                }}
                                className="flex items-center bg-red-500 text-white px-4 py-1.5 rounded-lg hover:bg-red-600 shadow-sm transition text-sm"
                            >
                                <FiTrash2 className="mr-1" /> Xóa
                            </button>
                        </div>
                    </div>
                )}

                {/* Danh sách */}
                {filteredAlerts.length === 0 ? (
                    <p className="text-gray-500 text-center py-10">
                        Không có cảnh báo nào phù hợp.
                    </p>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAlerts.map((a) => (
                            <div
                                key={a.id}
                                data-id={a.id}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSelect(a.id);
                                }}
                                className={`rounded-2xl border p-4 shadow-md transition cursor-pointer relative ${selectedIds.includes(a.id)
                                    ? "ring-2 ring-sky-500 bg-sky-50"
                                    : "hover:bg-gray-50"
                                    } ${a.type === "fire"
                                        ? "border-red-300"
                                        : "border-sky-300"
                                    }`}
                            >
                                <div className="flex items-center mb-3 space-x-2">
                                    <FiAlertTriangle
                                        className={
                                            a.type === "fire"
                                                ? "text-red-500"
                                                : "text-sky-500"
                                        }
                                        size={22}
                                    />
                                    <p
                                        className={`font-semibold text-lg ${a.type === "fire"
                                            ? "text-red-700"
                                            : "text-sky-700"
                                            }`}
                                    >
                                        {a.type === "fire" ? "🔥 Cháy" : "💨 Khói"}
                                    </p>
                                </div>

                                {a.imageUrl && (
                                    <img
                                        src={a.imageUrl}
                                        alt="Ảnh cảnh báo"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleImageClick(a);
                                        }}
                                        className="rounded-xl w-full h-44 object-cover mb-3 border border-gray-200 cursor-zoom-in hover:opacity-80"
                                    />
                                )}

                                <div className="space-y-1 text-sm text-gray-700">
                                    <p className="flex items-center">
                                        <FiCamera className="mr-2 text-sky-500" />
                                        {a.cameraName || a.cameraId}
                                    </p>
                                    <p className="flex items-center">
                                        <FiMapPin className="mr-2 text-sky-500" />
                                        {a.location || "Không xác định"}
                                    </p>
                                    <p className="flex items-center">
                                        <FiClock className="mr-2 text-sky-500" />
                                        {formatTime(a.timestamp?.seconds)}
                                    </p>
                                </div>

                                <div className="mt-3">
                                    <span
                                        className={`inline-block text-xs font-medium px-2 py-1 rounded-full ${a.status === "visible"
                                            ? "bg-sky-500 text-white"
                                            : a.status === "viewed"
                                                ? "bg-green-500 text-white"
                                                : "bg-gray-400 text-white"
                                            }`}
                                    >
                                        {a.status === "visible"
                                            ? "Chưa xem"
                                            : a.status === "viewed"
                                                ? "Đã xem"
                                                : "Ẩn"}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Hình chữ nhật kéo chọn */}
                {dragRect && (
                    <div
                        style={{
                            position: "fixed",
                            left: dragRect.x,
                            top: dragRect.y,
                            width: dragRect.width,
                            height: dragRect.height,
                            backgroundColor: "rgba(56,189,248,0.2)",
                            border: "1px solid #0ea5e9",
                            zIndex: 1000,
                        }}
                    />
                )}

                {/* Overlay zoom ảnh */}
                {selectedImage && (
                    <div
                        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
                        onClick={() => setSelectedImage(null)}
                    >
                        <div className="relative max-w-4xl w-full p-4">
                            <img
                                src={selectedImage}
                                alt="Zoom"
                                className="w-full max-h-[90vh] object-contain rounded-lg shadow-2xl border-4 border-sky-200"
                            />
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="absolute top-6 right-6 bg-white rounded-full p-2 hover:bg-gray-100 shadow-md"
                            >
                                <FiX size={22} className="text-gray-700" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
