import { useState } from "react";

function RegisterPage() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const res = await fetch("http://localhost:5000/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password }),
            })
            const data = await res.json();

            if (!res.ok || !data.success) {
                setError(data.message || "Something went wrong.. Please try again!");
            } else {
                console.log("Register successfully!")
            }
        } catch (error) {
            alert("Something went wrong.. Please try again!");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            {error && <p>{error}</p>}
            <form onSubmit={handleRegisterSubmit}>
                <div>
                    <label htmlFor="name">Username</label><br />
                    <input
                        className="w-[400px] border-1 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="text"
                        name="name"
                        autoComplete="off"
                        placeholder="Enter you username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="email">Email</label><br />
                    <input
                        className="w-[400px] border-1 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        name="password"
                        autoComplete="off"
                        placeholder="Enter a strong password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button className="border" type="submit" disabled={loading}>{loading ? "Registering..." : "Register"}</button>
            </form>
        </div>
    )
}

export default RegisterPage;