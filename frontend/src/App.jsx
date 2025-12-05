import { useEffect } from "react"
import { Route, Routes } from "react-router-dom"
import HomePage from "./pages/HomePage"
import Hub from "./pages/hub_pages/Hub"
import Account from "./pages/hub_pages/Account"
import Reminders from "./pages/Reminders"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import PublicRoute from "./components/PublicRoute"
import ProtectedRoute from "./components/ProtectedRoute"

function App() {

	// Apply preferred mode on initial load
	useEffect(() => {
		const darkMode = localStorage.getItem('darkMode')
		if (darkMode && JSON.parse(darkMode)) {
			document.documentElement.classList.add('dark')
		} else {
			document.documentElement.classList.remove('dark')
		}
	}, [])

	return (
		<>
			<Routes>
				<Route path="/" element={<HomePage />}></Route>
				<Route element={<PublicRoute />}>
					<Route path="/login" element={<LoginPage />}></Route>
					<Route path="/register" element={<RegisterPage />}></Route>
				</Route>
				<Route element={<ProtectedRoute />}>
					<Route path="/hub" element={<Hub />}></Route>
					<Route path="/hub/account" element={<Account />}></Route>
					<Route path="/reminders" element={<Reminders />}></Route>
				</Route>
			</Routes>
		</>
	)
}

export default App
