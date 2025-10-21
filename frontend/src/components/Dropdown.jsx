import { useState } from "react"

import DropdownArrow from "../assets/icons/dropdown.png"
import Switch from "./Swtich"

export default function Dropdown() {
    const [open, setOpen] = useState(false),
        [notifications, setNotifications] = useState(false),
        [vibration, setVibration] = useState(false),
        [alerts, setAlerts] = useState(false)

    return (
        <>
            <div className="w-[35px] h-[35px] bg-[#E9E9E9] rounded-[10px] flex items-center justify-center">
                <img
                    src={DropdownArrow}
                    className={`
                        w-7 h-7 cursor-pointer transition-rotate duration-200
                        ${open ? 'rotate-180' : 'rotate-0'}
                    `}
                    onClick={() => setOpen(!open)}
                />
            </div>

            <div className={`
                w-full h-auto mt-[5px] overflow-y-scroll px-[15px] py-[10px] bg-[#CCC] rounded-[10px] absolute top-full left-0 transition-opacity duration-200
                ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
            `}>
                <div className="h-[35px] flex items-center justify-between">
                    <p className="text-[14px]">Send Notifications</p>
                    <Switch state={notifications} setState={setNotifications} />
                </div>
                
                <div className={`${!notifications ? 'opacity-50 pointer-events-none' : ''} h-[35px] flex items-center justify-between`}>
                    <p className="text-[14px]">Bottle Vibration</p>
                    <Switch state={vibration} setState={setVibration} />
                </div>

                <div className={`${!notifications ? 'opacity-50 pointer-events-none' : ''} h-[35px] flex items-center justify-between`}>
                    <p className="text-[14px]">Application Alerts</p>
                    <Switch state={alerts} setState={setAlerts} />
                </div>
            </div>
        </>
    )
}
