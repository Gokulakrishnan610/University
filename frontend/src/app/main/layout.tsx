import { useState } from "react";
import { Sidebar } from "@/components/global/sidebar";
import { Outlet } from "react-router";
import { Header } from "@/components/global/info-bar";

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };
    
    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            
            <div className="w-full pl-0 md:pl-72 transition-all duration-300">
                {/* <Header toggleSidebar={toggleSidebar} /> */}
                <main className="p-4">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;