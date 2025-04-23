import { Route, Routes } from "react-router";
import Profile from "./profile/page";
import Setting from "./setting/page";
import HomePage from './dashboard/page'
import { useGetCourses } from "@/action";

export default function Dashboard() {
  // const {data, isPending} = useGetCourses()

  return (
    <Routes>
      <Route path='/' element={<HomePage/>} index/>
      <Route path="/profile" element={<Profile />} />
      <Route path="/setting" element={<Setting />} />
    </Routes>
  );
} 