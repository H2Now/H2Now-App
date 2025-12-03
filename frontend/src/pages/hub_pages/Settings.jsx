import { useState } from "react"

import Swtich from "../../components/Swtich"
import SegmentedControl from "../../components/SegmentedControl"
import Dropdown from "../../components/Dropdown"

export default function Settings() {
    const API_URL = import.meta.env.VITE_API_URL || 'localhost:5000'
    const [darkMode, setDarkMode] = useState(false)
    const [unit, setUnit] = useState("l")
    const [reminderFreq, setReminderFreq] = useState(60)
    const [reminderEnabled, setReminderEnabled] = useState(false)
    
    const reminderOptions = [
        {value: 30, label: "30 mins"},
        {value: 60, label: "1 hour"},
        {value: 90, label: "1.5 hour"},
        {value: 120, label: "2 hours"},
        {value: 180, label: "3 hours"},
        {value: 240, label: "4 hours"},
    ]

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
                setReminderEnabled(data.preferences.reminderEnabled)
                setReminderFreq(data.preferences.reminderFreq)
            }
        } catch (error) {
            alert("Failed to fetch user settings", error)
        }
    }

    const savePreferences = async () => {
        try {
            
        } catch (error) {

        }
    }

    // pr-[37px]
    return (
        <div className="min-w-[320px] min-h-[644px] flex flex-col items-center">
            <div className="w-[293px] h-[75px] mt-[50px] mb-[12.5px] pr-[25px] bg-white/80 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/40 dark:border-slate-700/40 flex items-center justify-between px-4">
                <p className="ml-[3px] text-[20px] font-semibold text-gray-900 dark:text-gray-100">Dark Mode</p>
                <Swtich state={darkMode} setState={setDarkMode} />
            </div>

            <div className="w-[293px] h-[75px] my-[12.5px] pr-[16px] bg-white/80 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/40 dark:border-slate-700/40 flex items-center justify-between px-4">
                <p className="ml-[3px] text-[20px] font-semibold text-gray-900 dark:text-gray-100">Units</p>
                <SegmentedControl state={unit} setState={setUnit} />
            </div>

            <div className="w-[293px] h-[75px] my-[12.5px] pr-[16px] bg-white/80 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/40 dark:border-slate-700/40 relative flex items-center justify-between px-4">
                <p className="ml-[3px] text-[20px] font-semibold text-gray-900 dark:text-gray-100">Notifications</p>
                <Dropdown />
            </div>
        </div>
    )
}
