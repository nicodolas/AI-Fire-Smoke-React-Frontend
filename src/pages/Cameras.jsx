import { useState, useEffect, useRef } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../contexts/AuthContext";

export default function Cameras() {
  const { user } = useAuth();
  const [cameraList, setCameraList] = useState([]);
  const [selectedCount, setSelectedCount] = useState(1);
  const [selectedCameras, setSelectedCameras] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Lấy danh sách camera từ backend
  useEffect(() => {
    if (!user) return;

    const fetchCameras = async () => {
      try {
        setLoading(true);
        const token = await user.getIdToken();
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/cameras`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Không thể tải danh sách camera");
        const data = await res.json();
        setCameraList(data);
        if (data.length > 0) setSelectedCameras([data[0]]);
      } catch (err) {
        console.error("❌ Lỗi tải camera:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCameras();
  }, [user]);

  const handleSelectLayout = (count) => {
    setSelectedCount(count);
    setSelectedCameras(cameraList.slice(0, count));
  };

  const handleSelectCamera = (cam) => {
    if (selectedCameras.find((c) => c.id === cam.id)) return;
    const newList = [...selectedCameras];
    if (newList.length >= selectedCount) newList.shift();
    newList.push(cam);
    setSelectedCameras(newList);
  };

  if (loading)
    return (
      <Layout>
        <div className="flex justify-center items-center h-[70vh] text-gray-500">
          Đang tải danh sách camera...
        </div>
      </Layout>
    );

  return (
    <Layout>
      <div className="flex h-[85vh] gap-4">
        {/* 🔹 Khu vực hiển thị camera */}
        <div className="flex-1 bg-gray-100 rounded-xl p-4 shadow-inner flex flex-col">
          <div className="flex justify-end gap-2 mb-3">
            {[1, 4, 9].map((n) => (
              <button
                key={n}
                onClick={() => handleSelectLayout(n)}
                className={`px-3 py-1 rounded-lg border transition-all ${
                  selectedCount === n
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white border-gray-300 hover:bg-gray-100"
                }`}
              >
                {n} view
              </button>
            ))}
          </div>

          {/* 🔹 Lưới hiển thị camera */}
          <div
            className={`grid gap-3 flex-1 ${
              selectedCount === 1
                ? "grid-cols-1"
                : selectedCount === 4
                ? "grid-cols-2"
                : "grid-cols-3"
            }`}
          >
            {selectedCameras.length === 0 ? (
              <div className="flex items-center justify-center text-gray-400 text-sm">
                Không có camera nào được chọn
              </div>
            ) : (
              selectedCameras.map((cam) => (
                <CameraView key={cam.id} cam={cam} />
              ))
            )}
          </div>
        </div>

        {/* 🔹 Sidebar danh sách camera */}
        <aside className="w-64 bg-white shadow-lg rounded-xl p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-3">📷 Camera của bạn</h2>
          {cameraList.length === 0 ? (
            <p className="text-gray-500 text-sm">Chưa có camera nào.</p>
          ) : (
            <ul className="space-y-2">
              {cameraList.map((cam) => (
                <li
                  key={cam.id}
                  onClick={() => handleSelectCamera(cam)}
                  className={`cursor-pointer border rounded-lg p-2 transition ${
                    selectedCameras.find((c) => c.id === cam.id)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <div className="font-medium">{cam.cameraName}</div>
                  <div className="text-xs text-gray-500">{cam.location}</div>
                  <div
                    className={`text-[10px] ${
                      cam.status === "active" || cam.status === true
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {cam.status === true ? "active" : cam.status}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </Layout>
  );
}uuuu

// =============================
// 🔹 Component hiển thị 1 camera (RTSP → WebSocket)
// =============================
function CameraView({ cam }) {
  const { user } = useAuth();
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    let player;

    const startStream = async () => {
      try {
        const token = await user.getIdToken();

        // 🔹 Gọi API backend để lấy wsUrl
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/stream/${cam.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Không lấy được wsUrl: ${res.status}`);

        const { wsUrl } = await res.json();
        const wsFullUrl = `${import.meta.env.VITE_API_URL.replace(/^http/, "ws")}${wsUrl}?token=${token}`;

        console.log("🔥 WS URL received:", wsFullUrl);

        // 🔹 Khởi tạo JSMpeg player
        // eslint-disable-next-line no-undef
        player = new JSMpeg.Player(wsFullUrl, {
          canvas: canvasRef.current,
          autoplay: true,
          audio: false,
        });

        console.log("✅ Stream started!");
      } catch (err) {
        console.error("❌ Stream error:", err);
      }
    };

    startStream();

    return () => {
      // Cleanup player khi unmount
      if (player && player.destroy) player.destroy();
    };
  }, [cam.id, user]);

  return (
    <div className="relative bg-black rounded-lg overflow-hidden shadow-lg">
      <canvas ref={canvasRef} className="w-full h-full object-cover" />
      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 text-center">
        <div className="font-semibold">{cam.cameraName}</div>
        <div>{cam.location}</div>
      </div>
    </div>
  );
}
