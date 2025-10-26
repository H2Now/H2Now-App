import Account from "../assets/icons/account.png"
import Bottle from "../assets/icons/bottle.png"
import Settings from "../assets/icons/settings.png"
import Statistics from "../assets/icons/trend.png"

export default function MobileNavbar({ page }) {
    return (
        <div className="w-full h-[100px] bg-[#AFAFAF] rounded-t-[15px] flex items-center justify-evenly block sm:hidden">
            <div className="w-[75px] h-[75px] flex flex-col items-center justify-evenly cursor-pointer [@media_(min-width:200px)_(max-width:299px)]:w-[50px] [@media(max-width:199px)]:w-[40px]">
                <img src={page === "Hub" ? Account : Settings} className="w-8 h-8 [@media(max-width:199px)]:w-6 [@media(max-width:199px)]:h-6" />
                <p className="text-[12px] text-[#161616] [@media(max-width:199px)]:text-[10px]">{page === "Hub" ? "Account" : "Settings"}</p>
            </div>
            <div className="w-[75px] h-[75px] flex flex-col items-center justify-evenly cursor-pointer [@media_(min-width:200px)_(max-width:299px)]:w-[50px] [@media(max-width:199px)]:w-[40px]">
                <img src={Bottle} className="w-8 h-8 [@media(max-width:199px)]:w-6 [@media(max-width:199px)]:h-6" />
                <p className="text-[12px] text-[#161616] [@media_(min-width:200px)_(max-width:299px)]:text-[10px] [@media(max-width:199px)]:text-[8.5px]">My Bottle</p>
            </div>
            <div className="w-[75px] h-[75px] flex flex-col items-center justify-evenly cursor-pointer [@media_(min-width:200px)_(max-width:299px)]:w-[50px] [@media(max-width:199px)]:w-[40px]">
                <img src={page === "Hub" ? Settings : Statistics} className="w-8 h-8 [@media(max-width:199px)]:w-6 [@media(max-width:199px)]:h-6" />
                <p className="text-[12px] text-[#161616] [@media(max-width:199px)]:text-[10px]">{page === "Hub" ? "Settings" : "Statistics"}</p>
            </div>
        </div>
    )
}
