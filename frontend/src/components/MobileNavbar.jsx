import Account from "../assets/icons/account.png"
import Bottle from "../assets/icons/bottle.png"
import Settings from "../assets/icons/settings.png"

export default function MobileNavbar() {
    return (
    <nav className="w-full h-[100px] bg-white/90 dark:bg-slate-900/85 rounded-t-2xl flex items-center justify-evenly block sm:hidden shadow-inner border-t-2 border-blue-400/12 dark:border-slate-700/30">
            <div className="w-[75px] h-[75px] flex flex-col items-center justify-evenly cursor-pointer [@media_(min-width:200px)_(max-width:299px)]:w-[50px] [@media(max-width:199px)]:w-[40px]">
                <div className="relative flex items-center justify-center w-9 h-9">
                    <span className="absolute inset-0 m-auto w-9 h-9 rounded-full bg-blue-500/8 dark:bg-white/6" />
                    <img src={Account} className="relative z-10 w-6 h-6 dark:[filter:invert(1)_brightness(2)] [@media(max-width:199px)]:w-5 [@media(max-width:199px)]:h-5" />
                </div>
                <p className="text-[12px] text-gray-900 dark:text-gray-100 [@media(max-width:199px)]:text-[10px]">Account</p>
            </div>
            <div className="w-[75px] h-[75px] flex flex-col items-center justify-evenly cursor-pointer [@media_(min-width:200px)_(max-width:299px)]:w-[50px] [@media(max-width:199px)]:w-[40px]">
                <div className="relative flex items-center justify-center w-9 h-9">
                    <span className="absolute inset-0 m-auto w-9 h-9 rounded-full bg-blue-500/8 dark:bg-white/6" />
                    <img src={Bottle} className="relative z-10 w-6 h-6 dark:[filter:invert(1)_brightness(2)] [@media(max-width:199px)]:w-5 [@media(max-width:199px)]:h-5" />
                </div>
                <p className="text-[12px] text-gray-900 dark:text-gray-100 [@media_(min-width:200px)_(max-width:299px)]:text-[10px] [@media(max-width:199px)]:text-[8.5px]">My Bottle</p>
            </div>
            <div className="w-[75px] h-[75px] flex flex-col items-center justify-evenly cursor-pointer [@media_(min-width:200px)_(max-width:299px)]:w-[50px] [@media(max-width:199px)]:w-[40px]">
                <div className="relative flex items-center justify-center w-9 h-9">
                    <span className="absolute inset-0 m-auto w-9 h-9 rounded-full bg-blue-500/8 dark:bg-white/6" />
                    <img src={Settings} className="relative z-10 w-6 h-6 dark:[filter:invert(1)_brightness(2)] [@media(max-width:199px)]:w-5 [@media(max-width:199px)]:h-5" />
                </div>
                <p className="text-[12px] text-gray-900 dark:text-gray-100 [@media(max-width:199px)]:text-[10px]">Settings</p>
            </div>
        </nav>
    )
}
