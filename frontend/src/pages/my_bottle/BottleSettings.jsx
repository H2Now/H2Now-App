import { useEffect, useState } from "react"
import { useUnitPreference } from "../../hooks/usePreferences"

export default function BottleSettings({ onDataChange }) {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
    const unit = useUnitPreference()
    const [action, setAction] = useState("")
    const [closingAction, setClosingAction] = useState("")
    const [isClosing, setIsClosing] = useState(false)
    const [inputValue, setInputValue] = useState("")
    const [error, setError] = useState("")
    const [warning, setWarning] = useState("")
    const [loading, setLoading] = useState(false)

    // store current bottle data
    const [currentBottleName, setCurrentBottleName] = useState("")
    const [currentGoal, setCurrentGoal] = useState("")

    // fetch bottle data when component mounts
    useEffect(() => {
        fetchBottleData()
    }, [])

    const fetchBottleData = async () => {
        try {
            const res = await fetch(`${API_URL}/user/water_bottle`, {
                credentials: "include",
            })

            const data = await res.json()

            if (res.ok && data.success) {
                setCurrentBottleName(data.bottleName)
                setCurrentGoal(data.goal)
            }
        } catch (error) {
            console.error("Error fetching bottle data: ", error)
        }
    }

    const handleActionClick = (actionType) => {
        setAction(actionType)
        setClosingAction(actionType)
        setIsClosing(false)
        setError("")
        setWarning("")
        if (actionType === "Edit Name") {
            setInputValue(currentBottleName)
        } else if (actionType === "Edit Goal") {
            setInputValue(currentGoal)
        }
    }

    const handleCloseModal = () => {
        // Without this timeout thing, you'll see a glimpse of another modal while closing the current modal
        // Keep current content visible while fading out to avoid glimpses
        setIsClosing(true)
        setTimeout(() => {
            setAction("")
            setClosingAction("")
            setInputValue("")
            setError("")
            setWarning("")
            setIsClosing(false)
        }, 250) // match CSS transition duration
    }

    const handleInputChange = (e) => {
        const value = e.target.value
        setInputValue(value)
        setError("")
        setWarning("")

        // show warning in real time for edit goal if goal >= 3000
        if (action === "Edit Goal" && value) {
            const goalValue = parseFloat(value)
            if (!isNaN(goalValue)) {
                if (goalValue >= 3000) {
                    setWarning("High intake goals may not be necessary for most people. Please ensure this matches your activity and health needs.")
                }
            }
        }
    }

    const handleApply = async () => {
        setError("")
        setWarning("")

        // Validation
        if (!inputValue.trim()) {
            setError("Please enter a value")
            return
        }

        if (action === "Edit Goal") {
            const goalValue = parseFloat(inputValue)
            if (isNaN(goalValue) || goalValue <= 0) {
                setError("Goal must be a positive number")
                return
            }

            if (goalValue >= 4000) {
                setError("Goal exceeds safe levels of water intake")
                return
            }
        }

        setLoading(true)

        try {
            const payload = action === "Edit Name"
                ? { bottleName: inputValue.trim() }
                : { goal: parseFloat(inputValue) }

            const res = await fetch(`${API_URL}/user/water_bottle/settings`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(payload)
            })

            const data = await res.json()

            if (res.ok && data.success) {
                if (action === "Edit Name") {
                    setCurrentBottleName(inputValue.trim())
                } else {
                    setCurrentGoal(inputValue)
                }
                // Notify parent component to refresh bottle data
                if (onDataChange) {
                    onDataChange()
                }
                handleCloseModal()
            }
        } catch (error) {
            console.error("Error updating: ", error)
            setError("Something went wrong.. Please try again!")
        } finally {
            setLoading(false)
        }
    }

    const handleConfirm = async () => {
        if (action === "Reset Intake") {
            setLoading(true)
            setError("")

            try {
                const res = await fetch(`${API_URL}/user/water_bottle/intake/reset`, {
                    method: "POST",
                    credentials: "include",
                })

                const data = await res.json()

                if (res.ok && data.success) {
                    // Notify parent component to refresh bottle data
                    if (onDataChange) {
                        onDataChange()
                    }
                    handleCloseModal()
                } else {
                    setError(data.message || "Failed to reset intake")
                }
            } catch (error) {
                console.error("Error resetting intake: ", error)
                setError("Something went wrong.. Please try again!")
            } finally {
                setLoading(false)
            }
        } else if (action === "Reset Activity") {
            setLoading(true)
            setError("")

            try {
                const res = await fetch(`${API_URL}/user/water_bottle/activity`, {
                    method: "DELETE",
                    credentials: "include",
                })

                const data = await res.json()

                if (res.ok && data.success) {
                    // Notify parent component to refresh bottle data
                    if (onDataChange) {
                        onDataChange()
                    }
                    handleCloseModal()
                } else {
                    setError(data.message || "Failed to reset activity history")
                }
            } catch (error) {
                console.error("Error resetting activity history: ", error)
                setError("Something went wrong.. Please try again!")
            } finally {
                setLoading(false)
            }
        } else {
            // TODO: Handle Delete Bottle
            setAction("")
        }
    }

    // Use stable action for rendering during fade-out to prevent content flicker
    const effectiveAction = action || closingAction

    return (
        <>
            {/* Modal Overlay */}
            <div className={`
                fixed inset-0 bg-black/60 flex items-center justify-center z-50 transition-opacity duration-250
                fixed inset-0 bg-black/60 flex items-center justify-center z-50 transition-opacity duration-250 px-4
                ${effectiveAction !== "" ? (isClosing ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto') : 'opacity-0 pointer-events-none'}
            `}>
                <div className="w-full max-w-[420px] lg:max-w-[480px] bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 lg:p-8 shadow-lg border border-gray-200/40 dark:border-slate-700/40">
                    <h3 className="text-[24px] font-bold text-gray-900 dark:text-gray-100 mb-2">{effectiveAction}</h3>

                    {effectiveAction.includes("Edit") ? (
                        <>
                            <div className="flex flex-col mt-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Edit value:
                                </label>
                                <input
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
                                    type={action === "Edit Goal" ? "number" : "text"}
                                    placeholder={action === "Edit Goal" ? `Enter goal in ${unit}` : "Enter bottle name"}
                                    value={inputValue}
                                    onChange={handleInputChange}
                                    disabled={loading} 
                                    autoFocus
                                />

                                {/* Error Message */}
                                {error && (
                                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
                                        <div className="flex">
                                            <svg className="h-5 w-5 text-red-400 dark:text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-sm">{error}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Warning Message */}
                                {warning && (
                                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 px-4 py-3 rounded-lg">
                                        <div className="flex">
                                            <svg className="h-5 w-5 text-amber-500 dark:text-amber-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-sm">{warning}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={handleCloseModal}
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg transition-all duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleApply}
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Apply
                                        </>
                                    )}
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                                {effectiveAction === "Reset Intake" 
                                    ? `This will reset your water intake for today to 0${unit}.`
                                    : `Are you sure you want to ${effectiveAction.toLowerCase()}?`
                                }
                            </p>
                            {effectiveAction !== "Reset Intake" && (
                                <p className="text-sm font-semibold text-red-600 dark:text-red-400 mt-2">
                                    Warning: This action is irreversible
                                </p>
                            )}

                            {/* Error Message */}
                            {error && (
                                <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
                                    <div className="flex items-start">
                                        <svg className="h-5 w-5 text-red-400 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-sm">{error}</span>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={handleCloseModal}
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg transition-all duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    disabled={loading}
                                    className={`flex-1 px-4 py-2 ${
                                        effectiveAction === "Reset Intake" 
                                            ? "bg-yellow-500 hover:bg-yellow-600" 
                                            : "bg-red-500 hover:bg-red-600"
                                    } text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2`}
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        "Confirm"
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Settings Options */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
                <button
                    onClick={() => handleActionClick("Edit Name")}
                    className="w-full px-5 py-5 lg:py-6 bg-blue-50 dark:bg-slate-700/60 hover:bg-white/80 dark:hover:bg-slate-700/80 backdrop-blur-sm rounded-xl border border-gray-200/40 dark:border-slate-600/40 transition-all duration-200 flex items-center gap-3 group shadow-sm hover:shadow-md"
                >
                    <svg className="w-6 h-6 lg:w-7 lg:h-7 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span className="font-medium lg:text-lg text-gray-900 dark:text-gray-100 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                        Edit bottle's name
                    </span>
                </button>

                <button
                    onClick={() => handleActionClick("Edit Goal")}
                    className="w-full px-5 py-5 lg:py-6 bg-blue-50 dark:bg-slate-700/60 hover:bg-white/80 dark:hover:bg-slate-700/80 backdrop-blur-sm rounded-xl border border-gray-200/40 dark:border-slate-600/40 transition-all duration-200 flex items-center gap-3 group shadow-sm hover:shadow-md"
                >
                    <svg className="w-6 h-6 lg:w-7 lg:h-7 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span className="font-medium lg:text-lg text-gray-900 dark:text-gray-100 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                        Edit daily goal
                    </span>
                </button>

                <button
                    onClick={() => handleActionClick("Reset Intake")}
                    className="w-full px-5 py-5 lg:py-6 bg-yellow-100/60 dark:bg-yellow-900/20 hover:bg-yellow-100/80 dark:hover:bg-yellow-900/30 backdrop-blur-sm rounded-xl border border-yellow-200/40 dark:border-yellow-800/40 transition-all duration-200 flex items-center gap-3 group shadow-sm hover:shadow-md"
                >
                    <svg className="w-6 h-6 lg:w-7 lg:h-7 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="font-medium lg:text-lg text-gray-900 dark:text-gray-100 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">
                        Reset today's intake
                    </span>
                </button>

                <button
                    onClick={() => handleActionClick("Reset Activity")}
                    className="w-full px-5 py-5 lg:py-6 bg-yellow-100/60 dark:bg-yellow-900/20 hover:bg-yellow-100/80 dark:hover:bg-yellow-900/30 backdrop-blur-sm rounded-xl border border-yellow-200/40 dark:border-yellow-800/40 transition-all duration-200 flex items-center gap-3 group shadow-sm hover:shadow-md"
                >
                    <svg className="w-6 h-6 lg:w-7 lg:h-7 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="font-medium lg:text-lg text-gray-900 dark:text-gray-100 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">
                        Reset activity history
                    </span>
                </button>

                <button
                    onClick={() => handleActionClick("Delete Bottle")}
                    className="w-full lg:col-span-2 px-5 py-5 lg:py-6 bg-red-100/60 dark:bg-red-900/20 hover:bg-red-100/80 dark:hover:bg-red-900/30 backdrop-blur-sm rounded-xl border border-red-200/40 dark:border-red-800/40 transition-all duration-200 flex gap-3 group shadow-sm hover:shadow-md"
                >
                    <svg className="w-6 h-6 lg:w-7 lg:h-7 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span className="font-medium lg:text-lg text-gray-900 dark:text-gray-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                        Delete bottle
                    </span>
                </button>
            </div>
        </>
    )
}
