import { progress } from "framer-motion"
import { useState } from "react"

export default function BottleStatistics() {
    const [selectedDate, setSelectedDate] = useState("")
    const [showCalendar, setShowCalendar] = useState(false)
    const [currentMonth, setCurrentMonth] = useState(new Date(2025, 10)) // hardcoded to nov 2025

    // Hardcoded activity data
    const activityData = [
        {
            time: "8:15 PM",
            change: "+10 ml",
            progress: "1.4L / 2L",
            isPositive: true
        },
        {
            time: "1:45 PM",
            change: "+250 ml",
            progress: "1.25L / 2L",
            isPositive: true
        },
        {
            time: "1:30 PM",
            change: "-246 ml",
            progress: "1L / 2L",
            isPositive: false
        },
        {
            time: "10:26 AM",
            change: "+298 ml",
            progress: "3.44L / 2L",
            isPositive: true
        },
        {
            time: "10:00 AM",
            change: "+150 ml",
            progress: "850ml / 2L",
            isPositive: true
        }
    ]

    const handleFetch = () => {
        // TODO: Fetch activity data based on selectedDate
        console.log("Fetching data for:", selectedDate)
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

        // Empty cells for days before the first day of month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-10"></div>)
        }

        // Actual days
        for (let day = 1; day <= totalDays; day++) {
            const isToday = day === 7 // Highlight day 7 just for demo
            days.push(
                <button
                    key={day}
                    onClick={() => {
                        const dateStr = `${day}/${currentMonth.getMonth() + 1}/${currentMonth.getFullYear()}`
                        setSelectedDate(dateStr)
                        setShowCalendar(false)
                    }}
                    className={`h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                        isToday
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
                    className="px-6 py-3 lg:px-8 lg:py-4 bg-green-500 hover:bg-green-600 text-white font-semibold text-base lg:text-lg rounded-xl transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
                >
                    <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span className="hidden lg:inline">Fetch</span>
                </button>
            </div>

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
                    {activityData.map((activity, index) => (
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
                    ))}
                </div>
            </div>
        </div>
    )
}
