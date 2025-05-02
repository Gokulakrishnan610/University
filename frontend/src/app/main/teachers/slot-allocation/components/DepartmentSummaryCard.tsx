import { DepartmentSummary } from '@/action/slot';
import {
    Card,
    CardHeader,
    CardContent,
    CardTitle,
    CardFooter,
    CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Check, Users, Calendar, Clock, BarChart } from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

interface DepartmentSummaryCardProps {
    departmentSummary: DepartmentSummary | undefined;
    isHOD?: boolean;
}

export const DepartmentSummaryCard = ({ departmentSummary, isHOD = false }: DepartmentSummaryCardProps) => {
    if (!departmentSummary) return null;

    const maxAllowed = Math.ceil(departmentSummary.total_teachers * 0.33);
    const totalTeachers = departmentSummary.total_teachers;
    const assignedTeachers = departmentSummary.teachers_with_assignments;
    const complianceStatus = departmentSummary.compliance.status;
    const hasComplianceIssues = departmentSummary.compliance.issues.length > 0;

    // Calculate teachers per day accurately (making sure each teacher is counted only once per day)
    const calculateTeachersPerDay = () => {
        const dayTeacherMap: Record<string, Set<number>> = {};

        // Initialize with empty sets for all days
        Object.keys(departmentSummary.day_distribution).forEach(dayName => {
            dayTeacherMap[dayName] = new Set<number>();
        });

        // Collect unique teachers for each day from slot distribution
        Object.entries(departmentSummary.slot_distribution).forEach(([slotType, slotData]) => {
            Object.entries(slotData.days).forEach(([dayName, dayData]) => {
                dayData.teachers.forEach(teacher => {
                    if (dayTeacherMap[dayName]) {
                        dayTeacherMap[dayName].add(teacher.id);
                    }
                });
            });
        });

        // Convert to expected format: 1 day, 2 days, etc. based on how many days each teacher is assigned
        const teacherDayCount: Record<number, number> = {};

        // Count days per teacher
        Object.values(dayTeacherMap).forEach(teacherSet => {
            teacherSet.forEach(teacherId => {
                teacherDayCount[teacherId] = (teacherDayCount[teacherId] || 0) + 1;
            });
        });

        // Count teachers by number of days assigned
        const daysAssignedDistribution: Record<string, number> = {
            "1 day": 0, "2 days": 0, "3 days": 0, "4 days": 0, "5 days": 0
        };

        Object.values(teacherDayCount).forEach(dayCount => {
            if (1 <= dayCount && dayCount <= 5) {
                daysAssignedDistribution[`${dayCount} day${dayCount > 1 ? 's' : ''}`]++;
            }
        });

        return daysAssignedDistribution;
    };

    // Use our calculated teachers per day distribution
    const dayAssignmentDistribution = calculateTeachersPerDay();

    // Day distribution visualization - sort by day number
    const daysAssignmentData = Object.entries(dayAssignmentDistribution)
        .sort((a, b) => {
            // Extract the day number from strings like "1 day" or "2 days"
            const dayNumberA = parseInt(a[0].split(' ')[0]);
            const dayNumberB = parseInt(b[0].split(' ')[0]);
            return dayNumberA - dayNumberB;
        });

    // Use slot type summary directly from the backend instead of calculating it
    const slotTypeCounts = departmentSummary.slot_type_summary;

    // Calculate accurate day distribution and per-day slot distribution
    const calculateDayDistribution = () => {
        const result: Record<string, {
            total: number,
            percentage: number,
            slots: Record<string, { count: number, percentage: number }>
        }> = {};

        // Initialize structure
        Object.keys(departmentSummary.day_distribution).forEach(dayName => {
            const teacherIds = new Set<number>();
            const slotTeacherIds: Record<string, Set<number>> = {};

            // Initialize slot sets
            Object.keys(departmentSummary.slot_distribution).forEach(slotType => {
                slotTeacherIds[slotType] = new Set<number>();
            });

            // Collect teacher IDs
            Object.entries(departmentSummary.slot_distribution).forEach(([slotType, slotData]) => {
                if (slotData.days[dayName] && slotData.days[dayName].teachers) {
                    slotData.days[dayName].teachers.forEach(teacher => {
                        teacherIds.add(teacher.id);
                        slotTeacherIds[slotType].add(teacher.id);
                    });
                }
            });

            // Build the result
            const slots: Record<string, { count: number, percentage: number }> = {};
            Object.entries(slotTeacherIds).forEach(([slotType, teachers]) => {
                slots[slotType] = {
                    count: teachers.size,
                    percentage: totalTeachers > 0 ? Math.round((teachers.size / totalTeachers) * 100) : 0
                };
            });

            result[dayName] = {
                total: teacherIds.size,
                percentage: totalTeachers > 0 ? Math.round((teacherIds.size / totalTeachers) * 100) : 0,
                slots
            };
        });

        return result;
    };

    const dayDistribution = calculateDayDistribution();

    return (
        <Card className="mt-4">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Users className="h-4 w-4" /> Department Summary
                    </CardTitle>
                    <Badge
                        variant={complianceStatus === "Compliant" ? "secondary" : "destructive"}
                        className="text-[10px]"
                    >
                        {complianceStatus === "Compliant" ? (
                            <span className="flex items-center"><Check className="h-3 w-3 mr-1" /> Compliant</span>
                        ) : (
                            <span className="flex items-center"><AlertCircle className="h-3 w-3 mr-1" /> Non-Compliant</span>
                        )}
                    </Badge>
                </div>
                <CardDescription className="text-xs">
                    Slot allocation limits for {departmentSummary.department}
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="text-xs text-muted-foreground space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <div className="flex justify-between">
                                <span>Total Teachers:</span>
                                <span className="font-medium">{totalTeachers}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Assigned Teachers:</span>
                                <span className="font-medium">{assignedTeachers}</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between">
                                <span>Max per Slot Type (33%):</span>
                                <span className="font-medium">{maxAllowed}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Unassigned Teachers:</span>
                                <span className="font-medium">{departmentSummary.unassigned_teachers}</span>
                            </div>
                        </div>
                    </div>

                    {/* Distribution by slot type */}
                    <div className="pt-2">
                        <div className="font-medium mb-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Slot Type Distribution
                        </div>
                        <div className="space-y-1.5">
                            {Object.entries(slotTypeCounts).map(([slotType, data]) => (
                                <div key={slotType} className="space-y-1">
                                    <div className="flex justify-between text-[10px]">
                                        <span>Slot Type {slotType}:</span>
                                        <span>
                                            {data.teacher_count} teacher{data.teacher_count !== 1 ? 's' : ''} ({data.percentage}%)
                                            {data.teacher_count > maxAllowed && <AlertCircle className="h-2 w-2 inline ml-1 text-destructive" />}
                                        </span>
                                    </div>
                                    <Progress
                                        value={data.percentage}
                                        className={`h-1 ${data.teacher_count > maxAllowed ? 'bg-destructive/20' : ''}`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <Separator className="my-2" />

                    {/* Distribution by days of week */}
                    <div>
                        <div className="font-medium mb-1 flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> Daily Teacher Distribution
                        </div>
                        <div className="space-y-1.5">
                            {Object.entries(dayDistribution).map(([dayName, data]) => (
                                <div key={dayName} className="space-y-1">
                                    <div className="flex justify-between text-[10px]">
                                        <span>{dayName}:</span>
                                        <span>
                                            {data.total} teacher{data.total !== 1 ? 's' : ''} ({data.percentage}%)
                                        </span>
                                    </div>
                                    <Progress value={data.percentage} className="h-1" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <Separator className="my-2" />

                    {/* Distribution by number of days assigned */}
                    <div>
                        <div className="font-medium mb-1 flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> Days Assignment Distribution
                        </div>
                        <div className="space-y-1.5">
                            {daysAssignmentData.map(([dayLabel, count]) => (
                                <div key={dayLabel} className="space-y-1">
                                    <div className="flex justify-between text-[10px]">
                                        <span>{dayLabel}:</span>
                                        <span>{count} teacher{(count as number) !== 1 ? 's' : ''} ({Math.round((count as number) / totalTeachers * 100)}%)</span>
                                    </div>
                                    <Progress value={(count as number) / totalTeachers * 100} className="h-1" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Compliance issues */}
                    {hasComplianceIssues && (
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1" className="border-b-0">
                                <AccordionTrigger className="text-xs py-1 text-destructive hover:no-underline">
                                    <div className="flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        <span>View Compliance Issues ({departmentSummary.compliance.issues.length})</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="text-[10px] pt-1">
                                    <ul className="list-disc pl-4 space-y-1">
                                        {departmentSummary.compliance.issues.map((issue, i) => (
                                            <li key={i} className="text-destructive">{issue}</li>
                                        ))}
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    )}

                    {/* Slot distribution - only shown to HODs */}
                    {isHOD && (
                        <div className="pt-1">
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="item-1" className="border-b-0">
                                    <AccordionTrigger className="text-xs py-1 hover:no-underline">
                                        <div className="flex items-center gap-1">
                                            <BarChart className="h-3 w-3" />
                                            <span>Detailed Slot Distribution</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="text-[10px] pt-1">
                                        {Object.entries(departmentSummary.slot_distribution).map(([slotType, slotData]) => (
                                            <div key={slotType} className="mb-2">
                                                <div className="font-medium mb-1">Slot Type {slotType}:</div>
                                                <div className="space-y-1 pl-2">
                                                    {Object.entries(slotData.days).map(([dayName, dayData]) => {
                                                        const percentage = dayData.percentage;
                                                        const isOver = percentage > 33;
                                                        return (
                                                            <div key={dayName} className={`flex justify-between ${isOver ? 'text-destructive' : ''}`}>
                                                                <span>{dayName}:</span>
                                                                <span>
                                                                    {dayData.teacher_count} teachers ({percentage}%)
                                                                    {isOver && <AlertCircle className="h-2 w-2 inline ml-1" />}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default DepartmentSummaryCard;
