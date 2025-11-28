import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function Reminders() {
    const navigate = useNavigate()
    
    // Get reminder messages based on time of day
    const getMessage = (hour) => {
        if (hour >= 6 && hour < 12) return "Good morning! Time to hydrate 💧"
        if (hour >= 12 && hour < 14) return "Lunch time hydration break! 🥤"
        if (hour >= 14 && hour < 18) return "Afternoon reminder: Drink water! 💙"
        if (hour >= 18 && hour < 21) return "Evening hydration time! 🌅"
        return "Time to drink some water! 💧"
    }
    
    // Generate reminders dynamically based on frequency
    const generateReminders = (frequencyHours) => {
        const reminders = []
        const startHour = 8 // 8 AM
        const endHour = 22 // 10 PM
        const currentHour = new Date().getHours()
        let id = 1

        for (let hour = startHour; hour <= endHour; hour += frequencyHours) {
            const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
            const period = hour >= 12 ? 'PM' : 'AM'
            const time = `${displayHour}:00 ${period}`
            
            reminders.push({
                id: id++,
                time: time,
                hour: hour,
                message: getMessage(hour),
                completed: hour < currentHour // Mark as completed if before current time
            })
        }

        return reminders
    }
    
    // Hardcoded frequency for now - will be fetched from API later
    const [frequency] = useState(2)
    const [reminders] = useState(() => generateReminders(frequency))

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            {/* Header */}
            <header className="w-full h-[100px] bg-white/85 dark:bg-slate-900/85 backdrop-blur-sm rounded-b-2xl flex items-center justify-between px-6 shadow-sm border-b-2 border-blue-400/12 dark:border-slate-700/30">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="font-medium">Back</span>
                </button>
                
                <h1 className="text-gray-900 dark:text-white text-3xl font-semibold absolute left-1/2 transform -translate-x-1/2">
                    Reminders
                </h1>
            </header>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Info Card */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h3 className="text-blue-800 dark:text-blue-300 font-semibold mb-1">Hydration Schedule</h3>
                            <p className="text-blue-700 dark:text-blue-400 text-sm">
                                You'll receive reminders every 2 hours to stay hydrated throughout the day.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Reminders List */}
                <div className="space-y-3">
                    {reminders.map((reminder) => (
                        <div
                            key={reminder.id}
                            className={`bg-white/80 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl p-5 shadow-sm border transition-all duration-200 hover:shadow-md ${
                                reminder.completed
                                    ? 'border-green-200 dark:border-green-800/40'
                                    : 'border-gray-200/40 dark:border-slate-700/40'
                            }`}
                        >
                            <div className="flex items-start gap-4">
                                {/* Status Icon */}
                                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                                    reminder.completed
                                        ? 'bg-green-100 dark:bg-green-900/30'
                                        : 'bg-blue-100 dark:bg-blue-900/30'
                                }`}>
                                    {reminder.completed ? (
                                        <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                        </svg>
                                    )}
                                </div>

                                {/* Reminder Content */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-lg font-bold ${
                                            reminder.completed
                                                ? 'text-green-600 dark:text-green-400'
                                                : 'text-blue-600 dark:text-blue-400'
                                        }`}>
                                            {reminder.time}
                                        </span>
                                        {reminder.completed && (
                                            <span className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full font-medium">
                                                Completed
                                            </span>
                                        )}
                                    </div>
                                    <p className={`text-sm ${
                                        reminder.completed
                                            ? 'text-gray-600 dark:text-gray-400 line-through'
                                            : 'text-gray-700 dark:text-gray-300'
                                    }`}>
                                        {reminder.message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Info */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        💧 Stay consistent with your hydration goals!
                    </p>
                </div>
            </div>
        </div>
    )
}
