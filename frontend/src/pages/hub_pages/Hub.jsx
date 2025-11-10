import { useState } from "react"
import Header from "../../components/Header"
import MyBottle from "./MyBottle"
import Settings from "./Settings"
import MobileNavbar from "../../components/MobileNavbar"
import Account from "./Account"

export default function Hub() {
  const [activePage, setActivePage] = useState("bottle")

  const renderPage = () => {
    switch (activePage) {
      case "account":
        return <Account />
      case "bottle":
        return <MyBottle />
      case "settings":
        return <Settings />
      default:
        return <MyBottle />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header text="H2Now" />
      <div className="overflow-auto flex justify-center px-4 pb-28 sm:pb-8">
        <div className="w-full flex justify-center py-8">
          {renderPage()}
        </div>
      </div>

      <MobileNavbar page="Hub" activePage={activePage} setActivePage={setActivePage} />
    </div>
  )
}
