import Header from "../../components/Header"
import MobileNavbar from "../../components/MobileNavbar"

export default function Hub() {
    return (
        <>
            <Header text="H2Now" />

            <div className="h-[calc(100vh-200px)]"></div>

            <MobileNavbar />
        </>
    )
}
