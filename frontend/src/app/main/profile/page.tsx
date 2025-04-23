import { useCurrentUser } from "@/action/user";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { User } from "@/types/index.types";

const Profile = () => {
    const { data: user, isPending } = useCurrentUser();
    const navigate = useNavigate();
    
    const typedUser = user as User | null;
    
    const isValidUser = (user: any): user is User => {
        return user && typeof user.id === 'number';
    };

    if (isPending) {
        return (
            <div className="container mx-auto p-6">
                <Card className="w-full max-w-3xl mx-auto">
                    <CardHeader>
                        <CardTitle><Skeleton className="h-8 w-1/3" /></CardTitle>
                        <CardDescription><Skeleton className="h-4 w-1/2" /></CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-16 w-16 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-4 w-48" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-8 w-full" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-8 w-full" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!isValidUser(typedUser)) {
        return (
            <div className="container mx-auto p-6 text-center">
                <h1 className="text-2xl font-bold mb-4">Not Logged In</h1>
                <p className="mb-4">Please log in to view your profile</p>
                <Button onClick={() => navigate("/auth/login")}>
                    Go to Login
                </Button>
            </div>
        );
    }

    // Generate initials for avatar fallback
    const getInitials = (name: string | null) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map(part => part[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);
    };

    // Format date in a readable way
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    };

    return (
        <div className="mx-auto p-6">
            <Card className="w-full  mx-auto">
                <CardHeader>
                    <CardTitle>Your Profile</CardTitle>
                    <CardDescription>View and manage your account information</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-8">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src="" alt={typedUser.name || "User"} />
                                <AvatarFallback className="text-lg">{getInitials(typedUser.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="text-xl font-semibold">{typedUser.name || "User"}</h3>
                                <p className="text-muted-foreground">{typedUser.email}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">User ID</h4>
                                <p className="text-sm">{typedUser.id}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">Email Verification</h4>
                                <p className="text-sm">
                                    {typedUser.isVerified ? (
                                        <span className="text-green-600 dark:text-green-400">Verified</span>
                                    ) : (
                                        <span className="text-red-600 dark:text-red-400">Not Verified</span>
                                    )}
                                </p>
                            </div>
                            {typedUser.createdAt && (
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Member Since</h4>
                                    <p className="text-sm">{formatDate(typedUser.createdAt)}</p>
                                </div>
                            )}
                            {typedUser.updatedAt && (
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Last Updated</h4>
                                    <p className="text-sm">{formatDate(typedUser.updatedAt)}</p>
                                </div>
                            )}
                        </div>

                        <div className="border-t pt-6">
                            <Button 
                                variant="outline" 
                                onClick={() => navigate("/setting")}
                                className="mr-2"
                            >
                                Settings
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Profile;