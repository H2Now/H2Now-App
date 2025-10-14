import Camera from "../../assets/icons/camera.png"
import Settings from "../../assets/icons/settings.png"
import Logout from "../../assets/icons/logout.png"

export default function Account() {
    return (
        <div className="h-full flex flex-col justify-center">
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

            <div className="w-full pt-[25px] flex justify-center">
                <div className="w-[150px] h-[50px] bg-blue-400 hover:bg-blue-500 transition-colors duration-250 rounded-[5px] flex items-center justify-center cursor-pointer">
                    <img src={Settings} className="w-7 h-7" />
                    <p className="text-[16px] text-[#161616] pl-[15px]">Settings</p>
                </div>

                <div className="w-[150px] h-[50px] ml-[40px] bg-red-500 hover:bg-red-600 transition-colors duration-250 rounded-[5px] flex items-center justify-center cursor-pointer">
                    <img src={Logout} className="w-7 h-7" />
                    <p className="text-[16px] text-[#161616] pl-[15px]">Log Out</p>
                </div>
            </div>
        </div>
    )
}
