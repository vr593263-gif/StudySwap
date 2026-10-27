import { useState } from "react";

function Navbar({
  onHome,
  onBrowse,
  onUpload,
  onMyResources,
}) {
  const [activePage, setActivePage] = useState("Home");

  const handleNavigation = (page, callback) => {
    setActivePage(page);
    callback?.();
  };

  const navItems = [
    { name: "Home", action: onHome, icon: "⌂" },
    { name: "Browse", action: onBrowse, icon: "⌕" },
    { name: "Upload", action: onUpload, icon: "+" },
    { name: "My Resources", action: onMyResources, icon: "▤" },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h2
          className="logo"
          onClick={() => handleNavigation("Home", onHome)}
          style={{ cursor: "pointer" }}
        >
          Study<span>Swap</span>
          <span className="logo-dot">.</span>
        </h2>

        <div className="nav-links">
          {navItems.map((item) => (
            <button
              key={item.name}
              type="button"
              className={`nav-link ${
                activePage === item.name ? "active" : ""
              }`}
              onClick={() =>
                handleNavigation(item.name, item.action)
              }
            >
              <span className="nav-icon">{item.icon}</span>
              {item.name}
            </button>
          ))}
        </div>
      </div>

      <div className="navbar-right">
        <button
          className="notification-btn"
          type="button"
          aria-label="Notifications"
          title="Notifications"
        >
          ♧
          <span className="notification-dot"></span>
        </button>

        <div className="user-profile">
          <div className="user-avatar">S</div>

          <div className="user-info">
            <strong>Student</strong>
            <span>CSE Student</span>
          </div>

          <span className="profile-chevron">⌄</span>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;