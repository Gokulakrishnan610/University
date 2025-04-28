import React from 'react';
import { useParams, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Pencil, User, Book, GraduationCap, School } from 'lucide-react';
import { useGetStudent } from '@/action/student';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const StudentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const studentId = parseInt(id || '0', 10);

  // Fetch student data
  const { data: student, isPending: isLoading } = useGetStudent(studentId);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {isLoading ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-64 rounded-lg" />
            <Skeleton className="h-64 rounded-lg" />
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
            <Button onClick={() => navigate(`/students/${studentId}/edit`)}>
              <Pencil className="mr-2 h-4 w-4" /> Edit Student
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="overflow-hidden border-0 shadow-md">
              <div className="bg-primary px-6 py-5">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-primary-foreground flex items-center">
                    <User className="h-5 w-5 mr-2" /> Personal Info
                  </CardTitle>
                  <Badge variant="secondary">{student?.student_type}</Badge>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Student ID</p>
                    <p className="text-lg font-medium">{student?.student}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Roll Number</p>
                    <p className="text-lg font-medium">{student?.roll_no || 'Not assigned'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Dept Detail</p>
                    <p className="text-lg font-medium">{student?.dept_detail.dept_name || 'Not assigned'}</p>
                  </div>
                  <Separator />
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-0 shadow-md">
              <div className="bg-blue-500 px-6 py-5">
                <CardTitle className="text-primary-foreground flex items-center">
                  <Book className="h-5 w-5 mr-2" /> Academic Details
                </CardTitle>
              </div>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Batch</p>
                    <p className="text-lg font-medium">{student?.batch}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Current Semester</p>
                    <p className="text-lg font-medium">{student?.current_semester}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Year</p>
                    <p className="text-lg font-medium">{student?.year}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-0 shadow-md">
              <div className="bg-teal-500 px-6 py-5">
                <CardTitle className="text-primary-foreground flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2" /> Program Details
                </CardTitle>
              </div>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Degree Type</p>
                    <div className="mt-2">
                      <Badge variant="outline" className="text-base px-3 py-1">
                        {student?.degree_type === 'UG' ? 'Undergraduate' : 'Postgraduate'}
                      </Badge>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Admission Type</p>
                    <div className="mt-2">
                      <Badge 
                        variant={student?.student_type === 'Mgmt' ? 'default' : 'secondary'}
                        className="text-base px-3 py-1"
                      >
                        {student?.student_type === 'Mgmt' ? 'Management' : 'Government'}
                      </Badge>
                    </div>
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