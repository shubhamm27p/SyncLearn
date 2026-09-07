import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const withAuth = (WrappedComponent) => {
    const AuthComponent = (props) => {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const storedUser = localStorage.getItem("currentUser") || localStorage.getItem("user") || sessionStorage.getItem("user");
        const isAdmin = sessionStorage.getItem("admin_authenticated") === "true";

        const isAuthenticated = Boolean(token || storedUser || isAdmin);

        useEffect(() => {
            if (!isAuthenticated) {
                const guestToken = `guest-${Math.random().toString(36).substring(2, 10)}`;
                const guestUser = {
                    id: `guest-${Math.random().toString(36).substring(2, 8)}`,
                    username: `Guest_${Math.floor(1000 + Math.random() * 9000)}`,
                    name: `Guest User`,
                    role: "student"
                };
                localStorage.setItem("token", guestToken);
                localStorage.setItem("currentUser", JSON.stringify(guestUser));
                localStorage.setItem("userRole", "student");
            }
        }, [isAuthenticated]);

        return <WrappedComponent {...props} />;
    };

    return AuthComponent;
};

export default withAuth;
