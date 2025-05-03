import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { GripVertical } from 'lucide-react';
import { Teacher as TeacherType } from '@/action/teacher';

interface TeacherCardProps {
    teacher: TeacherType;
}

export const TeacherCard = ({ teacher }: TeacherCardProps) => {
    const getInitials = (firstName?: string, lastName?: string) => {
        if (!firstName && !lastName) return "";
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
    };

    return (
        <div
            className="p-3 border rounded-md flex items-center justify-between shadow-md bg-card"
            style={{ width: '280px' }}
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
                        {teacher.dept_id && (
                            <span className="ml-1">• {teacher.dept_id.dept_name}</span>
                        )}
                    </div>
                </div>
            </div>
            <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
    );
};

export default TeacherCard;
