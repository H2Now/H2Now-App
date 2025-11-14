import { useState } from "react"

import Swtich from "../../components/Swtich"
import SegmentedControl from "../../components/SegmentedControl"
import Dropdown from "../../components/Dropdown"

export default function Settings() {
    const [darkMode, setDarkMode] = useState(false)
    const [unit, setUnit] = useState("l")

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
