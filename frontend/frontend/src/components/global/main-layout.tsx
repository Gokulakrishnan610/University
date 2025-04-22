import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "../provider/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { BrowserRouter } from "react-router"

type Props = {
    children: React.ReactNode
}

const queryClient = new QueryClient()

export const MainLayout = ({ children }: Props) => {
    return (
           <QueryClientProvider client={queryClient}>
              <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                <BrowserRouter>
                {children}
                </BrowserRouter>
                <Toaster />
              </ThemeProvider>
        </QueryClientProvider> 
    )
}
