import { Route, Routes, useLocation } from "react-router-dom"
import HomePage from "./pages/HomePage"
import Hub from "./pages/hub_pages/Hub"
import Account from "./pages/hub_pages/Account"
import Settings from "./pages/hub_pages/Settings"
import Navbar from "./components/Navbar"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import PublicRoute from "./components/PublicRoute"
import ProtectedRoute from "./components/ProtectedRoute"

function App() {
	const location = useLocation();
	const hideNavbarRoutes = ['/login', '/register'];
	const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

	return (
		<>
			{shouldShowNavbar && <Navbar />}
			<Routes>
				<Route path="/" element={<HomePage />}></Route>
				<Route element={<PublicRoute />}>
					<Route path="/login" element={<LoginPage />}></Route>
					<Route path="/register" element={<RegisterPage />}></Route>
				</Route>	
				<Route element={<ProtectedRoute />}>
					<Route path="/hub" element={<Hub />}></Route>
					<Route path="/hub/account" element={<Account />}></Route>
					<Route path="/hub/settings" element={<Settings />}></Route>
				</Route>
			</Routes>
		</>
	)
}

export default App
