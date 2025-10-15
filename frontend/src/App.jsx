import { Route, Routes, useLocation } from "react-router-dom"
import HomePage from "./pages/HomePage"
import Hub from "./pages/HubPage/Hub"
import Navbar from "./components/Navbar"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"

function App() {
	const location = useLocation();
	const hideNavbarRoutes = ['/login', '/register'];
	const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

	return (
		<>
			{shouldShowNavbar && <Navbar />}
			<Routes>
				<Route path="/" element={<HomePage />}></Route>
				<Route path="/hub" element={<Hub />}></Route>
				<Route path="/login" element={<LoginPage />}></Route>
				<Route path="/register" element={<RegisterPage/>}></Route>
			</Routes>
		</>
	)
}

export default App
