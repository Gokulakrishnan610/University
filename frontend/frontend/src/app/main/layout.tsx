import { Sidebar } from "@/components/global/sidebar"
import { Outlet } from "react-router"
import { Header } from "@/components/global/info-bar"

const Layout = () => {
    return (
        <div className="w-full h-full">
            <Header toggleSidebar={() => {}}/>
            <Outlet/>
            {/* <Sidebar isOpen={false} onClose={() => {}} /> */}
        </div>
    )
}

export default Layout