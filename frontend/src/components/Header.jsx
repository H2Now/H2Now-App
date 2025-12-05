import { useNavigate } from "react-router-dom"

export default function Header({ text }) {
    const navigate = useNavigate()

    return (
        <header className="w-full h-[100px] bg-white/85 dark:bg-slate-900/85 backdrop-blur-sm rounded-b-2xl flex items-center justify-center relative shadow-sm border-b-2 border-blue-400/12 dark:border-slate-700/30 px-6">
            <p className="text-gray-900 dark:text-white text-4xl font-semibold [@media(max-width:199px)]:text-3xl">{text}</p>
            
            {/* Bell Icon - Reminders */}
            <button
                onClick={() => navigate('/reminders')}
                className="absolute right-6 w-12 h-12 flex items-center justify-center rounded-full bg-blue-100 dark:bg-slate-700 hover:bg-blue-200 dark:hover:bg-slate-600 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
                aria-label="View reminders"
            >
                <svg 
                    className="w-6 h-6 text-blue-600 dark:text-blue-400" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                >
                    <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
                    />
                </svg>
            </button>
        </header>
    )
}
