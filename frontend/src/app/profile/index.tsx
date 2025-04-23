import { useGetProfile } from "@/action/user";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetUserBookings } from "@/action/hostel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router";
import { Separator } from "@/components/ui/separator";

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  gender: 'M' | 'F';
  phone_number: string;
  parent_phone_number: string;
  roll_no: string;
  dept: string;
  year: string;
  is_active: boolean;
  is_superuser: boolean;
  is_staff: boolean;
  date_joined: string;
  last_login: string;
}

interface Booking {
  id: string;
  status: 'otp_pending' | 'payment_pending' | 'confirmed' | 'cancelled' | 'payment_not_done';
  food_type: 'veg' | 'non_veg';
  booked_at: string;
  hostel: {
    name: string;
    location: string;
    room_type: string;
    amount: {
      Mgmt_veg?: number;
      Govt_veg?: number;
      Mgmt_non_veg?: number;
      Govt_non_veg?: number;
    };
  };
}

export default function ProfilePage() {
    const { data: user, isPending: isLoading } = useGetProfile() as { data: User | undefined; isPending: boolean };
    const { data: bookings, isLoading: isLoadingBookings } = useGetUserBookings() as { data: Booking[] | undefined; isLoading: boolean };
    const navigate = useNavigate();

    const hasActiveBooking = bookings?.some((booking: Booking) =>
        booking.status === 'otp_pending' ||
        booking.status === 'payment_pending'
    );

    // Function to get the correct amount based on food type
    const getBookingAmount = (booking: Booking) => {
        if (!booking?.hostel?.amount) return "N/A";
        return booking.food_type === "veg" 
            ? booking.hostel.amount.Mgmt_veg || booking.hostel.amount.Govt_veg
            : booking.hostel.amount.Mgmt_non_veg || booking.hostel.amount.Govt_non_veg;
    };

    // Function to format food type for display
    const formatFoodType = (foodType: string) => {
        return foodType === "veg" ? "Vegetarian" : "Non-Vegetarian";
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

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Information */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="bg-card">
                        <CardHeader>
                            <CardTitle className="text-2xl text-card-foreground">Personal Information</CardTitle>
                            <CardDescription className="text-muted-foreground">Your basic details and contact information</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Full Name</p>
                                    <p className="font-medium text-card-foreground">{user?.first_name} {user?.last_name}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium text-card-foreground">{user?.email}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Gender</p>
                                    <p className="font-medium text-card-foreground">{user?.gender === 'M' ? 'Male' : 'Female'}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Phone Number</p>
                                    <p className="font-medium text-card-foreground">{user?.phone_number}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Parent's Phone Number</p>
                                    <p className="font-medium text-card-foreground">{user?.parent_phone_number}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card">
                        <CardHeader>
                            <CardTitle className="text-2xl text-card-foreground">Academic Information</CardTitle>
                            <CardDescription className="text-muted-foreground">Your academic details and enrollment information</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Roll Number</p>
                                    <p className="font-medium text-card-foreground">{user?.roll_no}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Department</p>
                                    <p className="font-medium text-card-foreground">{user?.dept}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Year</p>
                                    <p className="font-medium text-card-foreground">{user?.year}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card">
                        <CardHeader>
                            <CardTitle className="text-2xl text-card-foreground">Account Status</CardTitle>
                            <CardDescription className="text-muted-foreground">Your account details and activity information</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Account Status</p>
                                    <Badge variant={user?.is_active ? "secondary" : "destructive"}>
                                        {user?.is_active ? "Active" : "Inactive"}
                                    </Badge>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Account Type</p>
                                    <Badge variant="outline" className="border-input">
                                        {user?.is_superuser ? "Admin" : user?.is_staff ? "Staff" : "Student"}
                                    </Badge>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Member Since</p>
                                    <p className="font-medium text-card-foreground">{new Date(user?.date_joined || "").toLocaleDateString()}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Last Login</p>
                                    <p className="font-medium text-card-foreground">{new Date(user?.last_login || "").toLocaleString()}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Bookings Section */}
                <div className="lg:col-span-1">
                    <Card className="bg-card">
                        <CardHeader>
                            <CardTitle className="text-2xl text-card-foreground">Your Bookings</CardTitle>
                            <CardDescription className="text-muted-foreground">View and manage your hostel bookings</CardDescription>
                            <Button
                                className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
                                onClick={() => navigate("/")}
                                disabled={hasActiveBooking}
                            >
                                {hasActiveBooking ? "Booking in Progress" : "Book a New Room"}
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {isLoadingBookings ? (
                                <div className="space-y-4">
                                    <Skeleton className="h-24 w-full" />
                                    <Skeleton className="h-24 w-full" />
                                </div>
                            ) : bookings?.length === 0 ? (
                                <div className="text-center py-8 space-y-4">
                                    <div className="text-muted-foreground">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-lg font-medium text-card-foreground">No Bookings Yet</p>
                                        <p className="text-muted-foreground mt-1">You haven't made any hostel bookings yet.</p>
                                        <p className="text-muted-foreground">Browse our available hostels and make your first booking!</p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() => navigate("/")}
                                        className="mt-4 border-input hover:bg-accent hover:text-accent-foreground"
                                    >
                                        Browse Hostels
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {bookings?.map((booking) => (
                                        <Link
                                            key={booking.id}
                                            to={`/bookings/${booking.id}`}
                                            className="block border border-input rounded-lg p-4 space-y-2 hover:bg-accent/50 transition-colors"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-semibold text-card-foreground">{booking.hostel.name}</h4>
                                                    <p className="text-sm text-muted-foreground">{booking.hostel.location}</p>
                                                </div>
                                                <Badge variant={
                                                    booking.status === 'otp_pending' ? 'outline' :
                                                        booking.status === 'payment_pending' ? 'secondary' :
                                                            booking.status === 'confirmed' ? 'default' :
                                                                'destructive'
                                                }>
                                                    {booking.status === 'otp_pending' ? 'OTP Pending' :
                                                     booking.status === 'payment_pending' ? 'Payment Pending' :
                                                     booking.status === 'confirmed' ? 'Confirmed' :
                                                     booking.status === 'cancelled' ? 'Cancelled' : 'Payment Not Done'}
                                                </Badge>
                                            </div>
                                            <Separator />
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <p className="text-muted-foreground">Room Type</p>
                                                    <p className="font-medium text-card-foreground">{booking.hostel.room_type}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Food Type</p>
                                                    <p className="font-medium text-card-foreground">{formatFoodType(booking.food_type)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Fees</p>
                                                    <p className="font-medium text-card-foreground">₹{getBookingAmount(booking)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Booked On</p>
                                                    <p className="font-medium text-card-foreground">{new Date(booking.booked_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
} 