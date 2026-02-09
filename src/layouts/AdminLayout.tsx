// // import React from 'react';
// // import Sidebar from '../Components/Common/SideBar/Sidebar';
// // import ProfileMenu from '../Components/Common/NavBar/ProfileMenu';


// // const AdminLayout = ({ children }: { children: React.ReactNode }) => {
// //    const handleSettings = () => {
// //     console.log("Settings clicked");
// //   };

// //   const handleLogout = () => {
// //     console.log("Logout clicked");
// //   };
// //   return (
// //     <div className="d-flex">
// //       <Sidebar />
// //       <div className="main-content p-4 bg-light w-100" style={{ marginLeft: '250px', minHeight: '100vh' }}>
// //         <div className="d-flex justify-content-center">

// //         <h4 className="m-0">Dashboard</h4>
// //            <ProfileMenu
// //              name="Mr. Sherry"
// //              profileImage="/assets/profile.jpg"
// //              onSettings={handleSettings}
// //              onLogout={handleLogout}
// //            />
// //         </div>

// //         {children}
// //       </div>
// //     </div>
// //   );
// // };

// // export default AdminLayout;


// // import React from 'react';
// // import Sidebar from '../Components/Common/SideBar/Sidebar';
// // import ProfileMenu from '../Components/Common/NavBar/ProfileMenu';


// // const AdminLayout = ({ children }: { children: React.ReactNode }) => {
// //     const handleSettings = () => {
// //     console.log("Settings clicked");
// //   };

// //   const handleLogout = () => {
// //     console.log("Logout clicked");
// //   };
// //   return (
// // <div className="d-flex min-vh-100">
// //   {/* Sidebar */}
// //   <Sidebar />

// //   {/* Main content */}
// //   <div className="flex-grow-1">
// //     {/* Navbar */}
// //     <div className="d-flex justify-content-between align-items-center p-3 bg-light border-bottom ">
// //       <h4 className="m-0">Dashboard</h4>
// //       <ProfileMenu
// //         name="Mr. Sherry"
// //         profileImage="/assets/profile.jpg"
// //         onSettings={handleSettings}
// //         onLogout={handleLogout}
// //       />
// //     </div>

// //     {/* Page content */}
// //     <div className="p-4">{children}</div>
// //   </div>
// // </div>
// // )
// // };

// // export default AdminLayout;




// import React from "react";
// import { useUser } from "../contexts/UserContext";
// import ProfileMenu from "../Components/Common/NavBar/ProfileMenu";
// import Sidebar from "../Components/Common/SideBar/Sidebar";
// import Cookies from 'js-cookie';

// const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const { user, clearUser } = useUser();
  
//   const handleSettings = () => {
//     console.log("Settings clicked");
//   };
  
//   const handleLogout = () => {
//     clearUser(); // clears context + localStorage
//     Cookies.remove("token");
//     window.location.href = "/"; // or navigate to login
//   };
  
//   return (
//     <div className="d-flex vh-100 overflow-hidden">
//       <Sidebar />
//       <div className="flex-grow-1 d-flex flex-column">
//         {/* Fixed Height Navbar */}
//         <div 
//           className="d-flex justify-content-between align-items-center p-3 bg-light border-bottom flex-shrink-0"
//           style={{ minHeight: "70px" }}
//         >
//           <h4 className="m-0">Dashboard</h4>
//           {user && (
//             <ProfileMenu
//               name={user.name}
//               profileImage={user.profileImage}
//               onSettings={handleSettings}
//               onLogout={handleLogout}
//             />
//           )}
//         </div>
        
//         {/* Scrollable Content Area */}
//         <div className="flex-grow-0 overflow-auto">
//           <div className="p-4 h-100">
//             {children}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminLayout;