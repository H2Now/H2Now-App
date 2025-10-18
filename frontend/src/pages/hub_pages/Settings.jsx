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
            <div className="w-[293px] h-[75px] mt-[50px] mb-[12.5px] pr-[25px] bg-[#CCC] rounded-[15px] flex items-center justify-between">
                <p className="ml-[15px] text-[24px]">Dark Mode</p>
                <Swtich state={darkMode} setState={setDarkMode} />
            </div>

            <div className="w-[293px] h-[75px] my-[12.5px] pr-[16px] bg-[#CCC] rounded-[15px] flex items-center justify-between">
                <p className="ml-[15px] text-[24px]">Units</p>
                <SegmentedControl state={unit} setState={setUnit} />
            </div>

            <div className="w-[293px] h-[75px] my-[12.5px] pr-[16px] bg-[#CCC] rounded-[15px] relative flex items-center justify-between">
                <p className="ml-[15px] text-[24px]">Notifications</p>
                <Dropdown />
            </div>
        </div>
    )
}
