import { Outlet } from "react-router"

const Layout = () => {
    return (
        <div className="flex justify-center items-center h-screen">
            <div className="w-1/2 h-full bg-secondary">

            </div>
            <div className="w-1/2">
            <Outlet/>
            </div>
        </div>
    )
}

export default Layout