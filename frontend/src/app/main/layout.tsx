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
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} toggleSidebar={toggleSidebar} />
            
            <div className="w-full px-4">
                <Header toggleSidebar={toggleSidebar} />
                <main className="flex-1">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;