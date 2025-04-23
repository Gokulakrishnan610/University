import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/components/provider/theme-provider";
import SwitchTheme from "@/components/global/theme";

const Setting = () => {
    const { theme } = useTheme();

    return (
        <div className="mx-auto p-6">
            <Card className="w-full mx-auto">
                <CardHeader>
                    <CardTitle>Settings</CardTitle>
                    <CardDescription>Manage your application preferences</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-medium mb-3">Appearance</h3>
                            <div className="flex flex-col space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="theme-mode">Theme Mode</Label>
                                    <SwitchTheme />
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {theme === "light" && "Using light theme for all devices."}
                                        {theme === "dark" && "Using dark theme for all devices."}
                                        {theme === "system" && "Automatically matches your device's theme setting."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t pt-6">
                            <h3 className="text-lg font-medium mb-3">More Settings</h3>
                            <p className="text-sm text-muted-foreground">Additional settings will be available in future updates.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Setting;