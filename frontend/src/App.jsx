import { Route, Routes } from "react-router-dom"
import HomePage from "./pages/HomePage"
import Hub from "./pages/HubPage/Hub"
import Navbar from "./components/Navbar"

function App() {
	return (
		<>
			<Navbar />
			<Routes>
				<Route path="/" element={<HomePage />}></Route>
				<Route path="/hub" element={<Hub />}></Route>
			</Routes>
		</>
	)
}

export default App
