import { useParams, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Pencil, User, Book, GraduationCap, School, Mail, Phone, Calendar, Info, Award, UserCircle, Building, Hash } from 'lucide-react';
import { useGetStudent } from '@/action/student';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge'

const StudentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const studentId = parseInt(id || '0', 10);

  // Fetch student data
  const { data: student, isPending: isLoading } = useGetStudent(studentId);

  return (
    <div className="p-6 mx-auto">
      {isLoading ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-64 rounded-lg" />
            <Skeleton className="h-64 rounded-lg" />
            <Skeleton className="h-64 rounded-lg" />
          </div>
        </div>
      ) : (
        <>
          <div className="mb-8 flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <UserCircle className="h-10 w-10" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  {student?.student_detail?.first_name} {student?.student_detail?.last_name}
                </h1>
                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                  <Badge variant="outline" className="font-normal">
                    ID: {student?.id}
                  </Badge>
                  <Badge variant="outline" className="font-normal">
                    {student?.roll_no || 'No Roll Number'}
                  </Badge>
                  <Badge
                    variant={student?.student_type === 'Mgmt' ? 'default' : 'secondary'}
                    className="font-normal"
                  >
                    {student?.student_type === 'Mgmt' ? 'Management' : 'Government'}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => navigate(`/students/${studentId}/edit`)}>
                <Pencil className="h-4 w-4 mr-2" /> Edit Student
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Personal Information Card */}
            <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-5">
                <CardTitle className="text-white flex items-center text-lg">
                  <User className="h-5 w-5 mr-2" /> Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-[20px_1fr] gap-3 items-start">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                      <p className="font-medium break-all">{student?.student_detail?.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-[20px_1fr] gap-3 items-start">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                      <p className="font-medium">{student?.student_detail?.phone_number}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-[20px_1fr] gap-3 items-start">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Gender</p>
                      <p className="font-medium">{student?.student_detail?.gender === 'M' ? 'Male' : 'Female'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-[20px_1fr] gap-3 items-start">
                    <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Department</p>
                      <p className="font-medium">{student?.dept_detail?.dept_name || 'Not assigned'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Academic Details Card */}
            <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-5">
                <CardTitle className="text-white flex items-center text-lg">
                  <Book className="h-5 w-5 mr-2" /> Academic Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-[20px_1fr] gap-3 items-start">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Batch</p>
                      <p className="font-medium">{student?.batch}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-[20px_1fr] gap-3 items-start">
                    <Hash className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Current Semester</p>
                      <div className="mt-1">
                        <Badge variant="outline" className="px-2.5 py-0.5">
                          Semester {student?.current_semester}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-[20px_1fr] gap-3 items-start">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Academic Year</p>
                      <p className="font-medium">{student?.year}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Current Progress</p>
                      <p className="text-sm text-muted-foreground">
                        Semester {student?.current_semester}/8
                      </p>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(student?.current_semester / 8) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Program Details Card */}
            <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-5">
                <CardTitle className="text-white flex items-center text-lg">
                  <GraduationCap className="h-5 w-5 mr-2" /> Program Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-[20px_1fr] gap-3 items-start">
                    <Award className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Degree Type</p>
                      <div className="mt-1">
                        <Badge className="px-3 py-1 text-base" variant={student?.degree_type === 'UG' ? 'default' : 'secondary'}>
                          {student?.degree_type === 'UG' ? 'Undergraduate' : 'Postgraduate'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-[20px_1fr] gap-3 items-start">
                    <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Admission Type</p>
                      <div className="mt-1">
                        <Badge variant={student?.student_type === 'Mgmt' ? 'default' : 'secondary'} className="text-base px-3 py-1">
                          {student?.student_type === 'Mgmt' ? 'Management Quota' : 'Government Quota'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/20 rounded-lg mt-4">
                    <h4 className="font-medium mb-1 flex items-center">
                      <School className="h-4 w-4 mr-2 text-muted-foreground" />
                      Academic Status
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Currently enrolled as a {student?.degree_type === 'UG' ? 'Undergraduate' : 'Postgraduate'} student
                      in {student?.dept_detail?.dept_name || 'their department'}, batch of {student?.batch}.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default StudentDetails; 