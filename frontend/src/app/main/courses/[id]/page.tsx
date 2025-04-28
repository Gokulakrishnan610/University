import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  useGetCourse,
  Course,
  useUpdateCourse,
  useDeleteCourse
} from '@/action/course';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ChevronLeft,
  BookOpen,
  Clock,
  AlarmClock,
  LucideIcon,
  School,
  Building,
  Pencil,
  Users,
  TimerReset,
  ArrowLeftRight,
  Calendar,
  Loader2,
  Trash,
  LayoutGrid
} from 'lucide-react';
import { useGetDepartments } from '@/action/department';
import { useGetCourseMasters } from '@/action/courseMaster';
import ReassignDialog from '../reassign-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import CourseForm, { CourseFormValues } from '../course-form';
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
import { getRelationshipBadgeColor, getRelationshipDisplayName } from '@/lib/utils';
// Stat item component
interface StatItemProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  iconColor?: string;
}

const StatItem = ({ icon: Icon, label, value, iconColor = 'text-primary' }: StatItemProps) => (
  <div className="flex flex-col">
    <span className="text-sm text-muted-foreground">{label}</span>
    <div className="flex items-center gap-1.5 mt-1">
      <Icon className={`h-4 w-4 ${iconColor}`} />
      <span className="font-medium">{value}</span>
    </div>
  </div>
);


// Function to get a contextual description based on user's department roles
const getRelationshipContext = (relationshipCode: string, userRoles: string[], course: any) => {
  const isOwner = userRoles.includes('owner');
  const isTeacher = userRoles.includes('teacher');
  const isLearner = userRoles.includes('learner');

  const ownerDept = course.course_detail.course_dept_detail.dept_name;
  const teachingDept = course.teaching_dept_detail.dept_name;
  const forDept = course.for_dept_detail.dept_name;

  switch (relationshipCode) {
    case 'SELF_OWNED_SELF_TAUGHT':
      return isOwner
        ? `This is our course and we teach it.`
        : `This course is owned and taught by ${ownerDept}.`;
    case 'SELF_OWNED_OTHER_TAUGHT':
      return isOwner
        ? `This is our course, but taught by ${teachingDept}.`
        : `This course is owned by ${ownerDept} and taught by ${teachingDept}.`;
    case 'OTHER_OWNED_SELF_TAUGHT':
      return isTeacher
        ? `We teach this course for ${ownerDept}.`
        : `This course is owned by ${ownerDept} and taught by ${teachingDept}.`;
    case 'OTHER_OWNED_OTHER_TAUGHT':
      return isLearner
        ? `Our students take this external course from ${ownerDept}, taught by ${teachingDept}.`
        : `This course is owned by ${ownerDept} and taught by ${teachingDept} for ${forDept}.`;
    case 'SELF_OWNED_FOR_OTHER_SELF_TAUGHT':
      return isOwner
        ? `We created and teach this course for ${forDept}.`
        : `This course is provided and taught by ${ownerDept} for ${forDept}.`;
    case 'SELF_OWNED_FOR_OTHER_OTHER_TAUGHT':
      return isOwner
        ? `We created this course for ${forDept}, taught by ${teachingDept}.`
        : `This course is provided by ${ownerDept} for ${forDept}, taught by ${teachingDept}.`;
    default:
      return 'This course has an undefined relationship between departments.';
  }
};

export default function CourseDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const courseId = parseInt(id as string);

  const [showReassignDialog, setShowReassignDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: courseResponse, isPending: isLoading, refetch } = useGetCourse(courseId);
  const { data: departmentsData, isPending: loadingDepartments } = useGetDepartments();
  const { data: courseMastersData, isPending: loadingCourseMasters } = useGetCourseMasters();

  const departments = departmentsData || [];
  const courseMasters = courseMastersData || [];

  // Extract course data from the response
  const course = courseResponse?.status === "success" ? courseResponse.data : null;

  // Update course mutation
  const { mutate: updateCourse, isPending: isUpdating } = useUpdateCourse(courseId, () => {
    refetch();
    toast.success("Course updated successfully");
    setShowEditDialog(false);
  });

  // Delete course mutation
  const { mutate: deleteCourse, isPending: isDeleting } = useDeleteCourse(courseId, () => {
    toast.success("Course deleted successfully");
    navigate('/courses');
  });

  // Handle form submission for course update
  const handleUpdateCourse = (values: CourseFormValues) => {
    // Remove course_id as it shouldn't be updated
    const { course_id, ...updateData } = values;
    updateCourse(updateData);
  };

  // Handle delete confirmation function
  const handleDeleteCourse = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    deleteCourse({});
    setShowDeleteDialog(false);
  };

  if (isLoading || !course) {
    return (
      <div className="py-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/courses')}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Courses
          </Button>
        </div>
        <Card className="shadow-md">
          <CardHeader>
            <Skeleton className="h-8 w-1/3 mb-2" />
            <Skeleton className="h-4 w-1/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Course attributes
  const isOwnCourse = course.course_detail.course_dept_detail.id === course.teaching_dept_id;
  const isTaughtByUs = course.teaching_dept_id === course.for_dept_id;
  const relationshipCode = course.relationship_type?.code || 'UNKNOWN';

  // Extract permissions data
  const canEdit = course.permissions?.can_edit || false;
  const canDelete = course.permissions?.can_delete || false;
  const editableFields = course.permissions?.editable_fields || [];
  const userRoles = course.user_department_roles || [];

  // Create default values for the edit form
  const defaultValues = {
    course_id: course.course_id,
    course_year: course.course_year,
    course_semester: course.course_semester,
    lecture_hours: course.lecture_hours,
    tutorial_hours: course.tutorial_hours,
    practical_hours: course.practical_hours,
    credits: course.credits,
    for_dept_id: course.for_dept_id,
    teaching_dept_id: course.teaching_dept_id,
    need_assist_teacher: course.need_assist_teacher,
    regulation: course.regulation,
    course_type: course.course_type as "T" | "L" | "LoT",
    elective_type: course.elective_type as "NE" | "PE" | "OE",
    lab_type: course.lab_type as "NULL" | "TL" | "NTL",
    no_of_students: course.no_of_students,
    is_zero_credit_course: course.is_zero_credit_course,
    teaching_status: course.teaching_status
  };

  return (
    <div className="py-4 w-full mx-auto">
      <Card className="shadow-md border-t-4 border-t-primary mb-6">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-3 rounded-md mt-1">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-2xl">
                      {course.course_detail.course_id} - {course.course_detail.course_name}
                    </CardTitle>
                    <div className="mt-2">
                      <Badge variant="outline" className={getRelationshipBadgeColor(relationshipCode)}>
                        {getRelationshipDisplayName(relationshipCode, userRoles)}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className="mt-1">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5">
                          <School className="h-3.5 w-3.5 text-muted-foreground" />
                          {course.course_detail.course_dept_detail.dept_name}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          Regulation: {course.regulation}
                        </span>
                      </div>
                      <p className="text-sm">{getRelationshipContext(relationshipCode, userRoles, course)}</p>
                    </div>
                  </CardDescription>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {canEdit && (
                <Button
                  className="flex gap-1.5 items-center"
                  onClick={() => setShowEditDialog(true)}
                >
                  <Pencil className="h-4 w-4" /> Edit Course
                </Button>
              )}
              {userRoles.includes('owner') && (
                <Button
                  variant="outline"
                  className="flex gap-1.5 items-center"
                  onClick={() => setShowReassignDialog(true)}
                >
                  <ArrowLeftRight className="h-4 w-4" /> Reassign Teaching
                </Button>
              )}
              {userRoles.includes('teacher') && !userRoles.includes('owner') && (
                <Button
                  variant="outline"
                  className="flex gap-1.5 items-center"
                  onClick={() => setShowReassignDialog(true)}
                >
                  <ArrowLeftRight className="h-4 w-4" /> Request Reassignment
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="destructive"
                  className="flex gap-1.5 items-center"
                  onClick={handleDeleteCourse}
                  disabled={isDeleting}
                >
                  {isDeleting ?
                    <Loader2 className="h-4 w-4 animate-spin" /> :
                    <Trash className="h-4 w-4" />}
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-muted/30 p-4 rounded-lg">
            <StatItem
              icon={Clock}
              label="Credit Hours"
              value={course.credits}
            />
            <StatItem
              icon={AlarmClock}
              label="Lecture Hours"
              value={course.lecture_hours}
            />
            <StatItem
              icon={TimerReset}
              label="Tutorial Hours"
              value={course.tutorial_hours}
            />
            <StatItem
              icon={Users}
              label="Students"
              value={course.no_of_students}
            />
          </div>

          <div className="mt-6">
            <Tabs defaultValue="teaching">
              <TabsList>
                <TabsTrigger value="teaching" className="flex items-center gap-1.5">
                  <School className="h-4 w-4" />
                  Teaching Information
                </TabsTrigger>
                <TabsTrigger value="details" className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  Course Details
                </TabsTrigger>
                <TabsTrigger value="relationship" className="flex items-center gap-1.5">
                  <ArrowLeftRight className="h-4 w-4" />
                  Department Roles
                </TabsTrigger>
                <TabsTrigger value="room-preferences" className="flex items-center gap-1.5">
                  <LayoutGrid className="h-4 w-4" />
                  Room Preferences
                </TabsTrigger>
              </TabsList>

              <TabsContent value="teaching" className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="py-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Building className="h-5 w-5 text-primary" />
                        Department Roles
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Course Owner</h3>
                          <p className="text-base font-medium mt-1 flex items-center gap-1.5">
                            <Building className="h-4 w-4 text-blue-500" />
                            {course.course_detail.course_dept_detail.dept_name}
                          </p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Teaching Department</h3>
                          <p className="text-base font-medium mt-1 flex items-center gap-1.5">
                            <School className="h-4 w-4 text-orange-500" />
                            {course.teaching_dept_detail.dept_name}
                            {isOwnCourse && (
                              <Badge
                                variant="outline"
                                className="ml-2 bg-blue-500/5 text-blue-500 border-blue-500/20"
                              >
                                Self-Taught
                              </Badge>
                            )}
                          </p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">For Department</h3>
                          <p className="text-base font-medium mt-1 flex items-center gap-1.5">
                            <Users className="h-4 w-4 text-green-500" />
                            {course.for_dept_detail.dept_name}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="py-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        Course Attributes
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-6">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Year & Semester</h3>
                            <p className="text-base font-medium mt-1">
                              Year {course.course_year}, Semester {course.course_semester}
                            </p>
                          </div>

                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Course Type</h3>
                            <div className="mt-1 flex flex-wrap gap-2">
                              <Badge variant="outline">
                                {course.course_type === 'T' ? 'Theory' :
                                  course.course_type === 'L' ? 'Lab' :
                                    course.course_type === 'LoT' ? 'Lab & Theory' : course.course_type}
                              </Badge>

                              <Badge variant="outline">
                                {course.elective_type === 'NE' ? 'Non-Elective' :
                                  course.elective_type === 'PE' ? 'Professional Elective' :
                                    course.elective_type === 'OE' ? 'Open Elective' : course.elective_type}
                              </Badge>

                              {course.lab_type && course.lab_type !== 'NULL' && (
                                <Badge variant="outline">
                                  {course.lab_type === 'TL' ? 'Technical Lab' :
                                    course.lab_type === 'NTL' ? 'Non-Technical Lab' : course.lab_type}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                          <div className="mt-1.5">
                            <Badge
                              variant={
                                course.teaching_status === 'active' ? 'default' :
                                  course.teaching_status === 'inactive' ? 'secondary' :
                                    'outline'
                              }
                              className={
                                course.teaching_status === 'active' ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20' :
                                  course.teaching_status === 'inactive' ? 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20 border-gray-500/20' :
                                    'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20'
                              }
                            >
                              {course.teaching_status === 'active' ? 'Active' :
                                course.teaching_status === 'inactive' ? 'Inactive' : 'Pending'}
                            </Badge>

                            {course.need_assist_teacher && (
                              <Badge className="ml-2 bg-purple-500/10 text-purple-500 border-purple-500/20">
                                Needs Assistant Teacher
                              </Badge>
                            )}

                            {course.is_zero_credit_course && (
                              <Badge className="ml-2 bg-red-500/10 text-red-500 border-red-500/20">
                                Zero Credit
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="details" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h3 className="font-medium text-base mb-3">Course Structure</h3>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-primary" />
                              <span>Lecture Hours</span>
                            </div>
                            <Badge variant="outline">{course.lecture_hours}</Badge>
                          </div>

                          <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-primary" />
                              <span>Tutorial Hours</span>
                            </div>
                            <Badge variant="outline">{course.tutorial_hours}</Badge>
                          </div>

                          <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-primary" />
                              <span>Practical Hours</span>
                            </div>
                            <Badge variant="outline">{course.practical_hours}</Badge>
                          </div>

                          <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-primary" />
                              <span>Total Credits</span>
                            </div>
                            <Badge variant="outline">{course.credits}</Badge>
                          </div>
                        </div>
                      </div>

                      {/* Additional details can be added in other columns */}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="relationship" className="mt-4">
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ArrowLeftRight className="h-5 w-5 text-primary" />
                      Course Relationships
                    </CardTitle>
                    <CardDescription>
                      How different departments interact with this course
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-6">
                    <div className="space-y-6">
                      <div className="p-4 rounded-lg bg-muted/30">
                        <h3 className="text-base font-medium mb-2">Relationship Type</h3>
                        <Badge
                          className={`text-sm py-1 px-3 ${getRelationshipBadgeColor(relationshipCode)}`}
                        >
                          {getRelationshipDisplayName(relationshipCode, userRoles)}
                        </Badge>
                        <p className="mt-3 text-muted-foreground">
                          {course.relationship_type?.description}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-lg border">
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Owning Department</h3>
                          <p className="text-base font-medium flex items-center gap-1.5">
                            <Building className="h-4 w-4 text-blue-500" />
                            {course.course_detail.course_dept_detail.dept_name}
                          </p>
                          <p className="mt-2 text-xs text-muted-foreground">
                            Responsible for curriculum design, course content, and maintaining academic standards
                          </p>
                        </div>

                        <div className="p-4 rounded-lg border">
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">For Department</h3>
                          <p className="text-base font-medium flex items-center gap-1.5">
                            <Users className="h-4 w-4 text-green-500" />
                            {course.for_dept_detail.dept_name}
                          </p>
                          <p className="mt-2 text-xs text-muted-foreground">
                            Department whose students will take this course as part of their academic program
                          </p>
                        </div>

                        <div className="p-4 rounded-lg border">
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Teaching Department</h3>
                          <p className="text-base font-medium flex items-center gap-1.5">
                            <School className="h-4 w-4 text-orange-500" />
                            {course.teaching_dept_detail.dept_name}
                          </p>
                          <p className="mt-2 text-xs text-muted-foreground">
                            Department that provides faculty to teach the course and handle course delivery
                          </p>
                        </div>
                      </div>

                      <div className="p-4 rounded-lg border">
                        <h3 className="text-base font-medium mb-3">Department Roles</h3>
                        <div className="space-y-3">
                          <div>
                            <strong className="flex items-center gap-1.5 text-blue-600">
                              <Building className="h-4 w-4" />
                              Course Owner:
                            </strong>
                            <p className="ml-6 mt-1 text-sm text-muted-foreground">
                              The department that created the course and controls its content
                            </p>
                          </div>

                          <div>
                            <strong className="flex items-center gap-1.5 text-green-600">
                              <Users className="h-4 w-4" />
                              For Students:
                            </strong>
                            <p className="ml-6 mt-1 text-sm text-muted-foreground">
                              The department whose students take this course
                            </p>
                          </div>

                          <div>
                            <strong className="flex items-center gap-1.5 text-orange-600">
                              <School className="h-4 w-4" />
                              Teaching Department:
                            </strong>
                            <p className="ml-6 mt-1 text-sm text-muted-foreground">
                              The department responsible for teaching this course
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <h3 className="text-base font-medium mb-3">Relationship Diagram</h3>
                        <div className="p-6 bg-muted/20 rounded-lg flex items-center justify-center">
                          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                            <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20 text-center">
                              <div className="text-sm font-medium">Owning Department</div>
                              <div className="font-bold mt-1">{course.course_detail.course_dept_detail.dept_name}</div>
                            </div>

                            <ArrowLeftRight className="h-6 w-6 text-muted-foreground rotate-90 md:rotate-0" />

                            <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20 text-center">
                              <div className="text-sm font-medium">For Department</div>
                              <div className="font-bold mt-1">{course.for_dept_detail.dept_name}</div>
                            </div>

                            <ArrowLeftRight className="h-6 w-6 text-muted-foreground rotate-90 md:rotate-0" />

                            <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20 text-center">
                              <div className="text-sm font-medium">Teaching Department</div>
                              <div className="font-bold mt-1">{course.teaching_dept_detail.dept_name}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="room-preferences" className="mt-4">
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <LayoutGrid className="h-5 w-5 text-primary" />
                      Room Preferences
                    </CardTitle>
                    <CardDescription>
                      Manage room preferences for this course
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-6">
                    <div className="text-center py-6">
                      <Button onClick={() => navigate(`/courses/${courseId}/room-preferences`)}>
                        Manage Room Preferences
                      </Button>
                      <p className="text-sm text-muted-foreground mt-2">
                        Click to view and manage room preferences for this course
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Edit Course Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px] overflow-hidden">
          <ScrollArea className="h-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Pencil className="h-5 w-5 text-primary" />
                Edit Course
              </DialogTitle>
              <DialogDescription>
                Update course details for {course.course_detail.course_id} - {course.course_detail.course_name}
              </DialogDescription>
            </DialogHeader>

            <CourseForm
              departments={departments}
              courseMasters={courseMasters}
              defaultValues={defaultValues}
              isLoading={isUpdating || loadingDepartments || loadingCourseMasters}
              onSubmit={handleUpdateCourse}
              onCancel={() => setShowEditDialog(false)}
              submitLabel="Save Changes"
              isEdit={true}
              editableFields={editableFields}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this course?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the course
              <span className="font-semibold"> {course?.course_detail.course_id} - {course?.course_detail.course_name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {showReassignDialog && (
        <ReassignDialog
          course={course}
          departments={departments}
          open={showReassignDialog}
          onClose={() => setShowReassignDialog(false)}
          onSuccess={() => refetch()}
        />
      )}

    </div>
  );
} 