import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, User, BookOpen, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useGetStudent, useUpdateStudent, UpdateStudentRequest, Student } from '@/action/student';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useGetCurrentDepartment } from '@/action';

// Define the validation schema using Zod
const studentFormSchema = z.object({
  // User information fields
  email: z.string().email({ message: "Please enter a valid email address" }),
  first_name: z.string().min(1, { message: "First name is required" }),
  last_name: z.string().min(1, { message: "Last name is required" }),
  phone_number: z.string().min(7, { message: "Please enter a valid phone number" }),
  gender: z.enum(["M", "F"], {
    required_error: "Gender is required",
  }),

  // Student information fields
  batch: z.number().int().positive({ message: "Batch year is required" }),
  current_semester: z.number().int().min(1).max(10, { message: "Semester must be between 1 and 10" }),
  year: z.number().int().min(1).max(5, { message: "Year must be between 1 and 5" }),
  dept_id: z.number().int().nullable().optional(),
  roll_no: z.string().nullable().optional(),
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
  const { data: department } = useGetCurrentDepartment();

  // Initialize form with Zod schema
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      email: "",
      first_name: "",
      last_name: "",
      phone_number: "",
      gender: "M",
      batch: new Date().getFullYear(),
      current_semester: 1,
      year: 1,
      roll_no: "",
      dept_id: department?.id,
      student_type: "Mgmt",
      degree_type: "UG",
    },
  });

  // Update form data when student data is loaded
  useEffect(() => {
    if (student && !isLoading) {
      // Reset form with student data
      form.reset({
        email: student.student_detail?.email || "",
        first_name: student.student_detail?.first_name || "",
        last_name: student.student_detail?.last_name || "",
        phone_number: student.student_detail?.phone_number || "",
        gender: student.student_detail?.gender || "M",
        batch: student.batch || new Date().getFullYear(),
        current_semester: student.current_semester || 1,
        year: student.year || 1,
        dept_id: student.dept_id || department?.id,
        roll_no: student.roll_no || "",
        student_type: student.student_type as "Mgmt" | "Govt",
        degree_type: student.degree_type as "UG" | "PG",
      });

      setDataLoaded(true);
    } else if (!student && !isLoading) {
      setHasError(true);
    }
  }, [student, isLoading, form, department?.id]);

  // Update student mutation
  const { mutate: updateStudent, isPending: isSubmitting } = useUpdateStudent(studentId, () => {
    navigate(`/students/${studentId}`);
  });

  // Form submission handler
  const onSubmit = (data: StudentFormValues) => {
    updateStudent(data as UpdateStudentRequest);
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
          <p className="text-muted-foreground ml-10">Update student information</p>
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
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Email <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="h-11"
                              placeholder="Enter email address"
                            />
                          </FormControl>
                          <FormDescription>
                            Student will use this email to login
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">First Name <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="h-11"
                              placeholder="Enter first name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Last Name <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="h-11"
                              placeholder="Enter last name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Phone Number <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="h-11"
                              placeholder="Enter phone number"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Gender <span className="text-red-500">*</span></FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="M">Male</SelectItem>
                              <SelectItem value="F">Female</SelectItem>
                            </SelectContent>
                          </Select>
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
                  </div>
                </TabsContent>

                <TabsContent value="academic" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="batch"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Batch Year <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              className="h-11"
                              placeholder="Enter batch year"
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            The year the student joined
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Current Year <span className="text-red-500">*</span></FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            value={field.value.toString()}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Select year" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1">Year 1</SelectItem>
                              <SelectItem value="2">Year 2</SelectItem>
                              <SelectItem value="3">Year 3</SelectItem>
                              <SelectItem value="4">Year 4</SelectItem>
                              <SelectItem value="5">Year 5</SelectItem>
                            </SelectContent>
                          </Select>
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
                          <Select
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            value={field.value.toString()}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Select semester" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1">Semester 1</SelectItem>
                              <SelectItem value="2">Semester 2</SelectItem>
                              <SelectItem value="3">Semester 3</SelectItem>
                              <SelectItem value="4">Semester 4</SelectItem>
                              <SelectItem value="5">Semester 5</SelectItem>
                              <SelectItem value="6">Semester 6</SelectItem>
                              <SelectItem value="7">Semester 7</SelectItem>
                              <SelectItem value="8">Semester 8</SelectItem>
                              <SelectItem value="9">Semester 9</SelectItem>
                              <SelectItem value="10">Semester 10</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="student_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Admission Type <span className="text-red-500">*</span></FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Select admission type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Mgmt">Management</SelectItem>
                              <SelectItem value="Govt">Government</SelectItem>
                            </SelectContent>
                          </Select>
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

                    <FormField
                      control={form.control}
                      name="dept_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Department</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              value={field.value || ""}
                              className="h-11"
                              placeholder="Department ID"
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                              disabled
                            />
                          </FormControl>
                          <FormDescription>
                            Department cannot be changed
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/students/${studentId}`)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentEdit; 