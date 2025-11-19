import { useState, useEffect, forwardRef, useImperativeHandle } from "react"

const Bottle = forwardRef(({ onConnectionChange }, ref) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

    const [connectedBottle, setConnectedBottle] = useState(false)
    const [connecting, setConnecting] = useState(false)
    const [checkingConnection, setCheckingConnection] = useState(true)
    const [error, setError] = useState(null)
    const [bottleName, setBottleName] = useState("")
    const [showAddBottleModal, setShowAddBottleModal] = useState(false)
    const [newBottleName, setNewBottleName] = useState("")
    const [addingBottle, setAddingBottle] = useState(false)

    // Daily intake data
    const [dailyGoal, setDailyGoal] = useState(2000) // ml
    const [currentIntake, setCurrentIntake] = useState(0) // ml
    const [loadingIntake, setLoadingIntake] = useState(true)
    const intakePercentage = Math.round((currentIntake / dailyGoal) * 100)
    // Water level is capped at 100% to prevent overflow visualization
    const waterLevel = Math.min(intakePercentage, 100)

    // Get current date
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    // Function to fetch bottle data (name and goal)
    const fetchBottleData = async () => {
        try {
            const res = await fetch(`${API_URL}/api/user/water_bottle`, {
                credentials: "include",
            })
            const data = await res.json()
            if (res.ok && data.success) {
                setBottleName(data.bottleName)
                setDailyGoal(data.goal)
            }
            
            // Also fetch today's intake to recalculate water level
            const intakeRes = await fetch(`${API_URL}/api/user/water_bottle/intake/today`, {
                credentials: "include",
            })
            const intakeData = await intakeRes.json()
            if (intakeRes.ok && intakeData.success) {
                setCurrentIntake(intakeData.totalIntake)
            }
        } catch (err) {
            console.error("Error fetching bottle data:", err)
        }
    }

    // Expose refresh function to parent via ref
    useImperativeHandle(ref, () => ({
        refreshBottleData: fetchBottleData
    }))

    // Check if bottle exists and auto-connect on component mount
    useEffect(() => {
        const checkAndConnectBottle = async () => {
            setCheckingConnection(true)
            try {
                const res = await fetch(`${API_URL}/api/user/water_bottle`, {
                    credentials: "include",
                })
                const data = await res.json()
                
                if (res.ok && data.success) {
                    // Bottle exists, auto-connect
                    setConnectedBottle(true)
                    setBottleName(data.bottleName || "My H2Now Bottle")
                    setDailyGoal(data.goal)
                }
                // If bottle doesn't exist, stay in disconnected state
            } catch (error) {
                console.error("Failed to check bottle connection:", error)
            } finally {
                setCheckingConnection(false)
            }
        }

        const fetchTodayIntake = async () => {
            try {
                const res = await fetch(`${API_URL}/api/user/water_bottle/intake/today`, {
                    credentials: "include",
                })
                const data = await res.json()
                if (res.ok && data.success) {
                    setCurrentIntake(data.totalIntake)
                }
            } catch (error) {
                console.error("Failed to fetch intake data:", error)
            } finally {
                setLoadingIntake(false)
            }
        }

        checkAndConnectBottle()
        fetchTodayIntake()
    }, [])

    // Notify parent component when bottle connection state changes
    useEffect(() => {
        if (onConnectionChange) {
            onConnectionChange(connectedBottle)
        }
    }, [connectedBottle, onConnectionChange])

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
                    setShowAddBottleModal(true)
                    setConnecting(false)
                } else {
                    setConnectedBottle(true)
                    setBottleName(data.bottleName || "My H2Now Bottle")
                    setConnecting(false)
                }
            }, 1500)
        } catch (error) {
            setTimeout(() => {
                setError("Something went wrong.. Please try again!")
                setConnecting(false)
            }, 1500)
        }
    }

    const handleAddNewBottle = async () => {
        if (!newBottleName.trim()) {
            setError("Please enter a bottle name")
            return
        }

        setShowAddBottleModal(false)
        setNewBottleName("")
        setError(null)
    }

    const handleDisconnectBottle = () => {
        setConnectedBottle(false)
        setBottleName("")
    }

    return (
        <>
            {/* Add Bottle Modal */}
            <div className={`
                fixed inset-0 bg-black/60 flex items-center justify-center z-50 transition-opacity duration-250
                ${showAddBottleModal ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
            `}>
                <div className="w-[350px] bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/40 dark:border-slate-700/40">
                    <h3 className="text-[24px] font-bold text-gray-900 dark:text-gray-100 mb-2">No Bottle Found</h3>
                    <p className="text-[14px] text-gray-600 dark:text-gray-400 mb-6">
                        Would you like to connect a new bottle? Enter a name for your bottle below.
                    </p>

                    {error && (
                        <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-3 py-2 rounded-lg">
                            <div className="flex items-start">
                                <svg className="h-5 w-5 text-red-400 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm">{error}</span>
                            </div>
                        </div>
                    )}

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Bottle Name
                        </label>
                        <input
                            type="text"
                            value={newBottleName}
                            onChange={(e) => setNewBottleName(e.target.value)}
                            placeholder="e.g., My H2Now Bottle"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={addingBottle}
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                setShowAddBottleModal(false)
                                setNewBottleName("")
                                setError(null)
                            }}
                            disabled={addingBottle}
                            className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg transition-all duration-200 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAddNewBottle}
                            disabled={addingBottle}
                            className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            {addingBottle ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Adding...</span>
                                </>
                            ) : (
                                "Add Bottle"
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottle and Overview - Side by Side */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full max-w-5xl">

                {/* Daily Goal Overview */}
                <div className="w-[320px] bg-white/80 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/40 dark:border-slate-700/40 p-5">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-[16px] font-semibold text-gray-900 dark:text-gray-100">Today's Goal</h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{today}</span>
                    </div>

                    {loadingIntake ? (
                        <div className="flex items-center justify-center py-8">
                            <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[24px] font-bold text-blue-600 dark:text-blue-400">
                                    {currentIntake}ml
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">of {dailyGoal}ml</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[24px] font-bold text-gray-700 dark:text-gray-300">
                                    {intakePercentage}%
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {dailyGoal - currentIntake > 0 ? `${dailyGoal - currentIntake}ml to go` : 'Goal reached! 🎉'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottle Name Section */}
                {connectedBottle && (bottleName || "My H2Now Bottle") && (
                    <div className="px-4 py-2 bg-blue-100 dark:bg-blue-900/40 
                    text-blue-600 dark:text-blue-300 
                    rounded-xl font-semibold shadow-sm">
                        {bottleName || "My H2Now Bottle"}
                    </div>
                )}


                {/* Bottle Visualization Section */}
                <div className="flex flex-col items-center">
                    {checkingConnection ? (
                        // Checking Connection State
                        <div className="flex flex-col items-center gap-6">
                            <div className="w-[200px] h-[280px] flex items-center justify-center">
                                <svg className="animate-spin h-12 w-12 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                            <p className="text-[16px] font-medium text-gray-600 dark:text-gray-300">
                                Checking connection...
                            </p>
                        </div>
                    ) : !connectedBottle ? (
                        // Not Connected State
                        <div className="flex flex-col items-center gap-6">
                            {/* Bottle Icon (Empty/Disconnected) */}
                            <div className="w-[200px] h-[280px] relative">
                                <svg viewBox="0 0 200 280" className="w-full h-full">
                                    {/* Bottle Cap */}
                                    <rect x="70" y="10" width="60" height="30" rx="4"
                                        className="fill-gray-300 dark:fill-gray-600 stroke-gray-400 dark:stroke-gray-500" strokeWidth="2" />

                                    {/* Bottle Neck */}
                                    <path d="M 80 40 L 80 70 L 50 90 L 50 250 C 50 265 65 270 100 270 C 135 270 150 265 150 250 L 150 90 L 120 70 L 120 40 Z"
                                        className="fill-gray-200/50 dark:fill-gray-700/50 stroke-gray-300 dark:stroke-gray-600" strokeWidth="3" />
                                </svg>

                                {/* Disconnected Icon Overlay */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-16 h-16 rounded-full bg-gray-300/80 dark:bg-gray-700/80 backdrop-blur-sm flex items-center justify-center">
                                        <svg className="w-8 h-8 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <p className="text-[20px] font-semibold text-gray-700 dark:text-gray-200 text-center px-4">
                                No Bottle Connected
                            </p>

                            {error && (
                                <div className="w-[293px] bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
                                    <div className="flex items-start">
                                        <svg className="h-5 w-5 text-red-400 dark:text-red-400 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-sm">{error}</span>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleConnectBottle}
                                disabled={connecting}
                                className="w-[200px] h-[50px] bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white font-semibold rounded-lg shadow-md transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                {connecting ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Connecting...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        <span>Connect Bottle</span>
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        // Connected State
                        <div className="flex flex-col items-center gap-6">
                            {/* Bottle Visualization with Water Level */}
                            <div className="w-[200px] h-[280px] relative">
                                <svg viewBox="0 0 200 280" className="w-full h-full">
                                    {/* Bottle Cap */}
                                    <rect x="70" y="10" width="60" height="30" rx="4"
                                        className="fill-blue-400 dark:fill-blue-500 stroke-blue-500 dark:stroke-blue-600" strokeWidth="2" />

                                    {/* Bottle Outline */}
                                    <path d="M 80 40 L 80 70 L 50 90 L 50 250 C 50 265 65 270 100 270 C 135 270 150 265 150 250 L 150 90 L 120 70 L 120 40 Z"
                                        className="fill-white/30 dark:fill-slate-700/30 stroke-blue-400 dark:stroke-blue-500" strokeWidth="3" />

                                    {/* Water Level */}
                                    <defs>
                                        <clipPath id="bottleClip">
                                            <path d="M 80 40 L 80 70 L 50 90 L 50 250 C 50 265 65 270 100 270 C 135 270 150 265 150 250 L 150 90 L 120 70 L 120 40 Z" />
                                        </clipPath>
                                    </defs>
                                    <rect
                                        x="50"
                                        y={270 - (waterLevel / 100 * 230)}
                                        width="100"
                                        height={(waterLevel / 100 * 230)}
                                        className="fill-blue-400/60 dark:fill-blue-500/60"
                                        clipPath="url(#bottleClip)"
                                    />

                                    {/* Water Surface Wave */}
                                    <path
                                        d={`M 50 ${270 - (waterLevel / 100 * 230)} Q 75 ${270 - (waterLevel / 100 * 230) - 3} 100 ${270 - (waterLevel / 100 * 230)} T 150 ${270 - (waterLevel / 100 * 230)}`}
                                        className="fill-none stroke-blue-500 dark:stroke-blue-400"
                                        strokeWidth="2"
                                        clipPath="url(#bottleClip)"
                                    />

                                    {/* Shine effect */}
                                    <ellipse cx="75" cy="140" rx="15" ry="40"
                                        className="fill-white/30 dark:fill-white/20" />
                                </svg>

                                {/* Connected Status Indicator */}
                                <div className="absolute top-2 right-2 flex items-center gap-1">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                    </span>
                                </div>

                                {/* Water Level Percentage */}
                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                                    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-3 py-1 rounded-full border border-blue-200 dark:border-blue-700">
                                        <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{waterLevel}%</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
})

Bottle.displayName = 'Bottle'

export default Bottle
