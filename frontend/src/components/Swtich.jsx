export default function Switch({ state, setState }) {
    return (
        <div
            className={`
                w-[51px] h-[31px] rounded-[100px] flex items-center transition-bg duration-200 cursor-pointer
                ${state ? 'bg-[#34C759]' : 'bg-[#00000020]'}
            `}
            onClick={() => setState(!state)}
        >
            <div className={`
                w-[27px] h-[27px] ml-[2px] bg-[#FFF] rounded-[100px] transition-transform duration-200
                ${state ? 'translate-x-[20px]' : 'translate-x-0'}
                shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_3px_8px_0_rgba(0,0,0,0.15),0_3px_1px_0_rgba(0,0,0,0.06)]
            `}></div>
        </div>
    )
}
