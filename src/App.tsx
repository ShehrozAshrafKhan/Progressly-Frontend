// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// import Login from "./Pages/Auth/Login/Login";
// import AdminDashboard from "./Pages/Dashboard/Dashboard";
// import Tasks from "./Pages/Task.tsx/Tasks";
// import Projects from "./Pages/Projects/Projects";
// import AddNewProject from "./Pages/Projects/AddNewProject";
// import EditProject from "./Pages/Projects/EditProject";
// import Modules from "./Pages/Modules/Modules";
// import AddNewModule from "./Pages/Modules/AddNewModule";
// import EditModule from "./Pages/Modules/EditModule";
// import Tags from "./Pages/Tags/Tags";
// import AddNewTag from "./Pages/Tags/AddNewTag";
// import EditTag from "./Pages/Tags/EditTag";
// import AddNewUser from "./Pages/Users/AddNewUser";
// import Admins from "./Pages/Users/Admins";
// import AddNewTask from "./Pages/Task.tsx/AddNewTask";
// import Unauthorized from "./Pages/Auth/Unauthorized/Unauthorized";
// import ProtectedRoute from "./Pages/Auth/ProtectedRoute";
// import Dashboard from "./Pages/Dashboard/Dashboard";
// import UpdateProfile from "./Pages/Users/UpdateProfile";
// import Layout from "./layouts/Layout";

// function App() {
//   return (
//     <Router>
//       {/* Toast container globally */}
//       <ToastContainer
//         position="top-right"
//         autoClose={3000}
//         hideProgressBar={false}
//         closeOnClick
//         pauseOnHover
//         draggable
//       />

//       {/* Define your routes */}
//       <Routes>
//         <Route path="/" element={<Layout />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/dashboard" element={<Dashboard />} />
//         <Route path="/admin/projects" element={<Projects />} />
//         <Route path="/admin/addNewProject" element={<AddNewProject />} />
//         <Route path="/admin/editProject" element={<EditProject />} />
//         <Route path="/admin/editProject/:projectId" element={<EditProject />} />

//         <Route path="/admin/modules" element={<Modules />} />
//         <Route path="/admin/addNewModule" element={<AddNewModule />} />
//         <Route path="/admin/editModule" element={<EditModule />} />
//         <Route path="/admin/editModule/:moduleId" element={<EditModule />} />

//         <Route path="/admin/tags" element={<Tags />} />
//         <Route path="/admin/addNewTag" element={<AddNewTag />} />
//         <Route path="/admin/editTag" element={<EditTag />} />
//         <Route path="/admin/editTag/:tagId" element={<EditTag />} />

//         <Route path="/admin/users/addNewUser" element={<AddNewUser />} />
//         <Route path="/admin/users/admins" element={<Admins />} />
//         <Route path="/users/updateProfile" element={<UpdateProfile />} />

//         <Route path="/tasks" element={<Tasks />} />
//         <Route path="/tasks/addNewTask" element={<AddNewTask />} />
//         <Route path="/unauthorized" element={<Unauthorized />} />

//         <Route
//           path="/admin"
//           element={
//             <ProtectedRoute allowedRoles={["ADMIN"]}>
//               <Dashboard />
//             </ProtectedRoute>
//           }
//         />
//       </Routes>
//     </Router>
//   );
// }

// export default App;


import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Projects from "./Pages/Projects/Projects";
import Login from "./Pages/Auth/Login/Login";
import ProtectedRoute from "./Pages/Auth/ProtectedRoute";
import Dashboard from "./Pages/Dashboard/Dashboard";
import EditProject from "./Pages/Projects/EditProject";
import AddNewProject from "./Pages/Projects/AddNewProject";
import EditModule from "./Pages/Modules/EditModule";
import AddNewModule from "./Pages/Modules/AddNewModule";
import Modules from "./Pages/Modules/Modules";
import Tags from "./Pages/Tags/Tags";
import AddNewTag from "./Pages/Tags/AddNewTag";
import EditTag from "./Pages/Tags/EditTag";
import Tasks from "./Pages/Task/Tasks";
import AddNewTask from "./Pages/Task/AddNewTask";
import AddNewUser from "./Pages/Users/AddNewUser";
import Admins from "./Pages/Users/Admins";
import UpdateProfile from "./Pages/Users/UpdateProfile";
import Unauthorized from "./Pages/Auth/Unauthorized/Unauthorized";
import UserTasksDetail from "./Pages/Task/UserTasksDetail";
import EditTask from "./Pages/Task/EditTask";
import Users from "./Pages/Dashboard/Users/Users";
import PendingApprovals from "./Pages/Task/PendingApprovals";
import CompletedTasks from "./Pages/Task/CompletedTasks";
import PendingTasks from "./Pages/Task/PendingTasks";
import UserWiseTasks from "./Pages/Reports/Tasks/UserWiseTasks/UserWiseTasks";
import DateWiseTasks from "./Pages/Reports/Tasks/DateWiseTasks/DateWiseTasks";
import WeeklySummaryReport from "./Pages/Reports/Tasks/WeeklySummaryReport/WeeklySummaryReport";
import ChangeLogo from "./Pages/Settings/ChangeLogo";

const App = () => {
  return (
    <Router>
      {/* Toast container globally */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />
      {/* Define your routes */}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users/getAllActiveUsers" element={<Users />} />


        <Route path="/admin/projects" element={<Projects />} />
        <Route path="/admin/addNewProject" element={<AddNewProject />} />
        <Route path="/admin/editProject" element={<EditProject />} />
        <Route path="/admin/editProject/:projectId" element={<EditProject />} />

        
        <Route path="/admin/modules" element={<Modules />} />
        <Route path="/admin/addNewModule" element={<AddNewModule />} />
        <Route path="/admin/editModule" element={<EditModule />} />
        <Route path="/admin/editModule/:moduleId" element={<EditModule />} />

        <Route path="/admin/tags" element={<Tags />} />
        <Route path="/admin/addNewTag" element={<AddNewTag />} />
        <Route path="/admin/editTag" element={<EditTag />} />
        <Route path="/admin/editTag/:tagId" element={<EditTag />} />

        
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/tasks/addNewTask" element={<AddNewTask />} />
        <Route path="/tasks/editTask" element={<EditTask />} />
        <Route path="/tasks/editTask/:taskId" element={<EditTask />} />
        <Route path="/tasks/userTasksDetail" element={<UserTasksDetail />} />
        <Route path="/tasks/userTasksDetail/:type" element={<UserTasksDetail />} />
        <Route path="/admin/tasks/pendingApprovals" element={<PendingApprovals />} />
        <Route path="/tasks/completedTasks" element={<CompletedTasks />} />
        <Route path="/tasks/pendingTasks" element={<PendingTasks />} />
     
     
     
        <Route path="/reports/userWiseReports" element={<UserWiseTasks />} />
        <Route path="/reports/dateWiseReports" element={<DateWiseTasks />} />
        <Route path="/reports/weeklySummaryReport" element={<WeeklySummaryReport />} />

     
        <Route path="/admin/users/addNewUser" element={<AddNewUser />} />
        <Route path="/admin/users/admins" element={<Admins />} />
        <Route path="/users/updateProfile" element={<UpdateProfile />} />


        <Route path="/settings/changeLogo" element={<ChangeLogo />} />

        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

      </Routes>
    </Router>
  );
};

export default App;
