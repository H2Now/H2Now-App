import { useState, useEffect } from "react"

import Switch from "../../components/Switch"
import SegmentedControl from "../../components/SegmentedControl"
import Dropdown from "../../components/Dropdown"

export default function Settings() {
    // Load preferences from localStorage (default: light mode)
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode')
        return saved ? JSON.parse(saved) : false
    })

    // Load preferences from localStorage (default: ml)
    const [unit, setUnit] = useState(() => {
        return localStorage.getItem('unitPreference') || 'ml'
    })

    // Save dark mode preference and apply it to UI
    useEffect(() => {
        localStorage.getItem('darkMode', JSON.stringify(darkMode))
        console.log(darkMode)
        if (darkMode) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }, [darkMode])

    // Save unit preference 
    useEffect(() => {
        console.log(unit)
        localStorage.setItem('unitPreference', unit)
    }, [unit])

    return (
        <div className="min-w-[320px] min-h-[644px] flex flex-col items-center">
            <div className="w-[293px] h-[75px] mt-[50px] mb-[12.5px] pr-[25px] bg-white/80 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/40 dark:border-slate-700/40 flex items-center justify-between px-4">
                <p className="ml-[3px] text-[20px] font-semibold text-gray-900 dark:text-gray-100">Dark Mode</p>
                <Switch state={darkMode} setState={setDarkMode} />
            </div>

            <div className="w-[293px] h-[75px] my-[12.5px] pr-[16px] bg-white/80 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/40 dark:border-slate-700/40 flex items-center justify-between px-4">
                <p className="ml-[3px] text-[20px] font-semibold text-gray-900 dark:text-gray-100">Units</p>
                <SegmentedControl state={unit} setState={setUnit} options={['ml', 'oz']} />
            </div>

            <div className="w-[293px] h-[75px] my-[12.5px] pr-[16px] bg-white/80 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/40 dark:border-slate-700/40 relative flex items-center justify-between px-4">
                <p className="ml-[3px] text-[20px] font-semibold text-gray-900 dark:text-gray-100">Notifications</p>
                <Dropdown />
            </div>
        </div>
    )
}
