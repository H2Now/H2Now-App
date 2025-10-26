import Header from "../../components/Header"
import MyBottle from "./MyBottle"
import Settings from "./Settings"
import MobileNavbar from "../../components/MobileNavbar"

export default function Hub() {
    return (
        <>
            <Header text="H2Now" />

            <div className="h-[calc(100vh-200px)] sm:h-[100vh] overflow-scroll">
                <MyBottle />
            </div>

            <MobileNavbar page="Hub" />
        </>
    )
}
