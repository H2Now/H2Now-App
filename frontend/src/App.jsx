import { Route, Routes } from "react-router-dom"
import HomePage from "./pages/HomePage"
import Navbar from "./components/Navbar"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"

function App() {
	return (
		<>
			<Navbar />
			<Routes>
				<Route path="/" element={<HomePage />}></Route>
				<Route path="/login" element={<LoginPage />}></Route>
				<Route path="/register" element={<RegisterPage/>}></Route>
			</Routes>
		</>
	)
}

export default App
