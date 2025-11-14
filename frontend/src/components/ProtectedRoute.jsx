import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute() {
    const [isChecking, setIsChecking] = useState(true);
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        // prevents state updates if component is unmounted (user navigates away before it fetches the session)
        let isMounted = true;
        const checkAuth = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/auth/check_session", {
                    credentials: "include",
                })
                const data = await res.json();
                if (isMounted) {
                    setAuthorized(!!data.logged_in);
                }
            } catch {
                if (isMounted) setAuthorized(false);
            } finally {
                if (isMounted) setIsChecking(false);
            }
        }
        checkAuth();

        return () => {
            isMounted = false;
        }
    }, [])

    // pause rendering until user is authorized
    if (isChecking) return <div>Loading...</div>
    // renders nested protected routes(<Outlet/>), replace prevents user from going back(using the back button)
    return authorized ? <Outlet/> : <Navigate to="/login" replace/>
}

export default ProtectedRoute;