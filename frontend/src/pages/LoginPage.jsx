import { useState } from "react"

function LoginPage() {
    // TBC: display a modal containing data.message
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError(null)
        setLoading(true);
        try {
            const res = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            })
            const data = await res.json();

            if (!data.success) {
                setError(data.message);
            } else {
                console.log("Login successfully!")
            }
        } catch (error) {
            alert("Something went wrong. Please try again.", error);
        } finally {
            setLoading(false);
        }
    }
    return (
        <div>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleLoginSubmit}>
                <div>
                    <label htmlFor="email">Email</label><br />
                    <input
                        className="w-[400px] border-1 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        id="email"
                        type="email"
                        name="email"
                        autoComplete="off"
                        placeholder="Enter you email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password">Password</label><br />
                    <input
                        className="w-[400px] border-1 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="password"
                        autoComplete="off"
                        name="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button className="border" type="submit" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
            </form>
        </div>
    )
}

export default LoginPage