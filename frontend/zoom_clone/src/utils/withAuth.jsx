import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

const withAuth = (WrappedComponent) => {
    const AuthComponent = (props) => {
        const navigate = useNavigate();
        const location = useLocation();
        const { isLoaded, isSignedIn } = useAuth();
        const [isReady, setIsReady] = useState(false);

        useEffect(() => {
            if (!isLoaded) return;
            
            const isAdmin = sessionStorage.getItem("admin_authenticated") === "true";
            const hasAuth = isSignedIn || isAdmin;

            if (!hasAuth) {
                navigate(`/auth?redirect=${encodeURIComponent(location.pathname + location.search)}`, { replace: true });
                return;
            }
            setIsReady(true);
        }, [isLoaded, isSignedIn, location, navigate]);

        if (!isReady) {
            return null;
        }

        return <WrappedComponent {...props} />;
    };

    return AuthComponent;
};

export default withAuth;
