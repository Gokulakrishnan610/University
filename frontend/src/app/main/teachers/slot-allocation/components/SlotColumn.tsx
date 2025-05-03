import { useDroppable } from '@dnd-kit/core';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Clock } from 'lucide-react';
import { Teacher as TeacherType } from '@/action/teacher';
import { SLOT_TYPES } from '@/action/slot';

interface SlotColumnProps {
    slot: typeof SLOT_TYPES[number];
    assignedTeachers: TeacherType[];
    onRemove: (teacherId: number) => void;
    maxTeachers: number;
    departmentCounts?: Record<number, number>;
    deptInfo?: { id: number, name: string, teacherCount: number } | null;
}

export const SlotColumn = ({
    slot,
    assignedTeachers,
    onRemove,
    maxTeachers,
    departmentCounts = {},
    deptInfo = null
}: SlotColumnProps) => {
    const { setNodeRef, isOver } = useDroppable({
        id: `slot-${slot.id}`,
        data: {
            type: 'slot',
            slot
        }
    });

    const isAtMaxCapacity = assignedTeachers.length >= maxTeachers;

    // Calculate department percentage if department info is provided
    const getDeptPercentage = (deptId: number) => {
        if (!deptInfo || deptInfo.id !== deptId || deptInfo.teacherCount === 0) return null;
        const count = departmentCounts[deptId] || 0;
        const percentage = Math.round((count / deptInfo.teacherCount) * 100);
        return { count, percentage };
    };

    // Group teachers by department for display
    const teachersByDept = assignedTeachers.reduce((acc, teacher) => {
        if (teacher.dept_id) {
            const deptId = teacher.dept_id.id;
            if (!acc[deptId]) {
                acc[deptId] = {
                    name: teacher.dept_id.dept_name,
                    teachers: []
                };
            }
            acc[deptId].teachers.push(teacher);
        } else {
            // Handle teachers without department
            if (!acc[-1]) {
                acc[-1] = {
                    name: 'No Department',
                    teachers: []
                };
            }
            acc[-1].teachers.push(teacher);
        }
        return acc;
    }, {} as Record<number, { name: string, teachers: TeacherType[] }>);

    return (
        <div className="flex flex-col h-full" ref={setNodeRef}>
            <div className="bg-primary/10 p-2 rounded-t-md flex justify-between items-center border-b">
                <Badge variant="outline" className="text-primary font-medium text-sm">
                    {slot.name}
                </Badge>
                <div className="flex items-center gap-2">
                    <div className="flex items-center text-xs text-muted-foreground gap-1">
                        <Clock className="h-3 w-3" />
                        {slot.time}
                    </div>
                    {maxTeachers > 0 && (
                        <Badge variant={isAtMaxCapacity ? "destructive" : "secondary"} className="text-xs">
                            {assignedTeachers.length}/{maxTeachers}
                        </Badge>
                    )}
                </div>
            </div>

            <div
                className={`flex-1 p-4 border-x border-b rounded-b-md flex flex-col 
          ${isOver && !isAtMaxCapacity ? 'bg-primary/20 border-primary/40' :
                        assignedTeachers.length > 0 ? 'bg-primary/5' :
                            'bg-muted/10 border-dashed'} 
          ${isAtMaxCapacity ? 'cursor-not-allowed' : ''} 
          transition-colors duration-200 min-h-[180px] overflow-auto`}
            >
                {Object.entries(teachersByDept).length > 0 ? (
                    <div className="w-full flex flex-col gap-4">
                        {Object.entries(teachersByDept).map(([deptIdStr, deptData]) => {
                            const deptId = parseInt(deptIdStr);
                            const deptPercentage = getDeptPercentage(deptId);

                            return (
                                <div key={deptIdStr} className="w-full">
                                    {deptPercentage && deptId > 0 && (
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="text-sm font-medium">{deptData.name}</h4>
                                            <Badge
                                                variant={deptPercentage.percentage > 33 ? "destructive" : "outline"}
                                                className="text-xs"
                                            >
                                                {deptPercentage.percentage}%
                                            </Badge>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 gap-2 w-full">
                                        {deptData.teachers.map(teacher => (
                                            <div key={teacher.id} className="flex items-center justify-between p-2 bg-background rounded-md border">
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-7 w-7">
                                                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                                            {teacher.teacher_id?.first_name?.charAt(0) || ''}{teacher.teacher_id?.last_name?.charAt(0) || ''}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium text-sm">
                                                            {teacher.teacher_id?.first_name} {teacher.teacher_id?.last_name}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {teacher.staff_code}
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-xs h-7 px-2"
                                                    onClick={() => onRemove(teacher.id)}
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4">
                        <div className="text-muted-foreground text-sm">
                            Drop teachers here to assign them to this slot
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SlotColumn;
