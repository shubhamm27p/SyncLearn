import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const withAuth = (WrappedComponent) => {
    const AuthComponent = (props) => {
        const navigate = useNavigate();
        const location = useLocation();
        const [isReady, setIsReady] = useState(false);

        useEffect(() => {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");
            const storedUser = localStorage.getItem("currentUser") || localStorage.getItem("user") || sessionStorage.getItem("user");
            const isAdmin = sessionStorage.getItem("admin_authenticated") === "true";

            const hasAuth = Boolean((token && storedUser) || isAdmin);

            if (!hasAuth) {
                navigate(`/auth?redirect=${encodeURIComponent(location.pathname + location.search)}`, { replace: true });
                return;
            }
            setIsReady(true);
        }, [location]);

        if (!isReady) {
            return null;
        }

        return <WrappedComponent {...props} />;
    };

    return AuthComponent;
};

export default withAuth;
