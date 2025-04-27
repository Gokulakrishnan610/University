import { Route, Routes } from "react-router";
import Profile from "./profile/page";
import Setting from "./setting/page";
import HomePage from './dashboard/page'
import CourseManagement from './courses/page';
import TeacherManagement from './teachers/page';
import CourseDetails from "./courses/[id]/page";
import TeacherDetails from "./teachers/[id]/page";
import TeacherCourseAssignmentPage from "./teacher-course-assignment/page";
import TeacherCourseAssignmentDetail from "./teacher-course-assignment/[id]/page";
import TeacherCourseAssignmentCreate from './teacher-course-assignment/create/page'
import AllCoursesPage from "./courses/all-courses/page";
import AllocationManagementPage from "./courses/allocations/page";
import CourseRoomPreferencesPage from "./courses/[id]/room-preferences/page";
import StudentManagement from "./students/page";
import StudentDetails from "./students/[id]/page";
import StudentCreate from "./students/create/page";
import StudentEdit from "./students/[id]/edit/page";


export default function Dashboard() {

  return (
    <Routes>
      <Route path='/' element={<HomePage />} index />
      <Route path="/profile" element={<Profile />} />
      <Route path="/setting" element={<Setting />} />
      <Route path="/courses" element={<CourseManagement />} />
      <Route path="/courses/all-courses" element={<AllCoursesPage />} />
      <Route path="/courses/allocations" element={<AllocationManagementPage />} />
      <Route path="/courses/:id" element={<CourseDetails />} />
      <Route path="/courses/:id/room-preferences" element={<CourseRoomPreferencesPage />} />
      <Route path="/teachers" element={<TeacherManagement />} />
      <Route path="/teachers/:id" element={<TeacherDetails />} />
      <Route path="/teacher-course-assignment" element={<TeacherCourseAssignmentPage />} />
      <Route path="/teacher-course-assignment/create" element={<TeacherCourseAssignmentCreate />} />
      <Route path="/teacher-course-assignment/:id" element={<TeacherCourseAssignmentDetail />} />
      <Route path="/students" element={<StudentManagement />} />
      <Route path="/students/create" element={<StudentCreate />} />
      <Route path="/students/:id" element={<StudentDetails />} />
      <Route path="/students/:id/edit" element={<StudentEdit />} />
    </Routes>
  );
} 