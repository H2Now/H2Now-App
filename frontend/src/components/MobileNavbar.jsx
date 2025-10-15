import Account from "../assets/icons/account.png"
import Bottle from "../assets/icons/bottle.png"
import Settings from "../assets/icons/settings.png"

export default function MobileNavbar() {
    return (
        <div className="w-full h-[100px] bg-[#AFAFAF] rounded-t-[15px] flex items-center justify-evenly block sm:hidden">
            <div className="w-[75px] h-[75px] flex flex-col items-center justify-evenly cursor-pointer">
                <img src={Account} className="w-8 h-8" />
                <p className="text-[12px] text-[#161616]">Account</p>
            </div>
            <div className="w-[75px] h-[75px] flex flex-col items-center justify-evenly cursor-pointer">
                <img src={Bottle} className="w-8 h-8" />
                <p className="text-[12px] text-[#161616]">My Bottle</p>
            </div>
            <div className="w-[75px] h-[75px] flex flex-col items-center justify-evenly cursor-pointer">
                <img src={Settings} className="w-8 h-8" />
                <p className="text-[12px] text-[#161616]">Settings</p>
            </div>
        </div>
    )
}
