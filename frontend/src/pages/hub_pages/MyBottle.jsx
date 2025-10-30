import { useState } from "react"

import Add from "../../assets/icons/add.png"
import Go from "../../assets/icons/go.png"

export default function MyBottle() {
    const [connectedBottle, setConnectedBottle] = useState("Sam's Bottle")

    return (
        <div className="w-full h-full flex flex-col items-center justify-center min-h-[200px]">
            <p className="font-bold text-[24px] px-[15px] text-center [@media_(min-width:270px)_and_(max-width:349px)]:text-[18px] [@media(max-width:269px)]:text-[12px]">
                {connectedBottle === "" ? "Add your new bottle" : <>You are connected to bottle<br/>{connectedBottle}</>}
            </p>

            <div className="w-[200px] h-[50px] mt-[25px] bg-[#00EA42] rounded-[5px] flex items-center justify-center cursor-pointer [@media(max-width:250px)]:w-[130px]">
                <img src={connectedBottle === "" ? Add : Go} className="w-7 h-7 [@media(max-width:250px)]:w-5 [@media(max-width:250px)]:h-5" />
                <p className="font-bold text-[16px] ml-[10px] [@media(max-width:250px)]:text-[14px]">
                    {connectedBottle === "" ? "New Bottle" : "Open Bottle"}
                </p>
            </div>
        </div>
    )
}
