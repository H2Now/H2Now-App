import { useState, useEffect } from "react"
import LoadingSpinner from "../../components/LoadingSpinner"

export default function BottleStatistics() {

    // Helper to get current date 
    const getDateComponents = (date = new Date()) => ({
        day: date.getDate(),
        month: date.getMonth() + 1,
        year: date.getFullYear(),
        monthIndex: date.getMonth()
    })

    // Get current date in DD/MM/YYYY format for selectedDate
    const getTodayFormatted = () => {
        const { day, month, year } = getDateComponents()
        return `${day}/${month}/${year}`
    }

    const [selectedDate, setSelectedDate] = useState(getTodayFormatted())
    const [showCalendar, setShowCalendar] = useState(false)
    const [currentMonth, setCurrentMonth] = useState(new Date()) // Set to current month
    const [activityData, setActivityData] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    // Convert date from DD/MM/YYYY to YYYY-MM-DD format for API
    const formatDateForAPI = (dateStr) => {
        if (!dateStr) return ""
        const parts = dateStr.split("/")
        if (parts.length !== 3) return ""
        const [day, month, year] = parts
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
    }

    // Format intake value for display
    const formatIntake = (ml) => {
        if (ml >= 1000) {
            return `${(ml / 1000).toFixed(2)}L`
        }
        return `${ml.toFixed(0)}ml`
    }

    const handleFetch = async () => {
        if (!selectedDate) {
            setError("Please select a date first")
            return
        }

        setLoading(true)
        setError("")

        const apiDate = formatDateForAPI(selectedDate)
        
        try {
            const response = await fetch(
                `http://localhost:5000/user/water_bottle/activity?date=${apiDate}`,
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
                throw new Error(data.message || "Failed to fetch activity data")
            }

            if (data.success) {
                // Transform API data to match component format
                const transformedData = data.activities.map((activity) => ({
                    time: activity.time,
                    change: activity.intake >= 0 ? `+${formatIntake(activity.intake)}` : formatIntake(activity.intake),
                    progress: `${formatIntake(activity.progressAfter)} / ${formatIntake(activity.goal)}`,
                    isPositive: activity.intake >= 0,
                }))

                setActivityData(transformedData)
            } else {
                setError(data.message || "Failed to load activity data")
            }
        } catch (err) {
            console.error("Error fetching activity:", err)
            setError(err.message || "Failed to fetch activity data")
        } finally {
            setLoading(false)
        }
    }

    const daysInMonth = (date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        return new Date(year, month + 1, 0).getDate()
    }

    const getFirstDayOfMonth = (date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        return new Date(year, month, 1).getDay()
    }

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"]

    const renderCalendar = () => {
        const totalDays = daysInMonth(currentMonth)
        const firstDay = getFirstDayOfMonth(currentMonth)
        const days = []
        
        const { month: currentMonthNum, year: currentYear } = getDateComponents(currentMonth)

        // Parse selected date to check for highlighting
        const selectedParts = selectedDate.split("/")
        const selectedDay = selectedParts[0] ? parseInt(selectedParts[0]) : null
        const selectedMonth = selectedParts[1] ? parseInt(selectedParts[1]) : null
        const selectedYear = selectedParts[2] ? parseInt(selectedParts[2]) : null

        // Empty cells for days before the first day of month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-10"></div>)
        }

        // Actual days
        for (let day = 1; day <= totalDays; day++) {
            // Check if this day is selected
            const isSelected = day === selectedDay && 
                              currentMonthNum === selectedMonth && 
                              currentYear === selectedYear
            
            days.push(
                <button
                    key={day}
                    onClick={() => {
                        const dateStr = `${day}/${currentMonthNum}/${currentYear}`
                        setSelectedDate(dateStr)
                        setShowCalendar(false)
                    }}
                    className={`h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                        isSelected
                            ? "bg-blue-500 text-white"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                    }`}
                >
                    {day}
                </button>
            )
        }

        return days
    }

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
    }

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
    }

    // Fetch activity data on component mount
    useEffect(() => {
        handleFetch()
    }, [])

    return (
        <div className="w-full flex flex-col gap-5 lg:gap-6">
            {/* Date Input and Fetch Button */}
            <div className="flex gap-3 lg:gap-4">
                <div className="flex-1 relative">
                    <input
                        type="text"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        onFocus={() => setShowCalendar(true)}
                        placeholder="Select a date"
                        className="w-full px-4 py-3 lg:px-5 lg:py-4 rounded-xl border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50 text-gray-900 dark:text-gray-100 text-base lg:text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />

                    {/* Calendar Dropdown */}
                    {showCalendar && (
                        <div className="absolute top-full mt-2 left-0 w-full lg:w-[400px] bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 p-4 lg:p-6 z-50">
                            {/* Calendar Header */}
                            <div className="flex items-center justify-between mb-4">
                                <button
                                    onClick={handlePrevMonth}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                                </h3>
                                <button
                                    onClick={handleNextMonth}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>

                            {/* Day Labels */}
                            <div className="grid grid-cols-7 gap-1 mb-2">
                                {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
                                    <div key={day} className="h-10 flex items-center justify-center text-xs font-semibold text-gray-500 dark:text-gray-400">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar Days */}
                            <div className="grid grid-cols-7 gap-1">
                                {renderCalendar()}
                            </div>

                            {/* Close Button */}
                            <button
                                onClick={() => setShowCalendar(false)}
                                className="mt-4 w-full py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleFetch}
                    disabled={loading || !selectedDate}
                    className={`px-6 py-3 lg:px-8 lg:py-4 font-semibold text-base lg:text-lg rounded-xl transition-all duration-200 flex items-center gap-2 shadow-md ${
                        loading || !selectedDate
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-500 hover:bg-green-600 hover:shadow-lg"
                    } text-white`}
                >
                    {loading ? (
                        <>
                            <LoadingSpinner size="h-5 w-5 lg:h-6 lg:w-6" color="text-white" />
                            <span className="hidden lg:inline">Loading...</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <span className="hidden lg:inline">Search</span>
                        </>
                    )}
                </button>
            </div>

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

            {/* Activity Table */}
            <div className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/40 dark:border-slate-700/40 overflow-hidden">
                <div className="px-6 lg:px-8 py-4 lg:py-5 border-b border-gray-200 dark:border-slate-700">
                    <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100">Activity</h3>
                </div>

                {/* Table Header */}
                <div className="grid grid-cols-3 gap-4 lg:gap-6 px-6 lg:px-8 py-3 lg:py-4 bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700">
                    <div className="text-sm lg:text-base font-semibold text-gray-600 dark:text-gray-300">Time</div>
                    <div className="text-sm lg:text-base font-semibold text-gray-600 dark:text-gray-300">Intake</div>
                    <div className="text-sm lg:text-base font-semibold text-gray-600 dark:text-gray-300">Progress</div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-gray-200 dark:divide-slate-700">
                    {activityData.length === 0 ? (
                        <div className="px-6 lg:px-8 py-12 text-center">
                            <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <p className="text-gray-500 dark:text-gray-400 text-base lg:text-lg">
                                {selectedDate ? "No activity data for this date" : "Select a date and click Fetch to view activity"}
                            </p>
                        </div>
                    ) : (
                        activityData.map((activity, index) => (
                            <div key={index} className="grid grid-cols-3 gap-4 lg:gap-6 px-6 lg:px-8 py-4 lg:py-5 hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition-colors">
                                <div className="text-sm lg:text-base text-gray-700 dark:text-gray-300 font-medium">
                                    {activity.time}
                                </div>
                                <div className={`text-sm lg:text-base font-semibold ${
                                    activity.isPositive 
                                        ? "text-green-600 dark:text-green-400" 
                                        : "text-red-600 dark:text-red-400"
                                }`}>
                                    {activity.change}
                                </div>
                                <div className="text-sm lg:text-base text-gray-700 dark:text-gray-300 font-medium">
                                    {activity.progress}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
