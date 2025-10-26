import Header from "../../components/Header"
import UserBottle from "./UserBottle"
import MobileNavbar from "../../components/MobileNavbar"

export default function Page() {
    return (
        <>
            <Header text="Sam's Bottle" />

            <div className="h-[calc(100vh-200px)] sm:h-[100vh] overflow-scroll">
                <UserBottle />
            </div>

            <MobileNavbar page="My Bottle" />
        </>
    )
}
