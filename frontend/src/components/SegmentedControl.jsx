export default function SegmentedControl({ state, setState }) {
    return (
        <div className="w-[75px] h-[50px] bg-[#E9E9E9] rounded-[10px] relative flex items-center justify-evenly">
            <div className={`
                w-[16px] h-[30px] bg-[#CCC] rounded-[5px] absolute top-[9px] left-0 z-0 transition-all duration-200
                ${state === "l" ? 'translate-x-[9px]' : 'w-[32px] translate-x-[34px]'}
            `}></div>

            <div className="w-[16px] z-1 flex align-center justify-center cursor-pointer" onClick={() => setState("l")}>
                <p className="text-[20px]">l</p>
            </div>

            <div className="w-[32px] z-1 flex align-center justify-center cursor-pointer" onClick={() => setState("oz")}>
                <p className="text-[20px]">oz</p>
            </div>
        </div>
    )
}
