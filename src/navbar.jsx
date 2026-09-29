function Navbar({
  onHome,
  onBrowse,
  onUpload,
  onMyResources,
}) {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h2
          className="logo"
          onClick={onHome}
          style={{ cursor: "pointer" }}
        >
          Study<span>Swap</span>
        </h2>

        <div className="nav-links">
          <button
            type="button"
            className="nav-link active"
            onClick={onHome}
          >
            Home
          </button>

          <button
            type="button"
            className="nav-link"
            onClick={onBrowse}
          >
            Browse
          </button>

          <button
            type="button"
            className="nav-link"
            onClick={onUpload}
          >
            Upload
          </button>

          <button
            type="button"
            className="nav-link"
            onClick={onMyResources}
          >
            My Resources
          </button>
        </div>
      </div>

      <div className="navbar-right">
        <button
          className="notification-btn"
          type="button"
        >
          🔔
        </button>

        <div className="user-profile">
          <div className="user-avatar">
            V
          </div>

          <div className="user-info">
            <strong>Student</strong>
            <span>CSE Student</span>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;