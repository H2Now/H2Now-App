import { useState } from "react";

function RegisterPage() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleRegisterSubmit = async (e) => {
        setErrors({});
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("http://localhost:5000/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password }),
            })
            const data = await res.json();

            if (!data.success) {
                setErrors(data.errors);
            } else {
                console.log("Register successfully!")
            }
        } catch (error) {
            alert("Something went wrong. Please try again.", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <form onSubmit={handleRegisterSubmit}>
                <div>
                    <label htmlFor="name">Username</label><br />
                    {errors.username && <p className="error">{errors.username}</p>}
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
                    {errors.email && <p className="error">{errors.email}</p>}
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
                    {errors.password && <p className="error">{errors.password}</p>}
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