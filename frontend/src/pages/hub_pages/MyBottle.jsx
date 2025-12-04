import { useState, useRef } from "react"
import Bottle from "../my_bottle/Bottle"
import BottleSettings from "../my_bottle/BottleSettings"
import BottleActivity from "../my_bottle/BottleActivity"
import BottleIntake from "../my_bottle/BottleIntake"


export default function MyBottle() {
    // Mini navbar state for content sections
    const [activeSection, setActiveSection] = useState("intake")
    // Bottle connection state
    const [isBottleConnected, setIsBottleConnected] = useState(false)
    // Ref to access Bottle's refresh function
    const bottleRef = useRef(null)

    return (
        <div className="w-full flex flex-col items-center justify-center gap-8 min-h-[500px] max-w-[1400px] mx-auto px-4">
            {/* Goal Overview and Bottle Visualization */}
            <Bottle ref={bottleRef} onConnectionChange={setIsBottleConnected} />

            {/* Desktop Layout: Stacked vertically */}
            {isBottleConnected && (
                <div className="w-full flex flex-col items-center justify-center gap-6 lg:gap-8">
                    {/* Mini Navbar - Horizontal on all screen sizes */}
                    <div className="w-full max-w-[900px] bg-white/80 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/40 dark:border-slate-700/40 p-2">
                        <div className="flex items-center justify-between gap-2">
                            <button
                                onClick={() => setActiveSection("intake")}
                                className={`flex-1 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-300 ease-in-out transform ${
                                    activeSection === "intake"
                                        ? "bg-blue-500 text-white shadow-md scale-105"
                                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700/50 hover:scale-102 active:scale-95"
                                }`}
                            >
                                Intake
                            </button>
                            <button
                                onClick={() => setActiveSection("settings")}
                                className={`flex-1 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-300 ease-in-out transform ${
                                    activeSection === "settings"
                                        ? "bg-blue-500 text-white shadow-md scale-105"
                                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700/50 hover:scale-102 active:scale-95"
                                }`}
                            >
                                Settings
                            </button>
                            <button
                                onClick={() => setActiveSection("activity")}
                                className={`flex-1 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-300 ease-in-out transform ${
                                    activeSection === "activity"
                                        ? "bg-blue-500 text-white shadow-md scale-105"
                                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700/50 hover:scale-102 active:scale-95"
                                }`}
                            >
                                Activity
                            </button>
                        </div>
                    </div>

                    {/* Dynamic Content Box */}
                    <div className="w-full max-w-[900px] bg-white/80 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/40 dark:border-slate-700/40 p-6 lg:p-8">
                        {activeSection === "intake" ? (
                            <BottleIntake onDataChange={() => bottleRef.current?.refreshBottleData()} />
                        ) : activeSection === "settings" ? (
                            <BottleSettings onDataChange={() => bottleRef.current?.refreshBottleData()} />
                        ) : activeSection === "activity" ? (
                            <BottleActivity />
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    )
}