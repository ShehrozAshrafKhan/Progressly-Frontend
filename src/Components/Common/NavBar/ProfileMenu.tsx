import React, { useState, useRef, useEffect } from "react";

type ProfileMenuProps = {
  name: string;
  profileImage?: string;
  onSettings: () => void;
  onLogout: () => void;
};

const ProfileMenu: React.FC<ProfileMenuProps> = ({
  name,
  profileImage,
  onSettings,
  onLogout,
}) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="position-relative" ref={dropdownRef}>
      <div
        className="d-flex align-items-center gap-2 cursor-pointer"
        onClick={() => setOpen(!open)}
        style={{ cursor: "pointer" }}
      >
        <img
          src={
            profileImage ||
            "https://via.placeholder.com/40x40.png?text=U"
          }
          alt="Profile"
          className="rounded-circle"
          style={{ width: "40px", height: "40px", objectFit: "cover" }}
        />
        <span className="fw-bold">{name}</span>
      </div>

      {open && (
        <div
          className="position-absolute bg-white border shadow p-2 mt-2"
          style={{
            right: 0,
            top: "100%",
            minWidth: "150px",
            zIndex: 1000,
            borderRadius: "6px",
          }}
        >
          <button
            className="btn btn-sm btn-outline-primary w-100 mb-2"
            onClick={() => {
              setOpen(false);
              onSettings();
            }}
          >
            Settings
          </button>
          <button
            className="btn btn-sm btn-outline-danger w-100"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
