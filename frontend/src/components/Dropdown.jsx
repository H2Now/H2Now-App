import { useState } from "react"

import Switch from "./Switch"

export default function Dropdown() {
    const [open, setOpen] = useState(false),
        [notifications, setNotifications] = useState(false),
        [vibration, setVibration] = useState(false),
        [alerts, setAlerts] = useState(false),
        [reminderFrequency, setReminderFrequency] = useState(2)

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
                        <p className={`${!notifications ? 'text-gray-500 dark:text-gray-200' : 'text-gray-800 dark:text-gray-100'} text-[14px]`}>Bottle Sound Alerts</p>
                        <Switch state={vibration} setState={setVibration} />
                    </div>

                    <div className={`${!notifications ? 'opacity-70 pointer-events-none dark:opacity-70' : ''} h-[40px] flex items-center justify-between mt-3`}>
                        <p className={`${!notifications ? 'text-gray-500 dark:text-gray-200' : 'text-gray-800 dark:text-gray-100'} text-[14px]`}>Application Alerts</p>
                        <Switch state={alerts} setState={setAlerts} />
                    </div>

                    <div className={`${!notifications ? 'opacity-70 pointer-events-none dark:opacity-70' : ''} mt-4 pt-3 border-t border-gray-200 dark:border-slate-600`}>
                        <label className={`${!notifications ? 'text-gray-500 dark:text-gray-200' : 'text-gray-800 dark:text-gray-100'} text-[14px] block mb-2`}>
                            Reminder Frequency
                        </label>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => setReminderFrequency(Math.max(1, reminderFrequency - 1))}
                                    disabled={!notifications || reminderFrequency <= 1}
                                    className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
                                        !notifications || reminderFrequency <= 1
                                            ? 'bg-gray-100 dark:bg-slate-600/50 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 active:scale-95'
                                    }`}
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                <div className={`${!notifications ? 'bg-gray-100 dark:bg-slate-600/50' : 'bg-white dark:bg-slate-600'} min-w-[60px] px-3 py-2 text-center text-[16px] font-semibold text-gray-800 dark:text-gray-100 rounded-lg border border-gray-300 dark:border-slate-500`}>
                                    {reminderFrequency}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setReminderFrequency(Math.min(24, reminderFrequency + 1))}
                                    disabled={!notifications || reminderFrequency >= 24}
                                    className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
                                        !notifications || reminderFrequency >= 24
                                            ? 'bg-gray-100 dark:bg-slate-600/50 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 active:scale-95'
                                    }`}
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                    </svg>
                                </button>
                            </div>
                            <span className={`${!notifications ? 'text-gray-500 dark:text-gray-200' : 'text-gray-600 dark:text-gray-300'} text-[14px]`}>
                                hour{reminderFrequency !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
