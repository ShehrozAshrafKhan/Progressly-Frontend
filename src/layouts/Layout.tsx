import React, { useState } from "react";
import Sidebar from "../Components/Common/SideBar/Sidebar";
import { useUser } from "../contexts/UserContext";
import Cookies from "js-cookie";
import ProfileMenu from "../Components/Common/NavBar/ProfileMenu";
import NotificationBell from "../Components/Common/NavBar/NotificationBell";
import logo50 from "../assets/logo50.png";
import { Link } from "react-router-dom";
import axios from "axios";
import config from "../config";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, clearUser } = useUser();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSettings = () => {
    console.log("Settings clicked");
  };

  const handleLogout = async () => {
    try {
      const refreshToken = Cookies.get("refreshToken") || localStorage.getItem("refreshToken");
      if (refreshToken) {
        await axios.post(`${config.baseUrl}Auth/revoke-token`, JSON.stringify(refreshToken), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } catch (e) {
      console.error("Failed to revoke token on logout", e);
    } finally {
      clearUser();
      Cookies.remove("token");
      Cookies.remove("refreshToken");
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      window.location.href = "/";
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      {/* Sticky Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white sticky-top shadow-sm py-2">
        <div className="container-fluid px-4">
          {/* Hamburger menu button - visible on small screens */}
          <button
            className="navbar-toggler border-0 shadow-none d-lg-none p-2"
            type="button"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <div className="d-flex align-items-center">
            <Link to={"/"} className="text-decoration-none d-flex align-items-center">
              <img src={logo50} alt="Logo" width="36" height="36" className="me-2" />
              <span className="navbar-brand fw-bold mb-0 fs-5 text-dark">Progressly</span>
            </Link>
          </div>

          {/* Right-side content */}
          <div className="navbar-nav ms-auto align-items-center d-flex flex-row">
            <NotificationBell />
            {user && (
              <ProfileMenu
                name={user.name}
                profileImage={user.profileImage}
                onSettings={handleSettings}
                onLogout={handleLogout}
              />
            )}
          </div>
        </div>
      </nav>

      <div className="d-flex flex-grow-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

        {/* Main Content */}
        <main className="flex-grow-1 main-content bg-light-soft position-relative">
          <div className="container-fluid py-4 px-3 px-md-4 h-100 overflow-auto">
            {children}
          </div>
        </main>
      </div>

      <style>{`
        .main-content {
          height: calc(100vh - 60px); /* 60px is approx navbar height */
          min-width: 0;
          overflow-x: hidden;
        }

        /* Large screens */
        @media (min-width: 992px) {
          .main-content {
            margin-left: 0;
          }
        }

        /* Custom scrollbar */
        .main-content::-webkit-scrollbar {
          width: 6px;
        }

        .main-content::-webkit-scrollbar-track {
          background: transparent;
        }

        .main-content::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.5);
          border-radius: 10px;
        }

        .main-content::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 114, 128, 0.8);
        }
      `}</style>
    </div>
  );
};

export default Layout;
