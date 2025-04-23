import { useCurrentUser, User } from "@/action";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProfilePage() {
    const { data: user, isPending: isLoading } = useCurrentUser();
    const navigate = useNavigate();
    
    // Type cast user to our defined interface or null
    const typedUser = user as User | null;

    // Function to get initials for avatar
    const getInitials = (firstName: string, lastName: string) => {
        if (!firstName && !lastName) return "U";
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-1/3" />
                        <Skeleton className="h-4 w-1/4" />
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                            </div>
                            <div className="space-y-4">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!typedUser) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <Card>
                    <CardContent className="pt-6">
                        <div className="py-12">
                            <h3 className="text-xl font-semibold mb-4">You are not logged in</h3>
                            <p className="text-muted-foreground mb-6">Please sign in to view your profile</p>
                            <Button onClick={() => navigate("/auth/login")}>
                                Sign In
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Information */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="bg-card">
                        <CardHeader className="flex flex-row items-center">
                            <div className="flex flex-col space-y-1.5">
                                <CardTitle className="text-2xl text-card-foreground">Profile Information</CardTitle>
                                <CardDescription className="text-muted-foreground">Your personal and account details</CardDescription>
                            </div>
                            <div className="ml-auto">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage src="" alt={`${typedUser.first_name} ${typedUser.last_name}`} />
                                    <AvatarFallback className="text-lg">
                                        {getInitials(typedUser.first_name, typedUser.last_name)}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">First Name</p>
                                    <p className="font-medium text-card-foreground">{typedUser.first_name}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Last Name</p>
                                    <p className="font-medium text-card-foreground">{typedUser.last_name}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium text-card-foreground">{typedUser.email}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">User ID</p>
                                    <p className="font-medium text-card-foreground">{typedUser.id}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card">
                        <CardHeader>
                            <CardTitle className="text-2xl text-card-foreground">Department Information</CardTitle>
                            <CardDescription className="text-muted-foreground">Your department and role details</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Department ID</p>
                                    <p className="font-medium text-card-foreground">{typedUser.department || "Not assigned"}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Role</p>
                                    <Badge className="font-normal capitalize text-xs">
                                        {typedUser.user_type}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card">
                        <CardHeader>
                            <CardTitle className="text-2xl text-card-foreground">Account Status</CardTitle>
                            <CardDescription className="text-muted-foreground">Your account verification details</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Verification Status</p>
                                    <Badge variant={typedUser.is_verified ? "default" : "destructive"} className={typedUser.is_verified ? "bg-green-500" : ""}>
                                        {typedUser.is_verified ? "Verified" : "Not Verified"}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Side Panel */}
                <div className="lg:col-span-1">
                    <Card className="bg-card sticky top-24">
                        <CardHeader>
                            <CardTitle className="text-xl text-card-foreground">Quick Actions</CardTitle>
                            <CardDescription className="text-muted-foreground">Manage your account</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Button 
                                    className="w-full justify-start" 
                                    variant="outline"
                                    onClick={() => navigate("/dashboard")}
                                >
                                    Dashboard
                                </Button>
                                <Button 
                                    className="w-full justify-start" 
                                    variant="outline"
                                    onClick={() => navigate("/setting")}
                                >
                                    Settings
                                </Button>
                                <Separator className="my-2" />
                                <Button 
                                    className="w-full justify-start text-destructive hover:text-destructive" 
                                    variant="ghost"
                                    onClick={() => {
                                        // Logout logic here
                                        navigate("/auth/login");
                                    }}
                                >
                                    Log out
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
} 