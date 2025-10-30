import Navbar from "./Navbar";

export default function Layout({ children }) {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-sky-50 via-indigo-50 to-pink-50">
            {/* Thanh điều hướng cố định trên cùng */}
            <Navbar />

            {/* Nội dung chính */}
            <main className="flex-1 container mx-auto px-6 py-10">
                {children}
            </main>

            {/* Chân trang */}
            <footer className="text-center py-4 text-gray-500 text-sm border-t border-gray-200">
                © 2025 RabbitFire — Intelligent Fire & Smoke Detection
            </footer>
        </div>
    );
}
