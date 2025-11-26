import { useState, useEffect, forwardRef, useImperativeHandle } from "react"
import usePubNub from "../../hooks/usePubNub"

const Bottle = forwardRef(({ onConnectionChange }, ref) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

    const [userId, setUserId] = useState(null)
    const [hasBottleInDB, setHasBottleInDB] = useState(false)
    const [checkingDatabase, setCheckingDatabase] = useState(true)
    const [isPiOnline, setIsPiOnline] = useState(false)

    // PubNub hook
    const { bottleConnected: pubnubStatus, latestIntake } = usePubNub(userId)

    const [error, setError] = useState(null)
    const [bottleName, setBottleName] = useState("")
    const [showAddBottleModal, setShowAddBottleModal] = useState(false)
    const [addingBottle, setAddingBottle] = useState(false)
    const [newBottleId, setNewBottleId] = useState("")
    const [newBottleName, setNewBottleName] = useState("")
    const [bottleIdVerified, setBottleIdVerified] = useState(false)

    // Missing variable — FIXED
    const [newGoal, setNewGoal] = useState("2000")

    // Daily intake data
    const [dailyGoal, setDailyGoal] = useState(2000)
    const [currentIntake, setCurrentIntake] = useState(0)
    const [loadingIntake, setLoadingIntake] = useState(true)
    const intakePercentage = Math.round((currentIntake / dailyGoal) * 100)
    const waterLevel = Math.min(intakePercentage, 100)

    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    useEffect(() => {
        setIsPiOnline(pubnubStatus)
    }, [pubnubStatus])

    useEffect(() => {
        if (latestIntake) setCurrentIntake(latestIntake.total)
    }, [pubnubStatus, latestIntake])

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

    useImperativeHandle(ref, () => ({
        refreshBottleData: fetchBottleData
    }))

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

    useEffect(() => {
        if (onConnectionChange) onConnectionChange(hasBottleInDB)
    }, [hasBottleInDB, onConnectionChange])

    const handleVerifyBottleId = async () => {
        if (!newBottleId.trim()) {
            setError("Please enter a bottle ID")
            return
        }

        setAddingBottle(true)
        setError(null)

        try {
            const response = await fetch(
                `${API_URL}/api/water_bottle?bottleID=${encodeURIComponent(newBottleId)}`,
                { credentials: "include" }
            )

            const data = await response.json()

            if (response.ok && data.success) {
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

        setShowAddBottleModal(false)
        setNewBottleName("")
        setError(null)
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

    return (
        <>
            {/* Add Bottle Modal */}
            <div
                className={`
                    fixed inset-0 bg-black/60 flex items-center justify-center z-50 transition-opacity duration-250 px-4
                    ${showAddBottleModal ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
                `}
            >
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

                    {error && <ErrorMessage message={error} />}

                    {/* Bottle Name */}
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

                    {!bottleIdVerified ? (
                        <>
                            {/* Bottle ID */}
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
                        <>
                            {/* Goal */}
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

            {/* Bottle Display Section */}
            <div className="w-full max-w-md mx-auto mt-8">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6 border border-gray-200/40 dark:border-slate-700/40">

                    {/* Bottle Header */}
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                {bottleName || "My Bottle"}
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{today}</p>
                        </div>

                        {/* Connection Badge */}
                        <span
                            className={`
                    px-3 py-1 rounded-full text-sm font-medium
                    ${isPiOnline
                                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                                }
                `}
                        >
                            {isPiOnline ? "Connected" : "Disconnected"}
                        </span>
                    </div>

                    {/* Water Level Bottle */}
                    <div className="relative h-64 w-48 mx-auto">
                        <svg viewBox="0 0 200 280" className="w-full h-full">
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
                            <ellipse cx="75" cy="140" rx="15" ry="40" className="fill-white/30 dark:fill-white/20" />
                        </svg>

                        {/* Status Indicator */}
                        <div className="absolute top-2 right-2 flex items-center gap-1">
                            {isPiOnline ? (
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                </span>
                            ) : (
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                </span>
                            )}
                        </div>

                        {/* Water Level Percentage */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                            <div className={`bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-3 py-1 rounded-full ${isPiOnline
                                ? "border border-blue-200 dark:border-blue-700"
                                : "border border-gray-200 dark:border-gray-700"
                                }`}>
                                <p className={`text-sm font-bold ${isPiOnline
                                    ? "text-blue-600 dark:text-blue-400"
                                    : "text-gray-600 dark:text-gray-400"
                                    }`}>{waterLevel}%</p>
                            </div>
                        </div>
                    </div>

                    {/* Intake Stats */}
                    <div className="mt-6 text-center">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            {currentIntake} / {dailyGoal} ml
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {intakePercentage}% of daily goal
                        </p>
                    </div>

                    {/* No Bottle Connected */}
                    {!hasBottleInDB && !checkingDatabase && (
                        <div className="mt-6 flex flex-col items-center">
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                                No bottle connected yet.
                            </p>
                            <button
                                onClick={() => setShowAddBottleModal(true)}
                                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
                            >
                                Add Bottle
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
})

export default Bottle