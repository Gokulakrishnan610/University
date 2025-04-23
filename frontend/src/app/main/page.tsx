import { Route, Routes } from "react-router";
import Profile from "./profile/page";
import Setting from "./setting/page";
export default function Dashboard() {

  return (
    <Routes>
      <Route path="/profile" element={<Profile />} />
      <Route path="/setting" element={<Setting />} />
    </Routes>
  );
} 