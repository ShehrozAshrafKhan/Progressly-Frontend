import ProfileMenu from "./ProfileMenu"; // adjust path accordingly

const Navbar = () => {
  const handleSettings = () => {
    console.log("Settings clicked");
  };

  const handleLogout = () => {
    console.log("Logout clicked");
  };

  return (
    <nav className="navbar bg-light px-4 d-flex justify-content-between align-items-center">
      <h4 className="m-0">My App</h4>
      <ProfileMenu
        name="Mr. Sherry"
        profileImage="/assets/profile.jpg" // optional
        onSettings={handleSettings}
        onLogout={handleLogout}
      />
    </nav>
  );
};

export default Navbar;
