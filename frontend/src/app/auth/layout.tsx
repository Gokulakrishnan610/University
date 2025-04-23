import { Outlet } from "react-router"

const Layout = () => {
    return (
        <div className="flex justify-center w-full items-center h-screen">
            <Outlet/>
        </div>
    )
}

export default Layout