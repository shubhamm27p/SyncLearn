import { useEffect, useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../contents/AuthContents";

const withAuth = (WrappedComponent) => {
    const AuthComponent = (props) => {
        const navigate = useNavigate();
        const location = useLocation();
        const { isAuthReady } = useContext(AuthContext);
        const [isReady, setIsReady] = useState(false);

        useEffect(() => {
            if (!isAuthReady) return; // Wait for global auth synchronization

            const token = localStorage.getItem("token") || sessionStorage.getItem("token");
            const storedUser = localStorage.getItem("currentUser") || localStorage.getItem("user") || sessionStorage.getItem("user");
            const isAdmin = sessionStorage.getItem("admin_authenticated") === "true";

            if (token || isAdmin) {
                setIsReady(true);
            } else {
                navigate(`/auth?redirect=${encodeURIComponent(location.pathname + location.search)}`, { replace: true });
            }
        }, [isAuthReady, location, navigate]);

        if (!isReady) {
            return null;
        }

        return <WrappedComponent {...props} />;
    };

    return AuthComponent;
};

export default withAuth;
