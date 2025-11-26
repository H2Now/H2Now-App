import { useState, useEffect, forwardRef, useImperativeHandle } from "react"
// import usePubNub from "../../hooks/usePubNub"

const LoadingSpinner = ({ size = "h-8 w-8", color = "text-blue-500" }) => (
    <svg className={`animate-spin ${size} ${color}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
)

const ErrorMessage = ({ message }) => (
    <div className="w-[293px] bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
        <div className="flex items-start">
            <svg className="h-5 w-5 text-red-400 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">{message}</span>
        </div>
    </div>
)

const LoadingSpinner = ({ size = "h-8 w-8", color = "text-blue-500" }) => (
    <svg className={`animate-spin ${size} ${color}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
)

const ErrorMessage = ({ message }) => (
    <div className="w-[293px] bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
        <div className="flex items-start">
            <svg className="h-5 w-5 text-red-400 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">{message}</span>
        </div>
    </div>
)

const Bottle = forwardRef(({ onConnectionChange }, ref) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

    const [userId, setUserId] = useState(null)
    const [hasBottleInDB, setHasBottleInDB] = useState(false)
    const [checkingDatabase, setCheckingDatabase] = useState(true)
    const [isPiOnline, setIsPiOnline] = useState(false)

    const { bottleConnected: pubnubStatus, latestIntake } = usePubNub(userId)

    const [error, setError] = useState(null)
    const [bottleName, setBottleName] = useState("")
    const [showAddBottleModal, setShowAddBottleModal] = useState(false)
    const [newBottleId, setNewBottleId] = useState("")
    const [addingBottle, setAddingBottle] = useState(false)
    const [bottleIdVerified, setBottleIdVerified] = useState(false)
    const [newBottleName, setNewBottleName] = useState("")
    const [newGoal, setNewGoal] = useState("2000")

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

    // Handle real-time updates from PubNub
    useEffect(() => {
        setIsPiOnline(pubnubStatus)
        if (latestIntake) {
            setCurrentIntake(latestIntake.total)
        }
    }, [pubnubStatus, latestIntake])

    // Function to fetch bottle data (name and goal)
    const fetchBottleData = async () => {
        try {
            const res = await fetch(`${API_URL}/user/water_bottle`, {
                credentials: "include",
            })
            const data = await res.json()
            if (res.ok && data.success) {
                setBottleName(data.bottleName)
                setDailyGoal(data.goal)
                setIsPiOnline(data.connected || false)
            }

            // Also fetch today's intake to recalculate water level
            const intakeRes = await fetch(`${API_URL}/user/water_bottle/intake/today`, {
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

    // On mount: Get userID and check if bottle exists in DB
    useEffect(() => {
        const initialize = async () => {
            setCheckingDatabase(true)
            try {
                // get userID for pubnub
                const userRes = await fetch(`${API_URL}/user`, {
                    credentials: "include",
                })
                const userData = await userRes.json()

                if (userRes.ok && userData.success) {
                    setUserId(userData.user.id)
                }
                // get bottle data
                const bottleRes = await fetch(`${API_URL}/user/water_bottle`, {
                    credentials: "include",
                })
                const bottleData = await bottleRes.json()

                if (bottleRes.ok && bottleData.success) {
                    setHasBottleInDB(true)
                    setBottleName(bottleData.bottleName)
                    setDailyGoal(bottleData.goal)
                    setIsPiOnline(bottleData.connected || false)
                } else {
                    setHasBottleInDB(false)
                }
            } catch (error) {
                console.error("Failed to check bottle connection:", error)
                setHasBottleInDB(false)
            } finally {
                setCheckingDatabase(false)
            }
        }

        const fetchTodayIntake = async () => {
            try {
                const res = await fetch(`${API_URL}/user/water_bottle/intake/today`, {
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

        initialize()
        fetchTodayIntake()
    }, [])

    // Notify parent component when bottle exists
    useEffect(() => {
        if (onConnectionChange) {
            onConnectionChange(hasBottleInDB)
        }
    }, [hasBottleInDB, onConnectionChange])

    const handleVerifyBottleId = async () => {
        if (!newBottleId.trim()) {
            setError("Please enter a bottle ID")
            return
        }

        setAddingBottle(true)
        setError(null)

        try {
            // Check if bottle ID exists
            const response = await fetch(
                `${API_URL}/water_bottle?bottleID=${encodeURIComponent(newBottleId)}`,
                { credentials: "include" }
            )
            console.log(newBottleId)
            const data = await response.json()
            
            if (response.ok && data.success) {
                console.log("Bottle ID verified:", data)
                setBottleIdVerified(true)
            } else {
                setError(data.message || "Bottle ID not found")
            }
        } catch (error) {
            console.error("Error checking bottle:", error)
            setError("Failed to verify bottle ID")
        } finally {
            setAddingBottle(false)
        }
    }

    const handleAddNewBottle = async () => {
        if (!newBottleName.trim()) {
            setError("Please enter a bottle name")
            return
        }
        
        if (!newGoal || parseFloat(newGoal) <= 0) {
            setError("Please enter a valid daily goal")
            return
        }

        setAddingBottle(true)
        setError(null)

        try {
            const response = await fetch(`${API_URL}/user/water_bottle/register`, {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    bottleID: newBottleId,
                    bottleName: newBottleName.trim(),
                    goal: parseFloat(newGoal)
                })
            })

            const data = await response.json()

            if (response.ok && data.success) {
                // Successfully registered bottle
                setShowAddBottleModal(false)
                resetModal()
                
                // Refresh the page to show the newly registered bottle
                window.location.reload()
            } else {
                setError(data.message || "Failed to register bottle")
            }
        } catch (error) {
            console.error("Error registering bottle:", error)
            setError("Failed to register bottle")
        } finally {
            setAddingBottle(false)
        }
    }

    const resetModal = () => {
        setNewBottleId("")
        setNewBottleName("")
        setNewGoal("2000")
        setBottleIdVerified(false)
        setError(null)
    }

    const handleCloseModal = () => {
        setShowAddBottleModal(false)
        resetModal()
    }

    return (
        <>
            {/* Add Bottle Modal */}
            <div className={`
                fixed inset-0 bg-black/60 flex items-center justify-center z-50 transition-opacity duration-250 px-4
                ${showAddBottleModal ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
            `}>
                <div className="w-full max-w-[420px] lg:max-w-[480px] bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 lg:p-8 shadow-lg border border-gray-200/40 dark:border-slate-700/40">
                    <h3 className="text-[24px] font-bold text-gray-900 dark:text-gray-100 mb-2">
                        {bottleIdVerified ? "Setup Your Bottle" : "Add New Bottle"}
                    </h3>
                    <p className="text-[14px] text-gray-600 dark:text-gray-400 mb-6">
                        {bottleIdVerified 
                            ? "Enter a name for your bottle and set your daily hydration goal."
                            : "Enter the ID found underneath the device to register your H2Now bottle."
                        }
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

                    {!bottleIdVerified ? (
                        // Step 1: Enter Bottle ID
                        <>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Bottle ID
                                </label>
                                <input
                                    type="text"
                                    value={newBottleId}
                                    onChange={(e) => setNewBottleId(e.target.value)}
                                    placeholder="Enter bottle ID"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    disabled={addingBottle}
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleCloseModal}
                                    disabled={addingBottle}
                                    className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg transition-all duration-200 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleVerifyBottleId}
                                    disabled={addingBottle}
                                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                                >
                                    {addingBottle ? (
                                        <>
                                            <LoadingSpinner size="h-4 w-4" color="text-white" />
                                            <span>Verifying...</span>
                                        </>
                                    ) : (
                                        "Next"
                                    )}
                                </button>
                            </div>
                        </>
                    ) : (
                        // Step 2: Enter Bottle Name and Goal
                        <>
                            <div className="mb-4">
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

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Daily Goal (ml)
                                </label>
                                <input
                                    type="number"
                                    value={newGoal}
                                    onChange={(e) => setNewGoal(e.target.value)}
                                    placeholder="2000"
                                    min="1"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    disabled={addingBottle}
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setBottleIdVerified(false)
                                        setError(null)
                                    }}
                                    disabled={addingBottle}
                                    className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg transition-all duration-200 disabled:opacity-50"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleAddNewBottle}
                                    disabled={addingBottle}
                                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                                >
                                    {addingBottle ? (
                                        <>
                                            <LoadingSpinner size="h-4 w-4" color="text-white" />
                                            <span>Registering...</span>
                                        </>
                                    ) : (
                                        "Register Bottle"
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Bottle and Overview - Responsive Layout */}
            <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-12 w-full max-w-7xl">

                {/* Daily Goal Overview */}
                <div className="w-full max-w-[380px] lg:w-[420px] bg-white/80 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/40 dark:border-slate-700/40 p-6 lg:p-8">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-gray-100">Today's Goal</h3>
                        <span className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">{today}</span>
                    </div>

                    {loadingIntake ? (
                        <div className="flex items-center justify-center py-12">
                            <LoadingSpinner size="h-10 w-10" />
                        </div>
                    ) : (
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-3xl lg:text-4xl font-bold text-blue-600 dark:text-blue-400">
                                    {currentIntake}ml
                                </p>
                                <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 mt-1">of {dailyGoal}ml</p>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl lg:text-4xl font-bold text-gray-700 dark:text-gray-300">
                                    {intakePercentage}%
                                </p>
                                <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 mt-1">
                                    {dailyGoal - currentIntake > 0 ? `${dailyGoal - currentIntake}ml to go` : 'Goal reached! 🎉'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottle Visualization Section with Name */}
                <div className="flex flex-col items-center gap-5">
                    {/* Bottle Name Badge - Only show when bottle exists */}
                    {hasBottleInDB && bottleName && (
                        <div className="px-5 py-2.5 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/40 
                        text-blue-700 dark:text-blue-300 
                        rounded-xl font-semibold shadow-sm text-base lg:text-lg border border-blue-200/50 dark:border-blue-700/50">
                            {bottleName}
                        </div>
                    )}

                    {checkingDatabase ? (
                        // Checking Connection State
                        <div className="flex flex-col items-center gap-6">
                            <div className="w-[220px] h-[310px] lg:w-[260px] lg:h-[365px] flex items-center justify-center">
                                <LoadingSpinner size="h-14 w-14 lg:h-16 lg:w-16" />
                            </div>
                            <p className="text-base lg:text-lg font-medium text-gray-600 dark:text-gray-300">
                                Loading...
                            </p>
                        </div>
                    ) : !hasBottleInDB ? (
                        // State 1: No Bottle Exists
                        <div className="flex flex-col items-center gap-6 lg:gap-8">
                            {/* Bottle Icon (Empty/Disconnected) */}
                            <div className="w-[220px] h-[310px] lg:w-[260px] lg:h-[365px] relative">
                                <svg viewBox="0 0 200 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                                    {/* Bottle Cap */}
                                    <rect x="70" y="10" width="60" height="30" rx="4"
                                        className="fill-gray-300 dark:fill-gray-600 stroke-gray-400 dark:stroke-gray-500" strokeWidth="2" />

                                    {/* Bottle Neck */}
                                    <path d="M 80 40 L 80 70 L 50 90 L 50 250 C 50 265 65 270 100 270 C 135 270 150 265 150 250 L 150 90 L 120 70 L 120 40 Z"
                                        className="fill-gray-200/50 dark:fill-gray-700/50 stroke-gray-300 dark:stroke-gray-600" strokeWidth="3" />
                                </svg>

                                {/* Disconnected Icon Overlay */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-gray-300/80 dark:bg-gray-700/80 backdrop-blur-sm flex items-center justify-center shadow-lg">
                                        <svg className="w-10 h-10 lg:w-12 lg:h-12 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <p className="text-xl lg:text-2xl font-semibold text-gray-700 dark:text-gray-200 text-center px-4">
                                No Bottle Registered
                            </p>

                            {error && <ErrorMessage message={error} />}

                            <button
                                onClick={() => setShowAddBottleModal(true)}
                                className="w-[220px] lg:w-[260px] h-[54px] lg:h-[60px] bg-blue-500 hover:bg-blue-600 text-white font-semibold text-base lg:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <span>Register Bottle</span>
                            </button>
                        </div>
                    ) : (
                        // State 2 & 3: Bottle Exists (Connected or Disconnected)
                        <div className="flex flex-col items-center gap-6 lg:gap-8">
                            {/* Bottle Visualization with Water Level */}
                            <div className="w-[220px] h-[310px] lg:w-[260px] lg:h-[365px] relative">
                                <svg viewBox="0 0 200 280" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                                    {/* Bottle Cap */}
                                    <rect x="70" y="10" width="60" height="30" rx="4"
                                        className={isPiOnline
                                            ? "fill-blue-400 dark:fill-blue-500 stroke-blue-500 dark:stroke-blue-600"
                                            : "fill-gray-400 dark:fill-gray-500 stroke-gray-500 dark:stroke-gray-600"
                                        } strokeWidth="2" />

                                    {/* Bottle Outline */}
                                    <path d="M 80 40 L 80 70 L 50 90 L 50 250 C 50 265 65 270 100 270 C 135 270 150 265 150 250 L 150 90 L 120 70 L 120 40 Z"
                                        className={isPiOnline
                                            ? "fill-white/30 dark:fill-slate-700/30 stroke-blue-400 dark:stroke-blue-500"
                                            : "fill-white/30 dark:fill-slate-700/30 stroke-gray-400 dark:stroke-gray-500"
                                        } strokeWidth="3" />

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
                                        className={isPiOnline
                                            ? "fill-blue-400/60 dark:fill-blue-500/60"
                                            : "fill-gray-400/60 dark:fill-gray-500/60"
                                        }
                                        clipPath="url(#bottleClip)"
                                    />

                                    {/* Water Surface Wave */}
                                    <path
                                        d={`M 50 ${270 - (waterLevel / 100 * 230)} Q 75 ${270 - (waterLevel / 100 * 230) - 3} 100 ${270 - (waterLevel / 100 * 230)} T 150 ${270 - (waterLevel / 100 * 230)}`}
                                        className={isPiOnline
                                            ? "fill-none stroke-blue-500 dark:stroke-blue-400"
                                            : "fill-none stroke-gray-500 dark:stroke-gray-400"
                                        }
                                        strokeWidth="2"
                                        clipPath="url(#bottleClip)"
                                    />

                                    {/* Shine effect */}
                                    <ellipse cx="75" cy="140" rx="15" ry="40"
                                        className="fill-white/30 dark:fill-white/20" />
                                </svg>

                                {/* Status Indicator - Green (connected) or Red (disconnected) */}
                                <div className="absolute top-3 right-3 lg:top-4 lg:right-4 flex items-center gap-1">
                                    {isPiOnline ? (
                                        <span className="relative flex h-4 w-4 lg:h-5 lg:w-5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-4 w-4 lg:h-5 lg:w-5 bg-green-500"></span>
                                        </span>
                                    ) : (
                                        <span className="relative flex h-4 w-4 lg:h-5 lg:w-5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-4 w-4 lg:h-5 lg:w-5 bg-red-500"></span>
                                        </span>
                                    )}
                                </div>

                                {/* Water Level Percentage */}
                                <div className="absolute bottom-5 lg:bottom-6 left-1/2 transform -translate-x-1/2">
                                    <div className={`bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-4 py-1.5 lg:px-5 lg:py-2 rounded-full shadow-lg ${isPiOnline
                                            ? "border border-blue-200 dark:border-blue-700"
                                            : "border border-gray-200 dark:border-gray-700"
                                        }`}>
                                        <p className={`text-base lg:text-lg font-bold ${isPiOnline
                                                ? "text-blue-600 dark:text-blue-400"
                                                : "text-gray-600 dark:text-gray-400"
                                            }`}>{waterLevel}%</p>
                                    </div>
                                </div>
                            </div>

                            {/* Status Message (only shown when disconnected) */}
                            {!isPiOnline && (
                                <p className="text-base lg:text-lg font-medium text-gray-600 dark:text-gray-400">
                                    Bottle Offline
                                </p>
                            )}

                            {/* Error Message */}
                            {error && <ErrorMessage message={error} />}
                        </div>
                    )}
                </div>

                {/* Daily Goal Overview - Shows after bottle on mobile, right side on desktop */}
                <div className="w-full max-w-[380px] lg:max-w-none lg:w-[420px] lg:order-1">
                    {/* Main Stats Card */}
                    <div className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/40 dark:border-slate-700/40 p-6 lg:p-8 mb-4 lg:mb-6">
                        <div className="flex items-center justify-between mb-4 lg:mb-6">
                            <h3 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-gray-100">Today's Goal</h3>
                            <span className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">{today}</span>
                        </div>

                        {loadingIntake ? (
                            <div className="flex items-center justify-center py-12">
                                <LoadingSpinner size="h-10 w-10" />
                            </div>
                        ) : (
                            <>
                                {/* Progress Ring - Desktop Only */}
                                <div className="hidden lg:flex items-center justify-center mb-6">
                                    <div className="relative w-48 h-48">
                                        {/* Background Circle */}
                                        <svg className="transform -rotate-90 w-48 h-48">
                                            <circle
                                                cx="96"
                                                cy="96"
                                                r="88"
                                                stroke="currentColor"
                                                strokeWidth="12"
                                                fill="none"
                                                className="text-gray-200 dark:text-slate-700"
                                            />
                                            {/* Progress Circle */}
                                            <circle
                                                cx="96"
                                                cy="96"
                                                r="88"
                                                stroke="currentColor"
                                                strokeWidth="12"
                                                fill="none"
                                                strokeDasharray={`${2 * Math.PI * 88}`}
                                                strokeDashoffset={`${2 * Math.PI * 88 * (1 - intakePercentage / 100)}`}
                                                className="text-blue-500 dark:text-blue-400 transition-all duration-500"
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        {/* Center Text */}
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                                                {intakePercentage}%
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Complete</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="flex items-center justify-between lg:flex-col lg:gap-4">
                                    <div className="lg:w-full lg:bg-gradient-to-br lg:from-blue-50 lg:to-cyan-50 lg:dark:from-blue-900/20 lg:dark:to-cyan-900/20 lg:rounded-xl lg:p-4 lg:border lg:border-blue-100 lg:dark:border-blue-800/40">
                                        <p className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 lg:mb-2">Current Intake</p>
                                        <p className="text-3xl lg:text-4xl font-bold text-blue-600 dark:text-blue-400">
                                            {currentIntake}ml
                                        </p>
                                        <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mt-1">of {dailyGoal}ml</p>
                                    </div>
                                    <div className="text-right lg:text-left lg:w-full lg:bg-gradient-to-br lg:from-slate-50 lg:to-gray-50 lg:dark:from-slate-800/40 lg:dark:to-slate-700/40 lg:rounded-xl lg:p-4 lg:border lg:border-gray-200 lg:dark:border-slate-600/40">
                                        <p className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 lg:mb-2">Remaining</p>
                                        <p className="text-3xl lg:text-4xl font-bold text-gray-700 dark:text-gray-300">
                                            {dailyGoal - currentIntake > 0 ? `${dailyGoal - currentIntake}ml` : '0ml'}
                                        </p>
                                        <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            {dailyGoal - currentIntake > 0 ? 'to go' : 'Goal reached! 🎉'}
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Quick Stats - Desktop Only */}
                    <div className="hidden lg:grid grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-100 dark:border-green-800/40">
                            <div className="flex items-center gap-2 mb-2">
                                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-xs font-medium text-green-700 dark:text-green-300">Status</span>
                            </div>
                            <p className="text-lg font-bold text-green-800 dark:text-green-200">
                                {isPiOnline ? 'Connected' : 'Offline'}
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl p-4 border border-purple-100 dark:border-purple-800/40">
                            <div className="flex items-center gap-2 mb-2">
                                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Progress</span>
                            </div>
                            <p className="text-lg font-bold text-purple-800 dark:text-purple-200">
                                {intakePercentage >= 100 ? 'Completed' : intakePercentage >= 50 ? 'On Track' : 'Getting Started'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
})

Bottle.displayName = 'Bottle'

export default Bottle