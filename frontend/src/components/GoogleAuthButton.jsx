import { useState } from "react";

function GoogleAuthButton({ text }) {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleGoogleAuth = async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${API_URL}/auth/login/google`, {
                credentials: "include"
            });
            const data = await res.json();

            if (!res.ok || !data.url) {
                setError(data.message || "Something went wrong.. Please try again!");
            } else {
                window.location.href = data.url
            }
        } catch (error) {
            alert("Something went wrong.. Please try again!");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <button 
                onClick={handleGoogleAuth} 
                disabled={loading}
                className="flex items-center justify-center gap-3 px-6 py-3 w-full
                           bg-white border border-gray-300 rounded-lg
                           font-medium text-sm text-gray-700
                           hover:bg-gray-50 hover:border-gray-400 hover:shadow-md hover:cursor-pointer
                           active:bg-gray-100 active:shadow-sm
                           disabled:opacity-70 disabled:cursor-not-allowed disabled:bg-gray-50
                           transition-all duration-200 ease-in-out
                           shadow-sm"
            >
                {loading ? (
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                        <span>Loading...</span>
                    </div>
                ) : (
                    <>
                        <img
                            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                            alt="Google"
                            className="w-5 h-5"
                        />
                        <span>{text}</span>
                    </>
                )}
            </button>
        </div>
    )
}

export default GoogleAuthButton;