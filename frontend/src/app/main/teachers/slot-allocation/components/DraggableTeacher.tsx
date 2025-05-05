import { useDraggable } from '@dnd-kit/core';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { GripVertical, AlertCircle, Info } from 'lucide-react';
import { Teacher as TeacherType } from '@/action/teacher';
import { DepartmentSummary, DAYS_OF_WEEK, SLOT_TYPES, RESTRICTED_DAYS } from '@/action/slot';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useState } from 'react';

interface DraggableTeacherProps {
    teacher: TeacherType;
    isAssigned?: boolean;
    assignedDays?: number;
    departmentSummary?: DepartmentSummary;
    isHOD?: boolean;
}

export const DraggableTeacher = ({
    teacher,
    isAssigned = false,
    assignedDays = 0,
    departmentSummary,
    isHOD = false
}: DraggableTeacherProps) => {
    // Keep local state to ensure we have the most updated values
    const [localAssignedDays, setLocalAssignedDays] = useState(assignedDays);
    const [assignedDayNames, setAssignedDayNames] = useState<string[]>([]);
    const [hasComplianceIssues, setHasComplianceIssues] = useState(false);
    const [slotAssignments, setSlotAssignments] = useState<string[]>([]);
    const [slotDistribution, setSlotDistribution] = useState<{[key: string]: number}>({
        A: 0, B: 0, C: 0
    });
    const [hasWeekendDay, setHasWeekendDay] = useState(false);
    const [weekendDay, setWeekendDay] = useState<string>("");

    // Update local state when props change
    useEffect(() => {
        const teacherDetails = getTeacherAssignmentDetails();

        // Always use the most up-to-date count
        setLocalAssignedDays(Math.max(
            assignedDays,
            teacherDetails?.days || 0
        ));

        if (teacherDetails) {
            setHasComplianceIssues(
                teacherDetails.complianceIssues &&
                teacherDetails.complianceIssues.length > 0
            );

            setAssignedDayNames(teacherDetails.assignedDayNames || []);
            setSlotAssignments(teacherDetails.assignments || []);
            
            // Calculate slot distribution
            const slotDist: {[key: string]: number} = { A: 0, B: 0, C: 0 };
            teacherDetails.assignments.forEach(assignment => {
                const slotType = assignment.split('/')[0];
                slotDist[slotType] = (slotDist[slotType] || 0) + 1;
            });
            setSlotDistribution(slotDist);
            
            // Check for Monday/Saturday restriction (can only have one)
            const hasRestrictedDay = teacherDetails.assignedDayNames.filter(
                day => day === 'Monday' || day === 'Saturday'
            );
            setHasWeekendDay(hasRestrictedDay.length > 0);
            if (hasRestrictedDay.length > 0) {
                setWeekendDay(hasRestrictedDay[0]);
            }
        }
    }, [assignedDays, departmentSummary, teacher.id]);

    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `teacher-${teacher.id}`,
        data: {
            type: 'teacher',
            teacher
        },
        disabled: isAssigned || localAssignedDays >= 5 // Disable if already assigned or at max 5 days
    });

    const atMaxDays = localAssignedDays >= 5;

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: isDragging ? 10 : undefined,
        opacity: isDragging ? 0.8 : undefined,
        boxShadow: isDragging ? '0 0 0 1px rgba(63, 63, 70, 0.05), 0 1px 3px 0 rgba(63, 63, 70, 0.15)' : undefined
    } : undefined;

    const getInitials = (firstName?: string, lastName?: string) => {
        if (!firstName && !lastName) return "";
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
    };

    // Check if the slot distribution is valid for 5 days
    const isValidSlotDistribution = () => {
        if (localAssignedDays < 5) return true;
        
        const { A, B, C } = slotDistribution;
        
        // Valid combinations: A-2/B-2/C-1, A-1/B-2/C-2, or A-2/B-1/C-2
        return (
            (A === 2 && B === 2 && C === 1) ||
            (A === 1 && B === 2 && C === 2) ||
            (A === 2 && B === 1 && C === 2)
        );
    };

    // Get teacher-specific assignment distribution if available
    function getTeacherAssignmentDetails() {
        if (!departmentSummary || !teacher.dept_id) return null;

        const teacherId = teacher.id;

        // Find all unique days this teacher is assigned to (directly use day distribution)
        const assignedDays = new Set<string>();
        const slotAssignments: string[] = [];

        // Check each day in the day distribution to see if this teacher is assigned
        Object.entries(departmentSummary.day_distribution).forEach(([dayName, dayData]) => {
            // For each slot type, check if this teacher is assigned on this day
            let isAssignedToThisDay = false;

            Object.entries(departmentSummary.slot_distribution).forEach(([slotType, slotData]) => {
                if (slotData.days[dayName]?.teachers) {
                    const isAssigned = slotData.days[dayName].teachers.some(t => t.id === teacherId);
                    if (isAssigned) {
                        isAssignedToThisDay = true;
                        slotAssignments.push(`${slotType}/${dayName}`);
                    }
                }
            });

            if (isAssignedToThisDay) {
                assignedDays.add(dayName);
            }
        });

        // Number of unique days the teacher is assigned to
        const totalAssignedDays = assignedDays.size;

        // Filter compliance issues that affect this teacher's slot assignments
        const slotTypes = slotAssignments.map(assignment => assignment.split('/')[0]);
        const complianceIssues = departmentSummary.compliance.issues.filter(issue => {
            // Check if any of the teacher's assigned slot types are mentioned in the issue
            return slotTypes.some(slotType => issue.includes(slotType));
        });

        return {
            assignments: slotAssignments,
            days: totalAssignedDays,
            assignedDayNames: Array.from(assignedDays),
            complianceIssues
        };
    }

    // Calculate days distribution
    const getDaysLabel = () => {
        if (localAssignedDays === 0) return "";

        let statusColor = "secondary";
        if (localAssignedDays >= 5) statusColor = "destructive";
        else if (localAssignedDays >= 3) statusColor = "warning";

        // Check slot distribution validity
        const isValidDistribution = isValidSlotDistribution();
        
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Badge variant={!isValidDistribution && localAssignedDays === 5 ? "destructive" : statusColor as any} className="text-[10px] py-0 h-4">
                            {localAssignedDays}/5 days
                            {(hasComplianceIssues && isHOD) || (!isValidDistribution && localAssignedDays === 5) ? (
                                <AlertCircle className="h-3 w-3 ml-1 text-destructive" />
                            ) : null}
                        </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="right" align="start" className="w-64 p-2">
                        <div className="text-xs">
                            <div className="font-medium mb-1">Assignment Status</div>
                            <div className="mb-1">
                                This teacher is assigned to <strong>{localAssignedDays}</strong> out of 5 possible days.
                            </div>

                            {assignedDayNames && assignedDayNames.length > 0 && (
                                <div className="mt-2">
                                    <div className="font-medium">Assigned to days:</div>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {assignedDayNames.map((day, idx) => (
                                            <Badge 
                                                key={idx} 
                                                variant={day === 'Saturday' || day === 'Sunday' ? "default" : "outline"} 
                                                className="text-[10px]"
                                            >
                                                {day}
                                            </Badge>
                                        ))}
                                    </div>
                                    {hasWeekendDay && (
                                        <div className="text-[10px] mt-1 italic">
                                            Note: Only one of Monday or Saturday is allowed.
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="mt-2">
                                <div className="font-medium">Slot distribution:</div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {Object.entries(slotDistribution).map(([slotType, count]) => (
                                        <Badge key={slotType} variant="outline" className="text-[10px]">
                                            Slot {slotType}: {count}
                                        </Badge>
                                    ))}
                                </div>
                                {localAssignedDays === 5 && !isValidDistribution && (
                                    <div className="text-[10px] mt-1 text-destructive">
                                        Invalid distribution. Valid combinations are: 
                                        A-2/B-2/C-1, A-1/B-2/C-2, or A-2/B-1/C-2.
                                    </div>
                                )}
                                {localAssignedDays < 5 && (
                                    <div className="text-[10px] mt-1 italic">
                                        Valid combinations for 5 days are: A-2/B-2/C-1, A-1/B-2/C-2, or A-2/B-1/C-2.
                                    </div>
                                )}
                            </div>

                            {slotAssignments && slotAssignments.length > 0 && (
                                <div className="mt-2">
                                    <div className="font-medium">Slot assignments:</div>
                                    <ul className="list-disc pl-4 mt-1">
                                        {slotAssignments.map((assignment, idx) => (
                                            <li key={idx}>{assignment}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {hasComplianceIssues && isHOD && (
                                <div className="mt-2 p-1 bg-destructive/10 rounded text-destructive">
                                    <div className="font-medium flex items-center">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        Compliance Issues
                                    </div>
                                    <div className="text-[10px] mt-1">
                                        This teacher is part of a group that exceeds the 33% department constraint.
                                    </div>
                                </div>
                            )}
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`p-3 mb-2 border rounded-md flex items-center justify-between shadow-sm transition-all
        ${isDragging ? 'bg-primary/5 border-primary/30' : ''}
        ${isAssigned || atMaxDays
                    ? 'bg-muted/20 border-dashed opacity-60 cursor-not-allowed'
                    : 'bg-card hover:border-primary/30 hover:bg-primary/5 cursor-grab active:cursor-grabbing touch-manipulation'
                }`}
        >
            <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(teacher.teacher_id?.first_name, teacher.teacher_id?.last_name)}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <div className="font-medium text-sm">
                        {teacher.teacher_id?.first_name} {teacher.teacher_id?.last_name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate max-w-[180px]">
                        {teacher.staff_code || 'No staff code'}
                        {localAssignedDays > 0 && (
                            <span className="ml-2 text-xs">
                                {getDaysLabel()}
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <GripVertical className={`h-5 w-5 ${isAssigned || atMaxDays ? 'text-muted-foreground/30' : 'text-muted-foreground'}`} />
        </div>
    );
};

export default DraggableTeacher;
