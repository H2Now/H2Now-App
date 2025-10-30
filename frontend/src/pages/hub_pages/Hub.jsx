import Header from "../../components/Header"
import MyBottle from "./MyBottle"
import Settings from "./Settings"
import MobileNavbar from "../../components/MobileNavbar"

export default function Hub() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header text="H2Now" />
      <div className="h-[calc(100vh-200px)] sm:h-[100vh] overflow-auto flex justify-center">
        <div className="w-full flex justify-center py-8">
          <MyBottle />
        </div>
      </div>

      <MobileNavbar page="Hub" />
    </div>
  )
}
