import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function PublicRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;
    if (user) return <Navigate to="/dashboard" replace />;
    return children;
}
