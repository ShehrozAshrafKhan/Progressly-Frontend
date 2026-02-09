// import React, { useState } from 'react';
// import { NavLink } from 'react-router-dom';
// import './Sidebar.css';

// type MenuKey = 'tasks' | 'users' | 'configurations';

// type OpenMenuState = {
//   [key in MenuKey]: boolean;
// };

// const Sidebar = () => {
//   const [openMenu, setOpenMenu] = useState<OpenMenuState>({
//     tasks: false,
//     users: false,
//     configurations:false
//   });

//   const toggleMenu = (menu: MenuKey) => {
//     setOpenMenu((prev) => ({
//       ...prev,
//       [menu]: !prev[menu]
//     }));
//   };

//   return (
//     <div className="sidebar bg-dark text-white p-3">
//       <h4 className="text-center mb-4">Progressly</h4>
//       <ul className="nav flex-column">

//         <li className="nav-item mb-2">
//           <NavLink className="nav-link text-white" to="/dashboard">
//             <i className="bi bi-house-door-fill me-2"></i> Dashboard
//           </NavLink>
//         </li>

//         {/* Tasks - with toggle */}
//         <li className="nav-item mb-2">
//           <div
//             className="nav-link text-white d-flex justify-content-between align-items-center cursor-pointer"
//             onClick={() => toggleMenu('configurations')}
//           >
//             <span><i className="bi bi-card-checklist me-2"></i> Configurations</span>
//             <i className={`bi ${openMenu.configurations ? 'bi-chevron-down' : 'bi-chevron-right'}`}></i>
//           </div>
//           {openMenu.configurations && (
//             <ul className="nav flex-column ms-3">
//               <li className="nav-item">
//                 <NavLink className="nav-link text-white small" to="/admin/projects">
//                  Projects
//                 </NavLink>
//               </li>
//               <li className="nav-item">
//                 <NavLink className="nav-link text-white small" to="/admin/modules">
//                  Modules
//                 </NavLink>
//               </li>
//               <li className="nav-item">
//                 <NavLink className="nav-link text-white small" to="/admin/tags">
//                  Tags
//                 </NavLink>
//               </li>
//             </ul>
//           )}
//         </li>

//         {/* Tasks - with toggle */}
//         <li className="nav-item mb-2">
//           <div
//             className="nav-link text-white d-flex justify-content-between align-items-center cursor-pointer"
//             onClick={() => toggleMenu('tasks')}
//           >
//             <span><i className="bi bi-card-checklist me-2"></i> Tasks</span>
//             <i className={`bi ${openMenu.tasks ? 'bi-chevron-down' : 'bi-chevron-right'}`}></i>
//           </div>
//           {openMenu.tasks && (
//             <ul className="nav flex-column ms-3">
//               <li className="nav-item">
//                 <NavLink className="nav-link text-white small" to="/tasks">
//                   Tasks
//                 </NavLink>
//               </li>
//               <li className="nav-item">
//                 <NavLink className="nav-link text-white small" to="/admin/tasks/pending">
//                   Pending Tasks
//                 </NavLink>
//               </li>
//               <li className="nav-item">
//                 <NavLink className="nav-link text-white small" to="/admin/tasks/completed">
//                   Completed Tasks
//                 </NavLink>
//               </li>
//             </ul>
//           )}
//         </li>

//         {/* Users - with toggle */}
//         <li className="nav-item mb-2">
//           <div
//             className="nav-link text-white d-flex justify-content-between align-items-center cursor-pointer"
//             onClick={() => toggleMenu('users')}
//           >
//             <span><i className="bi bi-people-fill me-2"></i> Users</span>
//             <i className={`bi ${openMenu.users ? 'bi-chevron-down' : 'bi-chevron-right'}`}></i>
//           </div>
//           {openMenu.users && (
//             <ul className="nav flex-column ms-3">
//               <li className="nav-item">
//                 <NavLink className="nav-link text-white small" to="/admin/users/addNewUser">
//                  Add User
//                 </NavLink>
//               </li>
//               <li className="nav-item">
//                 <NavLink className="nav-link text-white small" to="/users/updateProfile">
//                  Update Profile
//                 </NavLink>
//               </li>
//               <li className="nav-item">
//                 <NavLink className="nav-link text-white small" to="/admin/users/admins">
//                   Admins
//                 </NavLink>
//               </li>
//               <li className="nav-item">
//                 <NavLink className="nav-link text-white small" to="/admin/users/employees">
//                   Employees
//                 </NavLink>
//               </li>
//             </ul>
//           )}
//         </li>

//         <li className="nav-item mb-2">
//           <NavLink className="nav-link text-white" to="/admin/settings">
//             <i className="bi bi-gear-fill me-2"></i> Settings
//           </NavLink>
//         </li>
//       </ul>
//     </div>
//   );
// };

// export default Sidebar;






import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css'
import { useUser } from '../../../contexts/UserContext';

interface SidebarProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, toggleSidebar }) => {
  const {user} = useUser();
  const role=user?.roles[0];
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

  const handleSubMenuToggle = (menuKey: string) => {
    setOpenSubMenu(prev => (prev === menuKey ? null : menuKey));
  };

  return (
    <>
      <div className={`bg-dark col-md-2 text-white sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-content p-3">
          <h5 className="mb-3">Menu</h5>
          <ul className="nav flex-column">

            {/* Dashboard */}
            <li className="nav-item mb-2">
              <NavLink to="/dashboard" className="nav-link text-white">
                <i className="bi bi-house me-2"></i> Dashboard
              </NavLink>
            </li>

            {/* Configurations with sub-links */}
            {role!=="USER"?<>
                 <li className="nav-item mb-2">
              <div
                className="nav-link text-white d-flex justify-content-between align-items-center"
                onClick={() => handleSubMenuToggle("configurations")}
                style={{ cursor: 'pointer' }}
              >
                <span>
                  <i className="bi bi-ui-checks-grid me-2"></i> Configurations
                </span>
                <i className={`bi ${openSubMenu === "configurations" ? "bi-chevron-up" : "bi-chevron-down"}`}></i>
              </div>
              {openSubMenu === "configurations" && (
                <ul className="nav flex-column ms-3">
                  <li className="nav-item mb-1">
                    <NavLink to="/admin/projects" className="nav-link text-white">Projects</NavLink>
                  </li>
                  <li className="nav-item mb-1">
                    <NavLink to="/admin/modules" className="nav-link text-white">Modules</NavLink>
                  </li>
                  <li className="nav-item mb-1">
                    <NavLink to="/admin/tags" className="nav-link text-white">Tags</NavLink>
                  </li>
                </ul>
              )}
            </li></>:<></>}
       


            {/* Tasks with sub-links */}
            <li className="nav-item mb-2">
              <div
                className="nav-link text-white d-flex justify-content-between align-items-center"
                onClick={() => handleSubMenuToggle("tasks")}
                style={{ cursor: 'pointer' }}
              >
                <span>
                  <i className="bi bi-card-checklist me-2"></i> Tasks
                </span>
                <i className={`bi ${openSubMenu === "tasks" ? "bi-chevron-up" : "bi-chevron-down"}`}></i>
              </div>
              {openSubMenu === "tasks" && (
                <ul className="nav flex-column ms-3">
                  <li className="nav-item mb-1">
                    <NavLink to={`${role!="USER"?"/tasks":"/tasks/userTasksDetail/ALL"}`} className="nav-link text-white">Tasks</NavLink>
                  </li>
                  <li className="nav-item mb-1">
                    <NavLink to="/tasks/pendingTasks" className="nav-link text-white">Pending Tasks</NavLink>
                  </li>
                  <li className="nav-item mb-1">
                    <NavLink to="/tasks/completedTasks" className="nav-link text-white">Completed Tasks</NavLink>
                  </li>
                </ul>
              )}
            </li>

              {role!=="USER"?<> <li className="nav-item mb-2">
              <div
                className="nav-link text-white d-flex justify-content-between align-items-center"
                onClick={() => handleSubMenuToggle("users")}
                style={{ cursor: 'pointer' }}
              >
                <span>
                  <i className="bi bi-people me-2"></i> Users
                </span>
                <i className={`bi ${openSubMenu === "users" ? "bi-chevron-up" : "bi-chevron-down"}`}></i>
              </div>
              {openSubMenu === "users" && (
                <ul className="nav flex-column ms-3">
                  <li className="nav-item mb-1">
                    <NavLink to="/admin/users/addNewUser" className="nav-link text-white">Add User</NavLink>
                  </li>
                  <li className="nav-item mb-1">
                    <NavLink to="/users/updateProfile" className="nav-link text-white">Update Profile</NavLink>
                  </li>
                  <li className="nav-item mb-1">
                    <NavLink to="/admin/users/admins" className="nav-link text-white">Admins</NavLink>
                  </li>
                  {/* <li className="nav-item mb-1">
                    <NavLink to="/admin/users/employees" className="nav-link text-white">Employees</NavLink>
                  </li> */}
                </ul>
              )}
            </li></>:<> <li className="nav-item mb-2">
              <div
                className="nav-link text-white d-flex justify-content-between align-items-center"
                onClick={() => handleSubMenuToggle("users")}
                style={{ cursor: 'pointer' }}
              >
                <span>
                  <i className="bi bi-people me-2"></i> User
                </span>
                <i className={`bi ${openSubMenu === "users" ? "bi-chevron-up" : "bi-chevron-down"}`}></i>
              </div>
              {openSubMenu === "users" && (
                <ul className="nav flex-column ms-3">
                 
                  <li className="nav-item mb-1">
                    <NavLink to="/users/updateProfile" className="nav-link text-white">Update Profile</NavLink>
                  </li>
                 
                  {/* <li className="nav-item mb-1">
                    <NavLink to="/admin/users/employees" className="nav-link text-white">Employees</NavLink>
                  </li> */}
                </ul>
              )}
            </li></>}
            {/* Users with sub-links */}
           

            {/* Analytics */}
            {/* <li className="nav-item mb-2">
              <NavLink to="/analytics" className="nav-link text-white">
                <i className="bi bi-graph-up me-2"></i> Analytics
              </NavLink>
            </li> */}

            {/* Settings with sub-links */}
            {/* <li className="nav-item mb-2">
              <div
                className="nav-link text-white d-flex justify-content-between align-items-center"
                onClick={() => handleSubMenuToggle("settings")}
                style={{ cursor: 'pointer' }}
              >
                <span>
                  <i className="bi bi-gear me-2"></i> Settings
                </span>
                <i className={`bi ${openSubMenu === "settings" ? "bi-chevron-up" : "bi-chevron-down"}`}></i>
              </div>
              {openSubMenu === "settings" && (
                <ul className="nav flex-column ms-3">
                  <li className="nav-item mb-1">
                    <NavLink to="/settings/profile" className="nav-link text-white">Profile</NavLink>
                  </li>
                  <li className="nav-item mb-1">
                    <NavLink to="/settings/security" className="nav-link text-white">Security</NavLink>
                  </li>
                </ul>
              )}
            </li> */}

            {/* Reports */}
            {/* <li className="nav-item mb-2">
              <NavLink to="/reports" className="nav-link text-white">
                <i className="bi bi-file-text me-2"></i> Reports
              </NavLink>
            </li> */}
                     {/* Tasks with sub-links */}
            <li className="nav-item mb-2">
              <div
                className="nav-link text-white d-flex justify-content-between align-items-center"
                onClick={() => handleSubMenuToggle("reports")}
                style={{ cursor: 'pointer' }}
              >
                <span>
                  <i className="bi bi-file-earmark-bar-graph me-2"></i> Reports
                </span>
                <i className={`bi ${openSubMenu === "reports" ? "bi-chevron-up" : "bi-chevron-down"}`}></i>
              </div>
              {openSubMenu === "reports" && (
                <ul className="nav flex-column ms-3">
                 
                  <li className="nav-item mb-1">
                    <NavLink to="/reports/userWiseReports" className="nav-link text-white">{role!="USER"?"User's Wise":"My Task Report"}</NavLink>
                  </li>
                  <li className="nav-item mb-1">
                    <NavLink to="/reports/dateWiseReports" className="nav-link text-white">Date Wise</NavLink>
                  </li>
                  <li className="nav-item mb-1">
                    <NavLink to="/reports/weeklySummaryReport" className="nav-link text-white">Weekly Summary Report</NavLink>
                  </li>
                </ul>
              )}
            </li>

{role!=="USER"?
            <li className="nav-item mb-2">
              <div
                className="nav-link text-white d-flex justify-content-between align-items-center"
                onClick={() => handleSubMenuToggle("settings")}
                style={{ cursor: 'pointer' }}
              >
                <span>
                  <i className="bi bi-gear me-2"></i> Settings
                </span>
                <i className={`bi ${openSubMenu === "settings" ? "bi-chevron-up" : "bi-chevron-down"}`}></i>
              </div>
              {openSubMenu === "settings" && (
                <ul className="nav flex-column ms-3">
                 
                  <li className="nav-item mb-1">
                    <NavLink to="/settings/changeLogo" className="nav-link text-white">Change Logo</NavLink>
                  </li>
               
                </ul>
              )}
            </li>:<></>
}
          </ul>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="sidebar-overlay d-lg-none" onClick={toggleSidebar}></div>
      )}
    </>
  );
};

export default Sidebar;
