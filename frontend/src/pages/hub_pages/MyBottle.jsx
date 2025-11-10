import { useState } from "react";
import { Link } from "react-router-dom";

export default function MyBottle() {
    // There is no implementation of saving the state across pages yet. TBC
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

    const [connectedBottle, setConnectedBottle] = useState(false)
    const [connecting, setConnecting] = useState(false)
    const [error, setError] = useState(null)
    const [bottleName, setBottleName] = useState("")

    const handleConnectBottle = async () => {
        setError(null)
        setConnecting(true)
        try {
            const res = await fetch(`${API_URL}/api/user/water_bottle`, {
                credentials: "include",
            })
            const data = await res.json()
            setTimeout(() => {
                if (!res.ok || !data.success) {
                    setError("Something went wrong.. Please try again!")
                } else {
                    setConnectedBottle(true)
                    setBottleName(data.bottleName)
                }   
                setConnecting(false)
            }, 3000)
        } catch (error) {
            setError("Something went wrong.. Please try again!")
        }
    };

    const handleDisconnectBottle = () => {
        setConnectedBottle(false)
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4">
            {!connectedBottle ? (
                <div className="flex flex-col items-center gap-4">
                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6">
                            <div className="flex">
                                <svg className="h-5 w-5 text-red-400 dark:text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm">{error}</span>
                            </div>
                        </div>
                    )}
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        You are not connected to a bottle.
                    </p>
                    <button
                        onClick={handleConnectBottle}
                        disabled={connecting}
                        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:bg-blue-400 transition-all duration-300"
                    >
                        {connecting ? "Connecting..." : "Connect Bottle"}
                    </button>
                </div>
            ) : (
                <div className="w-full max-w-sm p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200/40 dark:border-slate-700/40">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                {bottleName}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Status: Active
                            </p>
                        </div>
                        <div className="relative flex items-center">
                            <span className="absolute w-3 h-3 bg-green-500 rounded-full animate-ping"></span>
                            <span className="relative w-3 h-3 bg-green-500 rounded-full"></span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Link
                            to="/my-bottle"
                            className="block w-full px-4 py-3 text-center bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-all duration-300"
                        >
                            View My Bottle
                        </Link>
                        <button
                            onClick={handleDisconnectBottle}
                            className="w-full px-4 py-3 text-center bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75 dark:bg-slate-700 dark:text-gray-200 dark:hover:bg-slate-600 transition-all duration-300"
                        >
                            Disconnect
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
