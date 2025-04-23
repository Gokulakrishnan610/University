import { Route, Routes } from "react-router";
import Profile from "./profile/page";
import Setting from "./setting/page";
import HomePage from './dashboard/page'
import CourseManagement from './courses/page';
import TeacherManagement from './teachers/page';
import CourseDetails from "./courses/[id]/page";
import TeacherDetails from "./teachers/[id]/page";

export default function Dashboard() {
  // const {data, isPending} = useGetCourses()

  return (
    <Routes>
      <Route path='/' element={<HomePage/>} index/>
      <Route path="/profile" element={<Profile />} />
      <Route path="/setting" element={<Setting />} />
      <Route path="/courses" element={<CourseManagement />} />
      <Route path="/courses/:id" element={<CourseDetails />} />
      <Route path="/teachers" element={<TeacherManagement />} />
      <Route path="/teachers/:id" element={<TeacherDetails />} />
    </Routes>
  );
} 