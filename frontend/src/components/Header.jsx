export default function Header({ text }) {
    return (
        <header className="w-full h-[100px] bg-white/85 dark:bg-slate-900/85 backdrop-blur-sm rounded-b-2xl flex items-center justify-center shadow-sm border-b-2 border-blue-400/12 dark:border-slate-700/30">
            <p className="text-gray-900 dark:text-white text-4xl font-semibold [@media(max-width:199px)]:text-3xl">{text}</p>
        </header>
    )
}
