import { useState } from "react"

export default function BottleSettings() {
    const [action, setAction] = useState("")
    const [inputValue, setInputValue] = useState("")
    const [error, setError] = useState("")

    const handleActionClick = (actionType) => {
        setAction(actionType)
        setError("")
        if (actionType === "Edit Name") {
            setInputValue("Sam's Bottle")
        } else if (actionType === "Edit Goal") {
            setInputValue("2000")
        }
    }

    return (
        <>
            {/* Modal Overlay */}
            <div className={`
                fixed inset-0 bg-black/60 flex items-center justify-center z-50 transition-opacity duration-250
                ${action !== "" ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
            `}>
                <div className="w-[280px] bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/40 dark:border-slate-700/40">
                    <h3 className="text-[24px] font-bold text-gray-900 dark:text-gray-100 mb-2">{action}</h3>
                    
                    {action.includes("Edit") ? (
                        <>
                            <div className="flex flex-col mt-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    New value:
                                </label>
                                <input
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    type="text"
                                    placeholder="Enter new value here"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                />
                                {error && (
                                    <p className="w-full text-red-600 dark:text-red-400 text-sm mt-2 text-center">
                                        {error}
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => {
                                        setAction("")
                                        setError("")
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg transition-all duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        // TODO: Add validation and API call
                                        setAction("")
                                    }}
                                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Apply
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                                Are you sure you want to {action.toLowerCase()}?
                            </p>
                            <p className="text-sm font-semibold text-red-600 dark:text-red-400 mt-2">
                                Warning: This action is irreversible
                            </p>
                            
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setAction("")}
                                    className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg transition-all duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        // TODO: Add API call
                                        setAction("")
                                    }}
                                    className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all duration-200"
                                >
                                    Confirm
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Settings Options */}
            <div className="w-full flex flex-col gap-3">
                <button
                    onClick={() => handleActionClick("Edit Name")}
                    className="w-full px-4 py-4 bg-blue-50 dark:bg-slate-700/60 hover:bg-white/80 dark:hover:bg-slate-700/80 backdrop-blur-sm rounded-xl border border-gray-200/40 dark:border-slate-600/40 transition-all duration-200 flex items-center gap-3 group"
                >
                    <svg className="w-6 h-6 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                        Edit bottle's name
                    </span>
                </button>

                <button
                    onClick={() => handleActionClick("Edit Goal")}
                    className="w-full px-4 py-4 bg-blue-50 dark:bg-slate-700/60 hover:bg-white/80 dark:hover:bg-slate-700/80 backdrop-blur-sm rounded-xl border border-gray-200/40 dark:border-slate-600/40 transition-all duration-200 flex items-center gap-3 group"
                >
                    <svg className="w-6 h-6 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                        Edit daily goal
                    </span>
                </button>

                <button
                    onClick={() => handleActionClick("Reset Intake")}
                    className="w-full px-4 py-4 bg-yellow-100/60 dark:bg-yellow-900/20 hover:bg-yellow-100/80 dark:hover:bg-yellow-900/30 backdrop-blur-sm rounded-xl border border-yellow-200/40 dark:border-yellow-800/40 transition-all duration-200 flex items-center gap-3 group"
                >
                    <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">
                        Reset intake
                    </span>
                </button>

                <button
                    onClick={() => handleActionClick("Reset Statistics")}
                    className="w-full px-4 py-4 bg-yellow-100/60 dark:bg-yellow-900/20 hover:bg-yellow-100/80 dark:hover:bg-yellow-900/30 backdrop-blur-sm rounded-xl border border-yellow-200/40 dark:border-yellow-800/40 transition-all duration-200 flex items-center gap-3 group"
                >
                    <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">
                        Reset statistics
                    </span>
                </button>

                <button
                    onClick={() => handleActionClick("Delete Bottle")}
                    className="w-full px-4 py-4 bg-red-100/60 dark:bg-red-900/20 hover:bg-red-100/80 dark:hover:bg-red-900/30 backdrop-blur-sm rounded-xl border border-red-200/40 dark:border-red-800/40 transition-all duration-200 flex items-center gap-3 group"
                >
                    <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                        Delete bottle
                    </span>
                </button>
            </div>
        </>
    )
}
