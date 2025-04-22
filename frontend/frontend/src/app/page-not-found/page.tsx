import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { HomeIcon, MoveLeftIcon } from "lucide-react"
import { useNavigate } from "react-router"

const Page = () => {
    const navigate = useNavigate()
    return (
        <div className=" flex items-center justify-center h-screen w-full">
            <Card className="w-[450px] px-4">
                <CardHeader className="flex justify-center items-center">
        <CardTitle className="text-8xl font-bold">404</CardTitle>
        <CardDescription className="text-3xl font-medium">
                    Page Not Found!
                    </CardDescription>
                </CardHeader>
                <CardContent>
                 <p>The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
                </CardContent>
                <CardFooter className="flex justify-evenly">
                <Button onClick={() => navigate("/dashboard")}><MoveLeftIcon/> Go Back</Button>
                <Button onClick={() => navigate("/dashboard")}><HomeIcon/> Back To Dashboard</Button>
                </CardFooter>
            </Card>
      
        </div>
    )
}

export default Page