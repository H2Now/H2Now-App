import { useState } from "react"

import Edit from "../../assets/icons/edit.png"
import Reset from "../../assets/icons/reset.png"
import Bin from "../../assets/icons/bin.png"
import Back from "../../assets/icons/back.png"
import Checkmark from "../../assets/icons/checkmark.png"

export default function BottleSettings() {
    const [action, setAction] = useState("")

    return (
        <>
            <div className={`
                w-full h-[100vh] absolute top-0 left-0 bg-black/70 flex items-center justify-center z-1 transition-opacity duration-250
                ${action != "" ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
            `}>
                <div className="w-[293px] h-[350px] bg-[#E9E9E9] rounded-[15px] flex flex-col items-center">
                    <p className="text-[#161616] text-[32px] mt-[10px] font-medium">{action}</p>
                    {action.includes("Edit") ? (
                        <>
                            <div className="flex flex-col mt-[60px]">
                                <p>New value:</p>
                                <input
                                    className="w-[220px] h-[50px] bg-[#CECECE] rounded-[10px] pl-[10px] text-[14px] mt-[5px]"
                                    type="text"
                                    placeholder="Enter new value here"
                                    defaultValue={action === "Edit Name" ? "Sam's Bottle" : "2L"}
                                />
                                <p className="w-full text-[#FF0000] text-[14px] mt-[5px] text-center">Error Message</p>
                            </div>

                            <div className="w-[200px] h-[50px] mt-[48px] bg-[#00EA42] rounded-[5px] flex items-center justify-center cursor-pointer">
                                <img src={Checkmark} className="w-7 h-7" />
                                <p className="font-bold ml-[5px]">Apply Changes</p>
                            </div>
                        </>
                    ) :
                        <>
                            <p className="font-light text-[16px] px-[25px] mt-[25px] text-center">Are you sure you want to {action.toLowerCase()} of your bottle?</p>
                            <p className="font-bold text-[16px] px-[25px] mt-[10px] text-center">Warning: This action is irreversible</p>
                            <div
                                className="w-[200px] h-[50px] mt-[35px] bg-[#00EA42] rounded-[5px] flex items-center justify-center cursor-pointer"
                                onClick={() => setAction("")}
                            >
                                <img src={Back} className="w-7 h-7" />
                                <p className="ml-[10px] font-bold text-[16px]">Go Back</p>
                            </div>
                            <div className="w-[200px] h-[50px] mt-[10px] bg-[#D20004] rounded-[5px] flex items-center justify-center cursor-pointer">
                                <img src={Back} className="w-7 h-7" />
                                <p className="ml-[10px] font-bold text-[16px]">{action}</p>
                            </div>
                        </>
                    }
                </div>
            </div>

            <div className="w-full h-full flex items-center justify-center">
                <div className="w-[293px] h-[475px] flex flex-col items-center justify-between">
                    <div
                        className="w-[293px] h-[75px] bg-[#CCC] rounded-[15px] flex items-center justify-center cursor-pointer"
                        onClick={() => setAction("Edit Name")}
                    >
                        <img src={Edit} className="w-8 h-8" />
                        <p className="font-medium text-[24px] ml-[15px]">Edit bottle's name</p>
                    </div>
                    <div
                        className="w-[293px] h-[75px] bg-[#CCC] rounded-[15px] flex items-center justify-center cursor-pointer"
                        onClick={() => setAction("Edit Goal")}
                    >
                        <img src={Edit} className="w-8 h-8" />
                        <p className="font-medium text-[24px] ml-[15px]">Edit bottle's goal</p>
                    </div>
                    <div
                        className="w-[293px] h-[75px] bg-[#D2D200] rounded-[15px] flex items-center justify-center cursor-pointer"
                        onClick={() => setAction("Reset Intake")}
                    >
                        <img src={Reset} className="w-8 h-8" />
                        <p className="font-medium text-[24px] ml-[15px]">Reset intake</p>
                    </div>
                    <div
                        className="w-[293px] h-[75px] bg-[#D2D200] rounded-[15px] flex items-center justify-center cursor-pointer"
                        onClick={() => setAction("Reset Statistics")}
                    >
                        <img src={Reset} className="w-8 h-8" />
                        <p className="font-medium text-[24px] ml-[15px]">Reset statistics</p>
                    </div>
                    <div
                        className="w-[293px] h-[75px] bg-[#D20004] rounded-[15px] flex items-center justify-center cursor-pointer"
                        onClick={() => setAction("Delete Bottle")}
                    >
                        <img src={Bin} className="w-8 h-8" />
                        <p className="font-medium text-[24px] ml-[15px]">Delete bottle</p>
                    </div>
                </div>
            </div>
        </>
    )
}
