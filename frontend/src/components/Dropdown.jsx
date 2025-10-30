import { useState } from "react"

import Switch from "./Swtich"

export default function Dropdown() {
    const [open, setOpen] = useState(false),
        [notifications, setNotifications] = useState(false),
        [vibration, setVibration] = useState(false),
        [alerts, setAlerts] = useState(false)

    return (
        <>
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setOpen(!open)}
                    className="w-[40px] h-[40px] bg-slate-100 dark:bg-slate-600/70 rounded-lg flex items-center justify-center border border-gray-200/40 dark:border-slate-600/30 shadow-sm"
                    aria-expanded={open}
                    aria-haspopup="true"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        className={`w-5 h-5 text-gray-700 dark:text-gray-100 transition-transform duration-200 ${open ? 'rotate-180' : 'rotate-0'}`}
                        strokeWidth={1.75}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 8l4 4 4-4" />
                    </svg>
                </button>

                <div className={`absolute right-0 mt-2 w-[260px] max-h-56 overflow-auto px-4 py-3 bg-white dark:bg-slate-700/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/40 dark:border-slate-700/30 transition-all duration-200 ${open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
                    <div className="h-[40px] flex items-center justify-between">
                        <p className="text-[14px] text-gray-800 dark:text-gray-100">Send Notifications</p>
                        <Switch state={notifications} setState={setNotifications} />
                    </div>

                    <div className={`${!notifications ? 'opacity-70 pointer-events-none dark:opacity-70' : ''} h-[40px] flex items-center justify-between mt-3` }>
                        <p className={`${!notifications ? 'text-gray-500 dark:text-gray-200' : 'text-gray-800 dark:text-gray-100'} text-[14px]`}>Bottle Vibration</p>
                        <Switch state={vibration} setState={setVibration} />
                    </div>

                    <div className={`${!notifications ? 'opacity-70 pointer-events-none dark:opacity-70' : ''} h-[40px] flex items-center justify-between mt-3`}>
                        <p className={`${!notifications ? 'text-gray-500 dark:text-gray-200' : 'text-gray-800 dark:text-gray-100'} text-[14px]`}>Application Alerts</p>
                        <Switch state={alerts} setState={setAlerts} />
                    </div>
                </div>
            </div>
        </>
    )
}
