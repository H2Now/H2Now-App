import { useState, useEffect } from "react"

import Switch from "../../components/Switch"
import SegmentedControl from "../../components/SegmentedControl"
import Dropdown from "../../components/Dropdown"

export default function Settings() {
    const API_URL = import.meta.env.VITE_API_URL || 'localhost:5000'

    // ---- LocalStorage settings ----
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode')
        return saved ? JSON.parse(saved) : false
    })

    const [unit, setUnit] = useState(() => {
        return localStorage.getItem('unitPreference') || 'ml'
    })

    // ---- Backend settings ----
    const [reminderFreq, setReminderFreq] = useState(1)
    const [bottleAlertEnabled, setBottleAlertEnabled] = useState(false)

    // ---- Load backend prefs once ----
    useEffect(() => {
        fetchPreferences()
    }, [])

    const fetchPreferences = async () => {
        try {
            const res = await fetch(`${API_URL}/user/preferences`, {
                credentials: "include"
            })
            const data = await res.json()

            if (res.ok && data.success) {
                setBottleAlertEnabled(data.preferences.bottleAlertEnabled)
                setReminderFreq(data.preferences.reminderFreq)
            }
        } catch (error) {
            console.error("Failed to fetch user settings:", error)
        }
    }

    // ---- Save backend prefs ----
    const savePreferences = async () => {
        try {
            const res = await fetch(`${API_URL}/user/preferences`, {
                method: "PATCH",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify({
                    reminderFreq,
                    bottleAlertEnabled
                })
            })
            const data = await res.json()
            if (!res.ok || !data.success) {
                console.log(data.message || "Failed to save settings")
            }
        } catch (error) {
            console.error("Failed to save settings:", error)
        }
    }

    // ---- Save localStorage prefs ----
    useEffect(() => {
        localStorage.setItem('darkMode', JSON.stringify(darkMode))
        if (darkMode) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }, [darkMode])

    useEffect(() => {
        localStorage.setItem('unitPreference', unit)
    }, [unit])

    return (
        <div className="min-w-[320px] min-h-[644px] flex flex-col items-center max-w-[600px] mx-auto px-4">
            
            {/* Dark Mode */}
            <div className="w-full max-w-[500px] h-auto mt-[50px] mb-[12.5px] pr-[25px] lg:pr-[30px] bg-white/80 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/40 dark:border-slate-700/40 flex items-center justify-between px-4 lg:px-6 py-5 lg:py-6">
                <p className="ml-[3px] text-[20px] lg:text-[24px] font-semibold text-gray-900 dark:text-gray-100">Dark Mode</p>
                <Switch state={darkMode} setState={setDarkMode} />
            </div>

            {/* Unit */}
            <div className="w-full max-w-[500px] h-auto my-[12.5px] pr-[16px] lg:pr-[20px] bg-white/80 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/40 dark:border-slate-700/40 flex items-center justify-between px-4 lg:px-6 py-5 lg:py-6">
                <p className="ml-[3px] text-[20px] lg:text-[24px] font-semibold text-gray-900 dark:text-gray-100">Units</p>
                <SegmentedControl state={unit} setState={setUnit} options={['ml', 'oz']} />
            </div>

            {/* Notifications */}
            <div className="w-full max-w-[500px] h-auto my-[12.5px] pr-[16px] lg:pr-[20px] bg-white/80 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/40 dark:border-slate-700/40 relative flex items-center justify-between px-4 lg:px-6 py-5 lg:py-6">
                <p className="ml-[3px] text-[20px] lg:text-[24px] font-semibold text-gray-900 dark:text-gray-100">Notifications</p>
                <Dropdown 
                    bottleAlertEnabled={bottleAlertEnabled}
                    setBottleAlertEnabled={setBottleAlertEnabled}
                    reminderFreq={reminderFreq}
                    setReminderFreq={setReminderFreq}
                    onSave={savePreferences}
                />
            </div>

        </div>
    )
}
