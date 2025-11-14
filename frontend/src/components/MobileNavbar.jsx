import Account from "../assets/icons/account.png"
import Bottle from "../assets/icons/bottle.png"
import Settings from "../assets/icons/settings.png"
import Statistics from "../assets/icons/trend.png"

export default function MobileNavbar({ page, activePage, setActivePage }) {
    return (
        <nav className="fixed bottom-0 left-0 right-0 w-full h-[100px] bg-white/90 dark:bg-slate-900/85 backdrop-blur-sm rounded-t-2xl flex items-center justify-evenly sm:hidden shadow-inner border-t-2 border-blue-400/12 dark:border-slate-700/30 z-40">
            <button 
                onClick={() => setActivePage("account")}
                aria-label="Account" 
                className={`w-[75px] h-[75px] flex flex-col items-center justify-evenly [@media_(min-width:200px)_(max-width:299px)]:w-[50px] [@media(max-width:199px)]:w-[40px] ${activePage === "account" ? "opacity-100" : "opacity-60"}`}
            >
                <div className="relative flex items-center justify-center w-9 h-9">
                    <span className={`absolute inset-0 m-auto w-9 h-9 rounded-full ${activePage === "account" ? "bg-blue-500/20 dark:bg-blue-400/20" : "bg-blue-500/8 dark:bg-white/6"}`} />
                    <img src={Account} className="relative z-10 w-6 h-6 dark:[filter:invert(1)_brightness(2)] [@media(max-width:199px)]:w-5 [@media(max-width:199px)]:h-5" alt="Account" />
                </div>
                <p className="text-[12px] text-gray-900 dark:text-gray-100 [@media(max-width:199px)]:text-[10px]">Account</p>
            </button>

            <button 
                onClick={() => setActivePage("bottle")}
                aria-label="My Bottle" 
                className={`w-[75px] h-[75px] flex flex-col items-center justify-evenly [@media_(min-width:200px)_(max-width:299px)]:w-[50px] [@media(max-width:199px)]:w-[40px] ${activePage === "bottle" ? "opacity-100" : "opacity-60"}`}
            >
                <div className="relative flex items-center justify-center w-9 h-9">
                    <span className={`absolute inset-0 m-auto w-9 h-9 rounded-full ${activePage === "bottle" ? "bg-blue-500/20 dark:bg-blue-400/20" : "bg-blue-500/8 dark:bg-white/6"}`} />
                    <img src={Bottle} className="relative z-10 w-6 h-6 dark:[filter:invert(1)_brightness(2)] [@media(max-width:199px)]:w-5 [@media(max-width:199px)]:h-5" alt="My Bottle" />
                </div>
                <p className="text-[12px] text-gray-900 dark:text-gray-100 [@media_(min-width:200px)_(max-width:299px)]:text-[10px] [@media(max-width:199px)]:text-[8.5px]">My Bottle</p>
            </button>

            <button 
                onClick={() => setActivePage("settings")}
                aria-label="Settings" 
                className={`w-[75px] h-[75px] flex flex-col items-center justify-evenly [@media_(min-width:200px)_(max-width:299px)]:w-[50px] [@media(max-width:199px)]:w-[40px] ${activePage === "settings" ? "opacity-100" : "opacity-60"}`}
            >
                <div className="relative flex items-center justify-center w-9 h-9">
                    <span className={`absolute inset-0 m-auto w-9 h-9 rounded-full ${activePage === "settings" ? "bg-blue-500/20 dark:bg-blue-400/20" : "bg-blue-500/8 dark:bg-white/6"}`} />
                    <img src={Settings} className="relative z-10 w-6 h-6 dark:[filter:invert(1)_brightness(2)] [@media(max-width:199px)]:w-5 [@media(max-width:199px)]:h-5" alt="Settings" />
                </div>
                <p className="text-[12px] text-gray-900 dark:text-gray-100 [@media(max-width:199px)]:text-[10px]">Settings</p>
            </button>
        </nav>
    )
}
