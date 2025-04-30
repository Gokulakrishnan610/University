import React from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCreateStudent, CreateStudentRequest } from '@/action/student';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  student: z.number().int().positive({ message: "Student ID is required" }),
  batch: z.number().int().positive({ message: "Batch year is required" }),
  current_semester: z.number().int().min(1).max(10, { message: "Semester must be between 1 and 10" }),
  year: z.number().int().min(1).max(5, { message: "Year must be between 1 and 5" }),
  dept: z.number().int().nullable().optional(),
  roll_no: z.string().nullable().optional(),
  student_type: z.enum(["Mgmt", "Govt"], { 
    required_error: "Student type is required",
  }),
  degree_type: z.enum(["UG", "PG"], { 
    required_error: "Degree type is required",
  }),
});

type StudentFormValues = z.infer<typeof studentFormSchema>;

const StudentCreate = () => {
  const navigate = useNavigate();
  const { data: department } = useGetCurrentDepartment();
  console.log(department);

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
  
  // Handle form submission
  const { mutate: createStudent, isPending: isSubmitting } = useCreateStudent(() => {
    navigate('/students');
  });

  // Form submission handler
  const onSubmit = (data: StudentFormValues) => {
    createStudent(data as CreateStudentRequest);
  };

  return (
    <div className="p-6 mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8"
              onClick={() => navigate('/students')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold tracking-tight inline-flex items-center">
              Add New Student
            </h1>
          </div>
          <p className="text-muted-foreground ml-10">Create a new student record</p>
        </div>
      </div>

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
                      name="student_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Student Type <span className="text-red-500">*</span></FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
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
                              onChange={(e) => field.onChange(parseInt(e.target.value) || new Date().getFullYear())}
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
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
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
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
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
                    onClick={() => navigate('/students')}
                    className="w-28"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || form.formState.isSubmitting}
                    className="w-28"
                  >
                    {isSubmitting || form.formState.isSubmitting ? 'Creating...' : 'Create'}
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

export default StudentCreate; 