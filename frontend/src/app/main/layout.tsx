import { useState } from "react";
import { Sidebar } from "@/components/global/sidebar";
import { Outlet } from "react-router";
import Header from "@/components/global/header";
import Footer from "@/components/global/footer";
const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-background relative">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="w-full pl-0 md:pl-60 transition-all duration-300">
                <main className="px-4 pb-10">
                    <Header />
                    <Outlet />
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default Layout;