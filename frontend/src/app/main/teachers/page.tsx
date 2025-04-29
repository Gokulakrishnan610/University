import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { 
  useGetTeachers, 
  useUpdateTeacher, 
  useCreatePlaceholderTeacher,
  useGetResigningTeachers,
  useGetResignedTeachers,
  useGetPlaceholderTeachers,
  Teacher as TeacherType 
} from '@/action/teacher';
import api from '@/action/api';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  PlusCircle, MoreHorizontal, Pencil, Eye, Users, Building, UserMinus, 
  Search, X, Filter, Briefcase, Calendar, UserX, Clock, UserPlus
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import TeacherForm from './form';
import TeacherPlaceholderForm from './placeholder-form';

export default function TeacherManagement() {
  const navigate = useNavigate();
  const { data: teachersData, isPending: isLoading, refetch } = useGetTeachers();
  const teachers = teachersData || [];
  const [teacherToRemove, setTeacherToRemove] = useState<TeacherType | null>(null);
  const [showPlaceholderForm, setShowPlaceholderForm] = useState<boolean>(false);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string[]>([]);
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<string[]>([]);
  const [showIndustryOnly, setShowIndustryOnly] = useState<boolean>(false);
  const [showLimitedAvailabilityOnly, setShowLimitedAvailabilityOnly] = useState<boolean>(false);
  const [showResigningOnly, setShowResigningOnly] = useState<boolean>(false);
  const [showResignedOnly, setShowResignedOnly] = useState<boolean>(false);
  const [showPlaceholdersOnly, setShowPlaceholdersOnly] = useState<boolean>(false);

  const { mutate: updateTeacher } = useUpdateTeacher(
    teacherToRemove?.id || 0,
    () => {
      refetch();
      setTeacherToRemove(null);
    }
  );
  
  const { mutate: createPlaceholder } = useCreatePlaceholderTeacher(() => {
    refetch();
    setShowPlaceholderForm(false);
    toast.success("Placeholder teacher created successfully");
  });

  // Create a dedicated function for marking a teacher as resigning/resigned
  const markTeacherStatus = (teacher: TeacherType, status: 'resigning' | 'resigned') => {
    api.patch(`/api/teachers/${teacher.id}/`, { resignation_status: status })
      .then(() => {
        toast.success(`Teacher marked as ${status}`);
        refetch();
      })
      .catch((error: any) => {
        console.error(`Error marking teacher as ${status}:`, error);
        toast.error(`Failed to mark teacher as ${status}`, {
          description: error.message || 'An unexpected error occurred'
        });
      });
  };

  // Extract unique values for filters
  const uniqueRoles = useMemo<string[]>(() => {
    return Array.from(new Set(teachers.map((t: TeacherType) => t.teacher_role)));
  }, [teachers]);

  const uniqueDepartments = useMemo<string[]>(() => {
    return Array.from(new Set(teachers.map((t: TeacherType) => t.dept_id?.dept_name || 'Not assigned').filter(Boolean)));
  }, [teachers]);

  // Filter teachers based on search query and filters
  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher: TeacherType) => {
      // Apply search query
      // Access user data from teacher_id structure
      const firstName = teacher.teacher_id?.first_name || '';
      const lastName = teacher.teacher_id?.last_name || '';
      const teacherName = `${firstName} ${lastName}`.toLowerCase();
      const staffCode = (teacher.staff_code || '').toLowerCase();
      const searchLower = searchQuery.toLowerCase();
      
      const matchesSearch = searchQuery === '' || 
          teacherName.includes(searchLower) || 
          staffCode.includes(searchLower);
      
      // Apply filters
      const matchesRole = selectedRoleFilter.length === 0 || 
          selectedRoleFilter.includes(teacher.teacher_role);
      
      // Access department from dept_id structure
      const departmentName = teacher.dept_id?.dept_name || 'Not assigned';
      const matchesDepartment = selectedDepartmentFilter.length === 0 || 
          selectedDepartmentFilter.includes(departmentName);
      
      // Industry professional filter
      const matchesIndustry = !showIndustryOnly || 
          teacher.is_industry_professional || 
          teacher.teacher_role === 'POP' || 
          teacher.teacher_role === 'Industry Professional';
      
      // Limited availability filter
      const matchesAvailability = !showLimitedAvailabilityOnly || 
          teacher.availability_type === 'limited';
          
      // Resignation status filters
      const matchesResigning = !showResigningOnly ||
          teacher.resignation_status === 'resigning';
          
      const matchesResigned = !showResignedOnly ||
          teacher.resignation_status === 'resigned';
          
      // Placeholder filter
      const matchesPlaceholder = !showPlaceholdersOnly ||
          teacher.is_placeholder === true;
      
      return matchesSearch && matchesRole && matchesDepartment && 
        matchesIndustry && matchesAvailability && 
        matchesResigning && matchesResigned && matchesPlaceholder;
    });
  }, [
    teachers, searchQuery, selectedRoleFilter, selectedDepartmentFilter, 
    showIndustryOnly, showLimitedAvailabilityOnly,
    showResigningOnly, showResignedOnly, showPlaceholdersOnly
  ]);

  const handleRemoveFromDepartment = () => {
    if (!teacherToRemove) return;

    console.log('Removing teacher from department:', teacherToRemove.id);
    updateTeacher(
      { dept_id: null },
      {
        onSuccess: () => {
          toast.success('Teacher removed from department', {
            description: 'Teacher has been removed from the department successfully.',
          });
          refetch();
          setTeacherToRemove(null);
        },
        onError: (error: Error) => {
          console.error('Error removing from department:', error);
          toast.error('Error', {
            description: `Failed to remove teacher: ${error.message}`,
          });
          setTeacherToRemove(null);
        },
      }
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedRoleFilter([]);
    setSelectedDepartmentFilter([]);
    setShowIndustryOnly(false);
    setShowLimitedAvailabilityOnly(false);
    setShowResigningOnly(false);
    setShowResignedOnly(false);
    setShowPlaceholdersOnly(false);
  };

  const getInitials = (firstName: string, lastName: string) => {
    if (!firstName && !lastName) return "";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="w-full mx-auto">
      <Card className="shadow-md border-t-4 border-t-primary">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Teacher Management</CardTitle>
            </div>
            <CardDescription className="mt-1.5">
              Manage teachers in your department
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowPlaceholderForm(true)} className="gap-2">
              <UserPlus className="h-4 w-4" />
              New Placeholder Teacher
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : teachers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 border rounded-lg bg-muted/20">
              <Users className="h-16 w-16 text-muted-foreground/60 mb-4" />
              <p className="text-muted-foreground text-lg mb-4">
                No teachers found in your department
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row gap-3 justify-between mb-4">
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search teachers..."
                    className="pl-8 w-full sm:w-[300px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9">
                        <Filter className="mr-2 h-4 w-4" />
                        Role
                        {selectedRoleFilter.length > 0 && (
                          <Badge variant="secondary" className="ml-1 px-1 rounded-full">
                            {selectedRoleFilter.length}
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {uniqueRoles.map((role) => (
                        <DropdownMenuItem key={role} className="flex items-center gap-2">
                          <Checkbox
                            id={`role-${role}`}
                            checked={selectedRoleFilter.includes(role)}
                            onCheckedChange={(checked: boolean) => {
                              if (checked) {
                                setSelectedRoleFilter(prev => [...prev, role]);
                              } else {
                                setSelectedRoleFilter(prev => prev.filter(r => r !== role));
                              }
                            }}
                          />
                          <label htmlFor={`role-${role}`} className="flex-1 cursor-pointer">
                            {role}
                          </label>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9">
                        <Filter className="mr-2 h-4 w-4" />
                        Department
                        {selectedDepartmentFilter.length > 0 && (
                          <Badge variant="secondary" className="ml-1 px-1 rounded-full">
                            {selectedDepartmentFilter.length}
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {uniqueDepartments.map((dept) => (
                        <DropdownMenuItem key={dept} className="flex items-center gap-2">
                          <Checkbox
                            id={`dept-${dept}`}
                            checked={selectedDepartmentFilter.includes(dept)}
                            onCheckedChange={(checked: boolean) => {
                              if (checked) {
                                setSelectedDepartmentFilter(prev => [...prev, dept]);
                              } else {
                                setSelectedDepartmentFilter(prev => prev.filter(d => d !== dept));
                              }
                            }}
                          />
                          <label htmlFor={`dept-${dept}`} className="flex-1 cursor-pointer">
                            {dept}
                          </label>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Button 
                    variant={showIndustryOnly ? "secondary" : "outline"} 
                    size="sm" 
                    className="h-9"
                    onClick={() => setShowIndustryOnly(!showIndustryOnly)}
                  >
                    <Briefcase className="mr-2 h-4 w-4" />
                    Industry Professionals
                    {showIndustryOnly && <Badge variant="outline" className="ml-1 px-1 rounded-full">1</Badge>}
                  </Button>
                  
                  <Button 
                    variant={showLimitedAvailabilityOnly ? "secondary" : "outline"} 
                    size="sm" 
                    className="h-9"
                    onClick={() => setShowLimitedAvailabilityOnly(!showLimitedAvailabilityOnly)}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Limited Availability
                    {showLimitedAvailabilityOnly && <Badge variant="outline" className="ml-1 px-1 rounded-full">1</Badge>}
                  </Button>

                  <Button 
                    variant={showResigningOnly ? "secondary" : "outline"} 
                    size="sm" 
                    className="h-9"
                    onClick={() => setShowResigningOnly(!showResigningOnly)}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Resigning
                    {showResigningOnly && <Badge variant="outline" className="ml-1 px-1 rounded-full">1</Badge>}
                  </Button>

                  <Button 
                    variant={showResignedOnly ? "secondary" : "outline"} 
                    size="sm" 
                    className="h-9"
                    onClick={() => setShowResignedOnly(!showResignedOnly)}
                  >
                    <UserX className="mr-2 h-4 w-4" />
                    Resigned
                    {showResignedOnly && <Badge variant="outline" className="ml-1 px-1 rounded-full">1</Badge>}
                  </Button>

                  <Button 
                    variant={showPlaceholdersOnly ? "secondary" : "outline"} 
                    size="sm" 
                    className="h-9"
                    onClick={() => setShowPlaceholdersOnly(!showPlaceholdersOnly)}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Placeholders
                    {showPlaceholdersOnly && <Badge variant="outline" className="ml-1 px-1 rounded-full">1</Badge>}
                  </Button>

                  {(searchQuery || selectedRoleFilter.length > 0 || selectedDepartmentFilter.length > 0 ||
                    showIndustryOnly || showLimitedAvailabilityOnly || showResigningOnly || showResignedOnly || showPlaceholdersOnly) && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-9" 
                      onClick={clearFilters}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>

              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="w-[250px]">Teacher</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Working Hours</TableHead>
                      <TableHead>Specialisation</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTeachers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No teachers matching the current filters
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTeachers.map((teacher: TeacherType) => {
                        const firstName = teacher.teacher_id?.first_name || '';
                        const lastName = teacher.teacher_id?.last_name || '';
                        const fullName = `${firstName} ${lastName}`;
                        
                        const isPOPOrIndustry = teacher.is_industry_professional || 
                          teacher.teacher_role === 'POP' || 
                          teacher.teacher_role === 'Industry Professional';
                        
                        const isLimitedAvailability = teacher.availability_type === 'limited';
                        const isPlaceholder = teacher.is_placeholder;
                        const isResigning = teacher.resignation_status === 'resigning';
                        const isResigned = teacher.resignation_status === 'resigned';
                        
                        return (
                          <TableRow key={teacher.id} className={`hover:bg-muted/40 ${isResigned ? 'bg-muted/20' : ''}`}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className={`${isPlaceholder ? 'bg-amber-100 text-amber-600' : 'bg-primary/10 text-primary'}`}>
                                    {isPlaceholder ? 'PH' : getInitials(firstName, lastName)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium flex items-center gap-1">
                                    {isPlaceholder ? (teacher.staff_code || 'Placeholder') : fullName}
                                    {isPOPOrIndustry && (
                                      <Badge variant="outline" className="text-amber-600 text-xs">
                                        Industry
                                      </Badge>
                                    )}
                                    {isPlaceholder && (
                                      <Badge variant="secondary" className="text-xs">
                                        Placeholder
                                      </Badge>
                                    )}
                                    {isResigning && (
                                      <Badge variant="outline" className="text-orange-600 text-xs">
                                        Resigning
                                      </Badge>
                                    )}
                                    {isResigned && (
                                      <Badge variant="outline" className="text-destructive text-xs">
                                        Resigned
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {isPlaceholder ? (
                                      teacher.placeholder_description || 'No description'
                                    ) : (
                                      teacher.staff_code || 'No Staff Code'
                                    )}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {teacher.teacher_role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {teacher.dept_id ? (
                                <div className="flex items-center">
                                  <Building className="h-3.5 w-3.5 text-muted-foreground mr-1.5" />
                                  <span>{teacher.dept_id.dept_name}</span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm">Not assigned</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {teacher.teacher_working_hours} hrs/week
                                {isLimitedAvailability && (
                                  <Badge variant="outline" className="text-xs text-amber-600">
                                    Limited
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">
                                {teacher.teacher_specialisation || 'Not specified'}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => navigate(`/teachers/${teacher.id}`)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => navigate(`/teachers/${teacher.id}?edit=true`)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit Profile
                                  </DropdownMenuItem>
                                  {!isPlaceholder && teacher.resignation_status === 'active' && (
                                    <DropdownMenuItem 
                                      onClick={() => markTeacherStatus(teacher, 'resigning')}
                                    >
                                      <Clock className="mr-2 h-4 w-4 text-orange-600" />
                                      Mark as Resigning
                                    </DropdownMenuItem>
                                  )}
                                  {!isPlaceholder && teacher.resignation_status === 'resigning' && (
                                    <DropdownMenuItem 
                                      onClick={() => markTeacherStatus(teacher, 'resigned')}
                                    >
                                      <UserX className="mr-2 h-4 w-4 text-destructive" />
                                      Mark as Resigned
                                    </DropdownMenuItem>
                                  )}
                                  {teacher.dept_id && (
                                    <DropdownMenuItem 
                                      className="text-destructive focus:text-destructive"
                                      onClick={() => setTeacherToRemove(teacher)}
                                    >
                                      <UserMinus className="mr-2 h-4 w-4" />
                                      Remove from Department
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!teacherToRemove} onOpenChange={(open) => !open && setTeacherToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Teacher from Department</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this teacher from their department? 
              This will not delete the teacher from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRemoveFromDepartment}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Placeholder Teacher Form Dialog */}
      {showPlaceholderForm && (
        <TeacherPlaceholderForm
          onClose={() => setShowPlaceholderForm(false)}
          onSuccess={() => {
            refetch();
            setShowPlaceholderForm(false);
          }}
        />
      )}
    </div>
  );
} 