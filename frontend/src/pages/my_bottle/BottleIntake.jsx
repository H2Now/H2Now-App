import { useState, useEffect } from "react"
import LoadingSpinner from "../../components/LoadingSpinner"

export default function BottleIntake() {
    const [intakeData, setIntakeData] = useState([])
    const [editingId, setEditingId] = useState(null)
    const [editAmount, setEditAmount] = useState("")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deleteId, setDeleteId] = useState(null)

    // Get today's date in YYYY-MM-DD format
    const getTodayDate = () => {
        const today = new Date()
        const year = today.getFullYear()
        const month = String(today.getMonth() + 1).padStart(2, '0')
        const day = String(today.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    // Fetch today's intake data
    useEffect(() => {
        const fetchTodayIntake = async () => {
            setLoading(true)
            setError("")
            
            const todayDate = getTodayDate()
            
            try {
                const response = await fetch(
                    `http://localhost:5000/user/water_bottle/activity?date=${todayDate}`,
                    {
                        method: "GET",
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json"
                        }
                    }
                )

                const data = await response.json()

                if (!response.ok) {
                    throw new Error(data.message || "Failed to fetch intake data")
                }

                if (data.success) {
                    // Transform API data to match component format
                    const transformedData = data.activities.map((activity, index) => ({
                        id: index + 1, // Generate ID from index
                        time: activity.time,
                        amount: activity.intake
                    }))

                    setIntakeData(transformedData)
                } else {
                    setError(data.message || "Failed to load intake data")
                }
            } catch (err) {
                console.error("Error fetching intake:", err)
                setError(err.message || "Failed to fetch intake data")
            } finally {
                setLoading(false)
            }
        }

        fetchTodayIntake()
    }, [])

    // Format intake value for display
    const formatIntake = (ml) => {
        if (ml >= 1000) {
            return `${(ml / 1000).toFixed(2)}L`
        }
        return `${ml}ml`
    }

    const handleEdit = (entry) => {
        setEditingId(entry.id)
        setEditAmount(entry.amount.toString())
    }

    const handleSave = (id) => {
        const newAmount = parseInt(editAmount)
        if (isNaN(newAmount) || newAmount <= 0) {
            setError("Please enter a valid amount")
            setTimeout(() => setError(""), 3000)
            return
        }

        setIntakeData(intakeData.map(entry => 
            entry.id === id ? { ...entry, amount: newAmount } : entry
        ))
        setEditingId(null)
        setEditAmount("")
        setSuccess("Entry updated successfully!")
        setTimeout(() => setSuccess(""), 3000)
    }

    const handleCancel = () => {
        setEditingId(null)
        setEditAmount("")
    }

    const handleDeleteClick = (id) => {
        setDeleteId(id)
        setShowDeleteModal(true)
    }

    const handleConfirmDelete = () => {
        setIntakeData(intakeData.filter(entry => entry.id !== deleteId))
        setShowDeleteModal(false)
        setDeleteId(null)
        setSuccess("Entry deleted successfully!")
        setTimeout(() => setSuccess(""), 3000)
    }

    const handleCancelDelete = () => {
        setShowDeleteModal(false)
        setDeleteId(null)
    }

    return (
        <div className="w-full flex flex-col gap-6">
            {/* Success Message */}
            {success && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-start gap-3">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <h4 className="text-green-800 dark:text-green-300 font-semibold mb-1">Success</h4>
                        <p className="text-green-700 dark:text-green-400 text-sm">{success}</p>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
                    <svg className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <h4 className="text-red-800 dark:text-red-300 font-semibold mb-1">Error</h4>
                        <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
                    </div>
                </div>
            )}

            {/* Intake Entries List */}
            <div className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/40 dark:border-slate-700/40 overflow-hidden">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-slate-700">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">Today's Intake Entries</h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Click edit to modify any inaccurate readings</p>
                </div>

                {/* Entries List */}
                <div className="divide-y divide-gray-200 dark:divide-slate-700">
                    {loading ? (
                        <div className="px-6 py-12 text-center">
                            <LoadingSpinner size="h-12 w-12" color="text-blue-600 dark:text-blue-400" />
                            <p className="text-gray-500 dark:text-gray-400 text-base mt-4">Loading intake data...</p>
                        </div>
                    ) : intakeData.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <p className="text-gray-500 dark:text-gray-400 text-base">No intake entries yet today</p>
                        </div>
                    ) : (
                        intakeData.map((entry) => (
                            <div key={entry.id} className="px-4 sm:px-6 py-4 hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition-colors">
                                {editingId === entry.id ? (
                                    // Edit Mode
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                {entry.time}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={editAmount}
                                                onChange={(e) => setEditAmount(e.target.value)}
                                                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Enter amount"
                                                autoFocus
                                            />
                                            <span className="text-sm text-gray-600 dark:text-gray-400">ml</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleSave(entry.id)}
                                                className="flex-1 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={handleCancel}
                                                className="flex-1 px-4 py-2.5 bg-gray-300 hover:bg-gray-400 dark:bg-slate-600 dark:hover:bg-slate-500 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    // View Mode
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                                            <div className="flex items-center justify-center w-10 h-10 flex-shrink-0 rounded-full bg-blue-100 dark:bg-blue-900/30">
                                                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                                    {entry.time}
                                                </p>
                                                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                                    {formatIntake(entry.amount)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                                            <button
                                                onClick={() => handleEdit(entry)}
                                                className="p-2 sm:p-2.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"
                                                title="Edit entry"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(entry.id)}
                                                className="p-2 sm:p-2.5 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                                                title="Delete entry"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Info Card */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-start gap-3">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                    <h4 className="text-blue-900 dark:text-blue-300 font-semibold mb-1">About Intake Tracking</h4>
                    <p className="text-blue-800 dark:text-blue-400 text-sm">
                        Your bottle automatically records water intake. If you notice an inaccurate reading, you can edit or delete it here. 
                    </p>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-5 sm:p-6 transform transition-all">
                        {/* Modal Header */}
                        <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-5">
                            <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                                    Delete Entry
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                    Are you sure you want to delete this intake entry? This action cannot be undone.
                                </p>
                            </div>
                        </div>

                        {/* Modal Actions */}
                        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 sm:justify-end mt-5 sm:mt-6">
                            <button
                                onClick={handleCancelDelete}
                                className="px-4 py-2.5 sm:py-2 rounded-lg font-medium text-sm text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="px-4 py-2.5 sm:py-2 rounded-lg font-medium text-sm text-white bg-red-600 hover:bg-red-700 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
