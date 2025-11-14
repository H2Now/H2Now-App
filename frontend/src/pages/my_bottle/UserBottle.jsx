import Glass from "../../assets/icons/glass.png"
import Checkmark from "../../assets/icons/checkmark.png"

export default function UserBottle() {
    return (
        <div className="w-full h-full mt-[100px] flex flex-col items-center">
            <div className="w-[334px] h-[160px] flex items-center">
                <img src={Glass} className="w-[160px] h-[160px]" />
                <div className="h-[130px] flex flex-col justify-between">
                    <p className="text-[18px]">Current intake for day 26/10/2025</p>
                    <p className="font-extralight text-[28px]">700ml / 2L</p>
                </div>
            </div>

            <p className="my-[50px] font-light text-[24px] text-center">You have 06:27:54 left<br/>to drink more 1.3L</p>

            <div className="w-[329px] h-[110px] flex flex-col items-center">
                <p className="font-light text-[26px]">Wrong intake calculated?</p>
                <div className="w-full mt-[25px] flex justify-between">
                    <input
                        type="text"
                        className="w-[220px] h-[50px] pl-[10px] bg-[#CECECE] rounded-[10px] text-[14px]"
                        placeholder="Enter actual intake"
                    />
                    <div className="w-[100px] h-[50px] bg-[#00EA42] rounded-[5px] flex items-center justify-center cursor-pointer">
                        <img src={Checkmark} className="w-7 h-7" />
                        <p className="font-bold text-[16px] ml-[5px]">Apply</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
