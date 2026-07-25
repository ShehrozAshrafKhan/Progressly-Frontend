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
  const role = user?.roles?.[0];
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

  const handleSubMenuToggle = (menuKey: string) => {
    setOpenSubMenu(prev => (prev === menuKey ? null : menuKey));
  };

  return (
    <>
      <div className={`bg-white border-end sidebar ${sidebarOpen ? "sidebar-open" : ""}`} style={{ zIndex: 1040 }}>
        <div className="sidebar-content py-3 px-2">
          <p className="text-uppercase text-muted fw-bold mb-3 ms-3" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Menu</p>
          <ul className="nav flex-column gap-1">

            {/* Dashboard */}
            <li className="nav-item">
              <NavLink to="/dashboard" className={({ isActive }) => `nav-link rounded-lg px-3 py-2 text-dark transition-base d-flex align-items-center ${isActive ? 'bg-light-soft text-primary fw-medium' : 'hover-bg-light'}`}>
                <i className="bi bi-house me-3 fs-5"></i>
                <span>Dashboard</span>
              </NavLink>
            </li>

            {/* Notifications */}
            <li className="nav-item">
              <NavLink to="/notifications" className={({ isActive }) => `nav-link rounded-lg px-3 py-2 text-dark transition-base d-flex align-items-center ${isActive ? 'bg-light-soft text-primary fw-medium' : 'hover-bg-light'}`}>
                <i className="bi bi-bell me-3 fs-5"></i>
                <span>Notifications</span>
              </NavLink>
            </li>

            {/* Configurations with sub-links */}
            {role!=="USER"?<>
            <li className="nav-item">
              <div
                className={`nav-link rounded-lg px-3 py-2 text-dark transition-base d-flex justify-content-between align-items-center hover-bg-light ${openSubMenu === 'configurations' ? 'bg-light-soft' : ''}`}
                onClick={() => handleSubMenuToggle("configurations")}
                style={{ cursor: 'pointer' }}
              >
                <div className="d-flex align-items-center">
                  <i className="bi bi-ui-checks-grid me-3 fs-5"></i>
                  <span>Configurations</span>
                </div>
                <i className={`bi transition-base ${openSubMenu === "configurations" ? "bi-chevron-up text-primary" : "bi-chevron-down text-muted"}`}></i>
              </div>
              {openSubMenu === "configurations" && (
                <ul className="nav flex-column ms-4 mt-1 border-start ms-4 ps-2">
                  <li className="nav-item mb-1">
                    <NavLink to="/admin/projects" className={({ isActive }) => `nav-link rounded px-3 py-1 text-muted transition-base ${isActive ? 'text-primary fw-medium' : 'hover-text-dark'}`}>Projects</NavLink>
                  </li>
                  <li className="nav-item mb-1">
                    <NavLink to="/admin/modules" className={({ isActive }) => `nav-link rounded px-3 py-1 text-muted transition-base ${isActive ? 'text-primary fw-medium' : 'hover-text-dark'}`}>Modules</NavLink>
                  </li>
                  <li className="nav-item mb-1">
                    <NavLink to="/admin/tags" className={({ isActive }) => `nav-link rounded px-3 py-1 text-muted transition-base ${isActive ? 'text-primary fw-medium' : 'hover-text-dark'}`}>Tags</NavLink>
                  </li>
                </ul>
              )}
            </li></>:<></>}

            {/* Tasks with sub-links */}
            <li className="nav-item">
              <div
                className={`nav-link rounded-lg px-3 py-2 text-dark transition-base d-flex justify-content-between align-items-center hover-bg-light ${openSubMenu === 'tasks' ? 'bg-light-soft' : ''}`}
                onClick={() => handleSubMenuToggle("tasks")}
                style={{ cursor: 'pointer' }}
              >
                <div className="d-flex align-items-center">
                  <i className="bi bi-card-checklist me-3 fs-5"></i>
                  <span>Tasks</span>
                </div>
                <i className={`bi transition-base ${openSubMenu === "tasks" ? "bi-chevron-up text-primary" : "bi-chevron-down text-muted"}`}></i>
              </div>
              {openSubMenu === "tasks" && (
                <ul className="nav flex-column ms-4 mt-1 border-start ms-4 ps-2">
                  <li className="nav-item mb-1">
                    <NavLink to={`${role!="USER"?"/tasks":"/tasks/userTasksDetail/ALL"}`} className={({ isActive }) => `nav-link rounded px-3 py-1 text-muted transition-base ${isActive ? 'text-primary fw-medium' : 'hover-text-dark'}`}>Tasks</NavLink>
                  </li>
                  <li className="nav-item mb-1">
                    <NavLink to="/tasks/pendingTasks" className={({ isActive }) => `nav-link rounded px-3 py-1 text-muted transition-base ${isActive ? 'text-primary fw-medium' : 'hover-text-dark'}`}>Pending Tasks</NavLink>
                  </li>
                  <li className="nav-item mb-1">
                    <NavLink to="/tasks/completedTasks" className={({ isActive }) => `nav-link rounded px-3 py-1 text-muted transition-base ${isActive ? 'text-primary fw-medium' : 'hover-text-dark'}`}>Completed Tasks</NavLink>
                  </li>
                 { role!="USER" ?(<li className="nav-item mb-1">
                    <NavLink to="/admin/tasks/deleted" className={({ isActive }) => `nav-link rounded px-3 py-1 text-muted transition-base ${isActive ? 'text-primary fw-medium' : 'hover-text-dark'}`}>Deleted Tasks</NavLink>
                  </li>):""
                  }
                    
                </ul>
              )}
            </li>

            {/* Users with sub-links */}
            {role!=="USER"?<>
            <li className="nav-item">
              <div
                className={`nav-link rounded-lg px-3 py-2 text-dark transition-base d-flex justify-content-between align-items-center hover-bg-light ${openSubMenu === 'users' ? 'bg-light-soft' : ''}`}
                onClick={() => handleSubMenuToggle("users")}
                style={{ cursor: 'pointer' }}
              >
                <div className="d-flex align-items-center">
                  <i className="bi bi-people me-3 fs-5"></i>
                  <span>Users</span>
                </div>
                <i className={`bi transition-base ${openSubMenu === "users" ? "bi-chevron-up text-primary" : "bi-chevron-down text-muted"}`}></i>
              </div>
              {openSubMenu === "users" && (
                <ul className="nav flex-column ms-4 mt-1 border-start ms-4 ps-2">
                  <li className="nav-item mb-1">
                    <NavLink to="/admin/users/addNewUser" className={({ isActive }) => `nav-link rounded px-3 py-1 text-muted transition-base ${isActive ? 'text-primary fw-medium' : 'hover-text-dark'}`}>Add User</NavLink>
                  </li>
                  <li className="nav-item mb-1">
                    <NavLink to="/users/updateProfile" className={({ isActive }) => `nav-link rounded px-3 py-1 text-muted transition-base ${isActive ? 'text-primary fw-medium' : 'hover-text-dark'}`}>Update Profile</NavLink>
                  </li>
                  <li className="nav-item mb-1">
                    <NavLink to="/admin/users/admins" className={({ isActive }) => `nav-link rounded px-3 py-1 text-muted transition-base ${isActive ? 'text-primary fw-medium' : 'hover-text-dark'}`}>Admins</NavLink>
                  </li>
                </ul>
              )}
            </li></>:<>
            <li className="nav-item">
              <div
                className={`nav-link rounded-lg px-3 py-2 text-dark transition-base d-flex justify-content-between align-items-center hover-bg-light ${openSubMenu === 'users' ? 'bg-light-soft' : ''}`}
                onClick={() => handleSubMenuToggle("users")}
                style={{ cursor: 'pointer' }}
              >
                <div className="d-flex align-items-center">
                  <i className="bi bi-person me-3 fs-5"></i>
                  <span>User</span>
                </div>
                <i className={`bi transition-base ${openSubMenu === "users" ? "bi-chevron-up text-primary" : "bi-chevron-down text-muted"}`}></i>
              </div>
              {openSubMenu === "users" && (
                <ul className="nav flex-column ms-4 mt-1 border-start ms-4 ps-2">
                  <li className="nav-item mb-1">
                    <NavLink to="/users/updateProfile" className={({ isActive }) => `nav-link rounded px-3 py-1 text-muted transition-base ${isActive ? 'text-primary fw-medium' : 'hover-text-dark'}`}>Update Profile</NavLink>
                  </li>
                </ul>
              )}
            </li></>}

            {/* Reports */}
            <li className="nav-item">
              <div
                className={`nav-link rounded-lg px-3 py-2 text-dark transition-base d-flex justify-content-between align-items-center hover-bg-light ${openSubMenu === 'reports' ? 'bg-light-soft' : ''}`}
                onClick={() => handleSubMenuToggle("reports")}
                style={{ cursor: 'pointer' }}
              >
                <div className="d-flex align-items-center">
                  <i className="bi bi-file-earmark-bar-graph me-3 fs-5"></i>
                  <span>Reports</span>
                </div>
                <i className={`bi transition-base ${openSubMenu === "reports" ? "bi-chevron-up text-primary" : "bi-chevron-down text-muted"}`}></i>
              </div>
              {openSubMenu === "reports" && (
                <ul className="nav flex-column ms-4 mt-1 border-start ms-4 ps-2">
                  <li className="nav-item mb-1">
                    <NavLink to="/reports/userWiseReports" className={({ isActive }) => `nav-link rounded px-3 py-1 text-muted transition-base ${isActive ? 'text-primary fw-medium' : 'hover-text-dark'}`}>{role!="USER"?"User's Wise":"My Task Report"}</NavLink>
                  </li>
                  <li className="nav-item mb-1">
                    <NavLink to="/reports/dateWiseReports" className={({ isActive }) => `nav-link rounded px-3 py-1 text-muted transition-base ${isActive ? 'text-primary fw-medium' : 'hover-text-dark'}`}>Date Wise</NavLink>
                  </li>
                  <li className="nav-item mb-1">
                    <NavLink to="/reports/weeklySummaryReport" className={({ isActive }) => `nav-link rounded px-3 py-1 text-muted transition-base ${isActive ? 'text-primary fw-medium' : 'hover-text-dark'}`}>Weekly Summary Report</NavLink>
                  </li>
                </ul>
              )}
            </li>

            {/* Settings */}
            {role!=="USER"?
            <li className="nav-item">
              <div
                className={`nav-link rounded-lg px-3 py-2 text-dark transition-base d-flex justify-content-between align-items-center hover-bg-light ${openSubMenu === 'settings' ? 'bg-light-soft' : ''}`}
                onClick={() => handleSubMenuToggle("settings")}
                style={{ cursor: 'pointer' }}
              >
                <div className="d-flex align-items-center">
                  <i className="bi bi-gear me-3 fs-5"></i>
                  <span>Settings</span>
                </div>
                <i className={`bi transition-base ${openSubMenu === "settings" ? "bi-chevron-up text-primary" : "bi-chevron-down text-muted"}`}></i>
              </div>
              {openSubMenu === "settings" && (
                <ul className="nav flex-column ms-4 mt-1 border-start ms-4 ps-2">
                  <li className="nav-item mb-1">
                    <NavLink to="/settings/changeLogo" className={({ isActive }) => `nav-link rounded px-3 py-1 text-muted transition-base ${isActive ? 'text-primary fw-medium' : 'hover-text-dark'}`}>Change Logo</NavLink>
                  </li>
                </ul>
              )}
            </li>:<></>}
          </ul>
        </div>
      </div>

      <style>{`
        .hover-bg-light:hover {
          background-color: var(--bs-light);
        }
        .hover-text-dark:hover {
          color: var(--bs-dark) !important;
        }
        .sidebar {
          transition: transform 0.3s ease-in-out;
        }
        /* Override default sidebar width and positioning for desktop */
        @media (min-width: 992px) {
          .sidebar {
            width: 260px !important;
            flex: 0 0 260px;
            max-width: 260px;
          }
        }
        /* Mobile sidebar */
        @media (max-width: 991.98px) {
          .sidebar {
            position: fixed;
            top: 60px; /* Below navbar */
            bottom: 0;
            left: 0;
            width: 260px;
            transform: translateX(-100%);
            box-shadow: 2px 0 8px rgba(0,0,0,0.1);
          }
          .sidebar.sidebar-open {
            transform: translateX(0);
          }
          .sidebar-overlay {
            position: fixed;
            top: 60px;
            right: 0;
            bottom: 0;
            left: 0;
            background-color: rgba(0,0,0,0.5);
            z-index: 1030;
          }
        }
      `}</style>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="sidebar-overlay d-lg-none" onClick={toggleSidebar}></div>
      )}
    </>
  );
};

export default Sidebar;
