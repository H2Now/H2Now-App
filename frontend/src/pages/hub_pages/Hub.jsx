import { useState } from "react"
import Header from "../../components/Header"
import MyBottle from "./MyBottle"
import Settings from "./Settings"
import Navbar from "../../components/Navbar"
import Account from "./Account"
import SplashScreen from "../../components/SplashScreen"

export default function Hub() {
  const [activePage, setActivePage] = useState("bottle")
  const [showSplashScreen, setShowSplashScreen] = useState(!sessionStorage.getItem("splashShown"))

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

  const handleSplashEnd = () => {
    setShowSplashScreen(false)
    sessionStorage.setItem("splashShown", null)
  }

  return (
    <>
      {showSplashScreen && <SplashScreen onFinish={handleSplashEnd} />}

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 z-0">
        <Header text="H2Now" />
        <div className="overflow-auto flex justify-center px-4 pb-28 sm:pb-8 sm:pl-[116px]">
          <div className="w-full flex justify-center py-8">
            {renderPage()}
          </div>
        </div>

        <Navbar page="Hub" activePage={activePage} setActivePage={setActivePage} />
      </div>
    </>
  )
}
