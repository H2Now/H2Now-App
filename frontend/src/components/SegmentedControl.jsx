export default function SegmentedControl({ state, setState }) {
    return (
    <div className="w-[110px] h-[44px] bg-slate-50 dark:bg-slate-700/80 rounded-[12px] relative flex items-center shadow-sm border border-gray-200/40 dark:border-slate-700/40">
            {/* moving indicator: cover half the container and move between left-0 and left-1/2 */}
            {/* indicator covers exactly one half of the container and snaps between left-0 and left-1/2 to avoid fractional gaps */}
            <div className={`absolute top-1 bottom-1 w-1/2 rounded-[10px] bg-gradient-to-r from-blue-500 to-cyan-500 shadow-md transition-all duration-200 ${state === 'oz' ? 'left-1/2' : 'left-0'}`} />

            <button
                type="button"
                onClick={() => setState('ml')}
                className={`relative z-10 flex-1 h-full flex items-center justify-center text-sm font-medium transition-colors ${state === 'ml' ? 'text-white' : 'text-slate-600 dark:text-gray-200'}`}
                aria-pressed={state === 'ml'}
            >
                ml
            </button>

            <button
                type="button"
                onClick={() => setState('oz')}
                className={`relative z-10 flex-1 h-full flex items-center justify-center text-sm font-medium transition-colors ${state === 'oz' ? 'text-white' : 'text-slate-600 dark:text-gray-200'}`}
                aria-pressed={state === 'oz'}
            >
                oz
            </button>
        </div>
    )
}
