import { Route, Routes, useLocation } from "react-router-dom"
import HomePage from "./pages/HomePage"
import Navbar from "./components/Navbar"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import InterfacePage from "./pages/InterfacePage"
import ProtectedRoute from "./components/ProtectedRoute"
import PublicRoute from "./components/PublicRoute"

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
					<Route path="/water-bottle" element={<InterfacePage />}></Route>
				</Route>
			</Routes>
		</>
	)
}

export default App
