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
        className="d-flex align-items-center gap-2 cursor-pointer border rounded-pill p-1 ps-2 hover-bg-light transition-base bg-white shadow-sm"
        onClick={() => setOpen(!open)}
        style={{ cursor: "pointer" }}
      >
        <span className="fw-medium text-dark mx-2 fs-6">{name}</span>
        <img
          src={
            profileImage ||
            "https://via.placeholder.com/40x40.png?text=U"
          }
          alt="Profile"
          className="rounded-circle border"
          style={{ width: "36px", height: "36px", objectFit: "cover" }}
        />
      </div>

      {open && (
        <div
          className="position-absolute bg-white border shadow-lg mt-2 py-2"
          style={{
            right: 0,
            top: "100%",
            minWidth: "180px",
            zIndex: 1000,
            borderRadius: "0.75rem",
          }}
        >
          <div className="px-3 py-2 border-bottom mb-2">
            <p className="mb-0 fw-medium text-dark">{name}</p>
            <p className="mb-0 small text-muted">Administrator</p>
          </div>
          <button
            className="btn btn-link text-decoration-none text-dark w-100 text-start px-3 py-2 hover-bg-light rounded-0 d-flex align-items-center gap-2"
            onClick={() => {
              setOpen(false);
              onSettings();
            }}
          >
            <i className="bi bi-gear text-secondary"></i> Settings
          </button>
          <button
            className="btn btn-link text-decoration-none text-danger w-100 text-start px-3 py-2 hover-bg-light rounded-0 d-flex align-items-center gap-2"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
          >
            <i className="bi bi-box-arrow-right"></i> Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
