import { useState } from "react"

import Camera from "../../assets/icons/camera.png"
import Settings from "../../assets/icons/settings.png"
import Logout from "../../assets/icons/logout.png"
import Back from "../../assets/icons/back.png"

export default function Account() {
    const [modal, setModal] = useState(false)

    return (
        <>
            <div className={`
                w-full h-[100vh] bg-black/70 flex items-center justify-center absolute top-0 left-0 z-1 transition-opacity duration-250
                ${modal ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
            `}>
                <div className="w-[325px] h-[325px] p-[15px] bg-[#FFF] rounded-[15px] flex flex-col items-center justify-evenly [@media_(min-width:300px)_and_(max-width:399px)]:w-[275px] [@media_(min-width:200px)_and_(max-width:299px)]:w-[175px] [@media(max-width:199px)]:w-[125px] [@media_(min-height:350px)_and_(max-height:449px)]:h-[275px] [@media(max-height:349px)]:h-[225px]">
                    <p className="text-[#161616] text-[36px] [@media(max-width:199px)]:text-[26px]">Log Out</p>
                    <p className="text-[#161616] text-[18px] text-center [@media(max-width:199px)]:text-[16px] [@media(max-height:349px)]:text-[12px]">Are you sure you want to log out?</p>
                    <div className="w-full pt-[25px] flex justify-center [@media(max-width:299px)]:h-[150px] [@media(max-width:299px)]:flex-col [@media(max-width:299px)]:items-center [@media(max-width:299px)]:justify-around">
                    <div
                        className="w-[125px] h-[50px] bg-green-400 hover:bg-green-500 transition-colors duration-250 rounded-[5px] flex items-center justify-center cursor-pointer [@media(max-width:199px)]:w-[100px] [@media(max-height:349px)]:h-[30px] [@media(max-width:199px)]:mb-[5px]"
                        onClick={() => setModal(false)}
                    >
                        <img src={Back} className="w-7 h-7  [@media_(min-width:200px)_and_(max-width:399px)]:w-6 [@media_(min-width:200px)_and_(max-width:399px)]:h-6 [@media(max-width:199px)]:w-4 [@media(max-width:199px)]:h-4" />
                        <p className="text-[16px] text-[#161616] pl-[10px] [@media(max-width:399px)]:text-[14px]">Go Back</p>
                    </div>

                    <div className="w-[125px] h-[50px] ml-[20px] bg-red-500 hover:bg-red-600 transition-colors duration-250 rounded-[5px] flex items-center justify-center cursor-pointer [@media(max-width:299px)]:ml-0 [@media(max-width:199px)]:w-[100px] [@media(max-height:349px)]:h-[30px]">
                        <img src={Logout} className="w-7 h-7 [@media_(min-width:200px)_and_(max-width:399px)]:w-6 [@media_(min-width:200px)_and_(max-width:399px)]:h-6 [@media(max-width:199px)]:w-4 [@media(max-width:199px)]:h-4" />
                        <p className="text-[16px] text-[#161616] pl-[10px] [@media(max-width:399px)]:text-[14px]">Log Out</p>
                    </div>
                </div>
                </div>
            </div>

            <div className="min-w-[320px] min-h-[644px] sticky z-0 h-full flex flex-col justify-center">
                <div className="w-full pb-[25px] flex flex-col items-center">
                    <div className="w-24 h-24 bg-[#D9D9D9] hover:bg-[#CECECE] transition-colors duration-250 rounded-full flex items-center justify-center cursor-pointer">
                        <img src={Camera} className="w-12 h-12" />
                    </div>

                    <p className="text-[20px] text-[#161616] mt-[19px]">Welcome, John Bloggs</p>
                </div>

                <div className="w-full h-[240px] pt-[25px] pb-[25px] flex flex-col items-center justify-between">
                    <div>
                        <p className="text-[20px] text-[#161616]">Email:</p>
                        <input
                            className="w-[293px] h-[50px] mt-[5px] pl-[12px] bg-[#CECECE] text-[#646464] rounded-[10px] cursor-text"
                            type="text"
                            value="john.bloggs@gmail.com"
                            disabled
                        />
                    </div>

                    <div>
                        <p className="text-[20px] text-[#161616]">Password:</p>
                        <input
                            className="w-[293px] h-[50px] mt-[5px] pl-[12px] bg-[#CECECE] text-[#646464] rounded-[10px] cursor-text"
                            type="password"
                            value="********"
                            disabled
                        />
                    </div>
                </div>

                <div className="w-full px-[15px] py-[25px] flex justify-center">
                    <div className="w-[150px] h-[50px] bg-blue-400 hover:bg-blue-500 transition-colors duration-250 rounded-[5px] flex items-center justify-center cursor-pointer">
                        <img src={Settings} className="w-7 h-7" />
                        <p className="text-[16px] text-[#161616] pl-[15px]">Settings</p>
                    </div>

                    <div
                        className="w-[150px] h-[50px] ml-[40px] bg-red-500 hover:bg-red-600 transition-colors duration-250 rounded-[5px] flex items-center justify-center cursor-pointer"
                        onClick={() => setModal(true)}
                    >
                        <img src={Logout} className="w-7 h-7" />
                        <p className="text-[16px] text-[#161616] pl-[15px]">Log Out</p>
                    </div>
                </div>
            </div>
        </>
    )
}
