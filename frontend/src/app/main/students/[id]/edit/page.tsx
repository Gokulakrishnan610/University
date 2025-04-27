import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, User, BookOpen, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGetStudent, useUpdateStudent, UpdateStudentRequest, Student } from '@/action/student';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define the validation schema using Zod
const studentFormSchema = z.object({
  student: z.number().int().positive({ message: "Student ID is required" }),
  batch: z.number().int().positive({ message: "Batch year is required" }),
  current_semester: z.number().int().min(1).max(10, { message: "Semester must be between 1 and 10" }),
  year: z.number().int().min(1).max(5, { message: "Year must be between 1 and 5" }),
  dept: z.number().int().nullable(),
  roll_no: z.string().nullable(),
  student_type: z.enum(["Mgmt", "Govt"], { 
    required_error: "Student type is required",
  }),
  degree_type: z.enum(["UG", "PG"], { 
    required_error: "Degree type is required",
  }),
});

type StudentFormValues = z.infer<typeof studentFormSchema>;

const StudentEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const studentId = parseInt(id || '0', 10);
  
  const [dataLoaded, setDataLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Get student data
  const { data: student, isPending: isLoading, refetch } = useGetStudent(studentId);

  // Initialize form with Zod schema
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      student: 0,
      batch: new Date().getFullYear(),
      current_semester: 1,
      year: 1,
      roll_no: "",
      dept: null,
      student_type: "Mgmt",
      degree_type: "UG",
    },
  });

  // Update form data when student data is loaded
  useEffect(() => {
    if (student && typeof student === 'object') {
      console.log('Setting form data from student:', student);
      
      // Reset form with student data
      form.reset({
        student: student.student,
        batch: student.batch,
        current_semester: student.current_semester,
        year: student.year,
        dept: student.dept,
        roll_no: student.roll_no || "",
        student_type: student.student_type as "Mgmt" | "Govt",
        degree_type: student.degree_type as "UG" | "PG",
      });
      
      setDataLoaded(true);
    }
  }, [student, form]);

  // Update student mutation
  const { mutate: updateStudent, isPending: isSubmitting } = useUpdateStudent(studentId, () => {
    navigate(`/students/${studentId}`);
  });

  // Form submission handler
  const onSubmit = (data: StudentFormValues) => {
    console.log('Submitting form data:', data);
    updateStudent(data);
  };

  // Main loading state
  if (isLoading) {
    return (
      <div className="p-6 mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-48" />
        </div>
        <Skeleton className="h-[600px] w-full rounded-lg" />
      </div>
    );
  }

  // Error state
  if (hasError || (!student && !isLoading && !dataLoaded)) {
    return (
      <div className="p-6 mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={() => navigate('/students')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Error Loading Student</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Could not load student data. The student might not exist or there may be an API error.
              </AlertDescription>
            </Alert>
            <p className="text-center text-muted-foreground py-4">
              Try loading the data again or go back to the student list.
            </p>
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={() => navigate('/students')}>
                Back to Students
              </Button>
              <Button onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8"
              onClick={() => navigate(`/students/${studentId}`)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold tracking-tight inline-flex items-center">
              Edit Student <span className="text-muted-foreground text-xl font-normal ml-2">ID: {studentId}</span>
            </h1>
          </div>
        </div>
      </div>

      {!dataLoaded && !isLoading ? (
        <Card className="mb-6">
          <CardContent className="p-4">
            <Alert className="mb-0">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                Student data is loading. Please wait a moment for the form to be populated.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      ) : null}

      <Card className="border border-border/40 shadow-sm">
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="mb-8 grid grid-cols-2">
                  <TabsTrigger value="personal" className="text-base">
                    <User className="mr-2 h-4 w-4" /> Personal Information
                  </TabsTrigger>
                  <TabsTrigger value="academic" className="text-base">
                    <BookOpen className="mr-2 h-4 w-4" /> Academic Information
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="student"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Student User ID <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              disabled
                              type="number" 
                              className="h-11 opacity-70" 
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            The User ID cannot be changed
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="roll_no"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Roll Number</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              value={field.value || ""}
                              className="h-11" 
                              placeholder="Enter roll number" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dept"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Department ID</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              value={field.value || ""}
                              type="number" 
                              disabled
                              className="h-11 opacity-70" 
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Department cannot be changed
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="student_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Student Type <span className="text-red-500">*</span></FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Select student type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Mgmt">Management</SelectItem>
                              <SelectItem value="Govt">Government</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Admission category of the student
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="academic" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="batch"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Batch <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              className="h-11" 
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Admission year of the student
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="current_semester"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Current Semester <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              min="1" 
                              max="10" 
                              className="h-11" 
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Year <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              min="1" 
                              max="5" 
                              className="h-11" 
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Current year of study
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="degree_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Degree Type <span className="text-red-500">*</span></FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Select degree type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="UG">Undergraduate</SelectItem>
                              <SelectItem value="PG">Postgraduate</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <div className="flex gap-3 justify-end pt-4 border-t mt-8">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate(`/students/${studentId}`)}
                    className="w-28"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || !dataLoaded || form.formState.isSubmitting}
                    className="w-28"
                  >
                    {isSubmitting || form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </Tabs>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentEdit; 