import { useState } from "react"

function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json"},
                body: JSON.stringify({ email, password}),
            })
            if (!res.ok) throw new Error("Login failed");
            const data = await res.json();

            console.log("Logged in: ", data.user);
            console.log(data.message);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }
    return (
        <div>
            {error && <p>{error}</p>}
            <form onSubmit={handleLoginSubmit}>
                <input
                    type="email"
                    name="email"
                    autoComplete="off"
                    placeholder="Enter you email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    autoComplete="off"
                    name="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit" disabled={loading}>Submit</button>
            </form>
        </div>
    )
}

export default LoginPage