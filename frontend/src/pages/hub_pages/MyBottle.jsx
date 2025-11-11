import { useState } from "react"
import Bottle from "../my_bottle/Bottle"
import BottleSettings from "../my_bottle/BottleSettings"


export default function MyBottle() {
    // Mini navbar state for content sections
    const [activeSection, setActiveSection] = useState("intake")
    // Bottle connection state
    const [isBottleConnected, setIsBottleConnected] = useState(false)

    return (
        <div className="w-full flex flex-col items-center justify-center gap-8 min-h-[500px]">
            {/* Goal Overview and Bottle Visualization */}
            <Bottle onConnectionChange={setIsBottleConnected} />

            {/* Mini Navbar - Only show when bottle is connected */}
            {isBottleConnected && (
                <div className="w-[320px] bg-white/80 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/40 dark:border-slate-700/40 p-2">
                <div className="flex items-center justify-between gap-2">
                    <button
                        onClick={() => setActiveSection("intake")}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ease-in-out transform ${
                            activeSection === "intake"
                                ? "bg-blue-500 text-white shadow-md scale-105"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700/50 hover:scale-102 active:scale-95"
                        }`}
                    >
                        Intake
                    </button>
                    <button
                        onClick={() => setActiveSection("settings")}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ease-in-out transform ${
                            activeSection === "settings"
                                ? "bg-blue-500 text-white shadow-md scale-105"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700/50 hover:scale-102 active:scale-95"
                        }`}
                    >
                        Settings
                    </button>
                    <button
                        onClick={() => setActiveSection("statistics")}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ease-in-out transform ${
                            activeSection === "statistics"
                                ? "bg-blue-500 text-white shadow-md scale-105"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700/50 hover:scale-102 active:scale-95"
                        }`}
                    >
                        Statistics
                    </button>
                </div>
            </div>
            )}

            {/* Dynamic Content Box - Only show when bottle is connected */}
            {isBottleConnected && (
                <div className="w-[320px] bg-white/80 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/40 dark:border-slate-700/40 p-6">
                {activeSection === "settings" ? (
                    <BottleSettings />
                ) : (
                    <>
                        <h4 className="text-[18px] font-semibold text-gray-900 dark:text-gray-100 mb-4 capitalize">
                            {activeSection}
                        </h4>
                        <div className="text-gray-600 dark:text-gray-400 text-center py-8">
                            Content goes here
                        </div>
                    </>
                )}
            </div>
            )}
        </div>
    )
}