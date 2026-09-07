import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const withAuth = (WrappedComponent) => {
    const AuthComponent = (props) => {
        const router = useNavigate();
        const location = useLocation();
        const isAuthenticated = Boolean(localStorage.getItem("token"));

        useEffect(() => {
            if (!isAuthenticated) {
                router("/auth", {
                    replace: true,
                    state: { from: `${location.pathname}${location.search}${location.hash}` }
                });
            }
        }, [isAuthenticated, location, router]);

        return isAuthenticated ? <WrappedComponent {...props} /> : null;
    };

    return AuthComponent;
};

export default withAuth;
