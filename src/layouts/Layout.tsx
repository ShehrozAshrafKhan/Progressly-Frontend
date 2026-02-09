import React, { useState } from "react";
import Sidebar from "../Components/Common/SideBar/Sidebar";
import { useUser } from "../contexts/UserContext";
import Cookies from "js-cookie";
import ProfileMenu from "../Components/Common/NavBar/ProfileMenu";
import logo50 from "../assets/logo50.png";
import { Link } from "react-router-dom";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, clearUser } = useUser();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSettings = () => {
    console.log("Settings clicked");
  };

  const handleLogout = () => {
    clearUser();
    Cookies.remove("token");
    window.location.href = "/";
  };

  return (
    <div className="min-vh-100 d-flex flex-column">
      {/* Sticky Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top shadow-sm">
        <div className="container-fluid">
          {/* Hamburger menu button - visible on small screens */}
          <button
            className="navbar-toggler d-lg-none"
            type="button"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <Link to={"/"}>
            <img src={logo50} alt="" />
          </Link>
          {/* Brand */}
          <Link className="navbar-brand mx-2" to="/">
            Progressly
          </Link>

          {/* Right-side content */}
          <div className="navbar-nav ms-auto">
            <div className="nav-item dropdown">
              {/* <a
                className="nav-link dropdown-toggle"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Profile
              </a> */}
              {user && (
                <ProfileMenu
                  name={user.name}
                  profileImage={user.profileImage}
                  onSettings={handleSettings}
                  onLogout={handleLogout}
                />
              )}
              {/* <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <a className="dropdown-item" href="#">
                    Settings
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="#">
                    Account
                  </a>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <a className="dropdown-item" href="#">
                    Logout
                  </a>
                </li>
              </ul> */}
            </div>
          </div>
        </div>
      </nav>

      <div className="d-flex">
        {/* Sidebar */}
        <div className="row col-md-12">

       
        <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

        <main className="flex-grow-1 main-content col-md-10">
          <div className="container-fluid p-4">
            <div className="row">
              <div className="col-12">
                {children}

                {/* <div className="mt-4">
                  <h3>Additional Content</h3>
                  {Array.from({ length: 5 }, (_, i) => (
                    <div key={i} className="card mb-3">
                      <div className="card-body">
                        <h5 className="card-title">Section {i + 1}</h5>
                        <p className="card-text">
                          This is additional content to demonstrate the
                          scrollable nature of the main content area. Lorem
                          ipsum dolor sit amet, consectetur adipiscing elit. Sed
                          do eiusmod tempor incididunt ut labore et dolore magna
                          aliqua. Ut enim ad minim veniam, quis nostrud
                          exercitation ullamco laboris nisi ut aliquip ex ea
                          commodo consequat.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              */}
              </div>
            </div>
          </div>
        </main>
         </div>
      </div>

      <style>{`
        

        .main-content {
          margin-left: 0;
          height: calc(100vh - 56px);
          overflow-y: auto;
          transition: margin-left 0.3s ease;
        }

        /* Large screens */
        @media (min-width: 992px) {
          .sidebar {
            position: static;
            left: 0;
            height: calc(100vh - 56px);
          }
          
          .main-content {
            margin-left: 0;
          }
          
          .sidebar-overlay {
            display: none;
          }
        }

        /* Custom scrollbar for webkit browsers */
        .main-content::-webkit-scrollbar {
          width: 8px;
        }

        .main-content::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        .main-content::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 4px;
        }

        .main-content::-webkit-scrollbar-thumb:hover {
          background: #a1a1a1;
        }

        .sidebar::-webkit-scrollbar {
          width: 6px;
        }

        .sidebar::-webkit-scrollbar-track {
          background: #2d3748;
        }

        .sidebar::-webkit-scrollbar-thumb {
          background: #4a5568;
          border-radius: 3px;
        }

        /* Navbar height adjustment */
        .navbar {
          height: 56px;
        }

        /* Smooth hover effects */
        .nav-link:hover {
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 0.25rem;
        }

        .card {
          transition: box-shadow 0.15s ease-in-out;
        }

        .card:hover {
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
        }
      `}</style>
    </div>
  );
};

export default Layout;
