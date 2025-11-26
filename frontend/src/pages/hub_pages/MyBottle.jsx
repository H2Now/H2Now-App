import { useState, useRef } from "react"
import Bottle from "../my_bottle/Bottle"
import BottleSettings from "../my_bottle/BottleSettings"
import BottleActivity from "../my_bottle/BottleActivity"

export default function MyBottle() {
    const [activeSection, setActiveSection] = useState("intake")
    const [isBottleConnected, setIsBottleConnected] = useState(false)
    const bottleRef = useRef(null)

    return (
        <div className="w-full flex flex-col items-center justify-center gap-8 min-h-[500px] max-w-[1400px] mx-auto px-4">

            {/* Bottle Section */}
            <Bottle ref={bottleRef} onConnectionChange={setIsBottleConnected} />

            {/* FULL LAYOUT (second layout block) */}
            {isBottleConnected && (
                <div className="w-full flex flex-col lg:flex-row items-start justify-center gap-6 lg:gap-8">

                    {/* Side Mini Navbar */}
                    <div className="w-full lg:w-auto lg:min-w-[320px] bg-white/80 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/40 dark:border-slate-700/40 p-2 lg:sticky lg:top-8">

                        <div className="flex lg:flex-col items-center lg:items-stretch justify-between gap-2">
                            <button
                                onClick={() => setActiveSection("intake")}
                                className={`flex-1 lg:w-full px-4 py-3 rounded-lg font-medium text-sm transition-all duration-300 ease-in-out transform ${
                                    activeSection === "intake"
                                        ? "bg-blue-500 text-white shadow-md scale-105"
                                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700/50 hover:scale-102 active:scale-95"
                                }`}
                            >
                                Intake
                            </button>

                            <button
                                onClick={() => setActiveSection("settings")}
                                className={`flex-1 lg:w-full px-4 py-3 rounded-lg font-medium text-sm transition-all duration-300 ease-in-out transform ${
                                    activeSection === "settings"
                                        ? "bg-blue-500 text-white shadow-md scale-105"
                                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700/50 hover:scale-102 active:scale-95"
                                }`}
                            >
                                Settings
                            </button>

                            <button
                                onClick={() => setActiveSection("statistics")}
                                className={`flex-1 lg:w-full px-4 py-3 rounded-lg font-medium text-sm transition-all duration-300 ease-in-out transform ${
                                    activeSection === "statistics"
                                        ? "bg-blue-500 text-white shadow-md scale-105"
                                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700/50 hover:scale-102 active:scale-95"
                                }`}
                            >
                                Activity
                            </button>
                        </div>
                    </div>

                    {/* MAIN CONTENT BOX */}
                    <div className="w-full lg:flex-1 lg:max-w-[900px] bg-white/80 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/40 dark:border-slate-700/40 p-6 lg:p-8">

                        {activeSection === "settings" ? (
                            <BottleSettings onDataChange={() => bottleRef.current?.refreshBottleData()} />
                        ) : activeSection === "statistics" ? (
                            <BottleActivity />
                        ) : (
                            <>
                                <h4 className="text-xl lg:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4 capitalize">
                                    {activeSection}
                                </h4>

                                <div className="text-gray-600 dark:text-gray-400 text-center py-8">
                                    Content goes here
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}