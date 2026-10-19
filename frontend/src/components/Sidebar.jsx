import { useState } from "react";

function Sidebar({ activePage, onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: "dashboard", icon: "⌂", label: "Dashboard" },
    { id: "air-quality", icon: "◉", label: "Air Quality" },
    { id: "trends", icon: "▥", label: "Trends & Analytics" },
    { id: "alerts", icon: "⚠", label: "Alerts" },
    { id: "about", icon: "ⓘ", label: "About AirWatch" },
  ];

  const handleNavigate = (page) => {
    onNavigate(page);
    setIsOpen(false);
  };

  return (
    <>
      <button
        className="menu-button"
        type="button"
        aria-label="Open navigation menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((previous) => !previous)}
      >
        ☰
      </button>

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>🌫️ AIRWATCH</h2>

          <button
            className="close-button"
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setIsOpen(false)}
          >
            ×
          </button>
        </div>

        <p className="sidebar-caption">AIR QUALITY MONITORING</p>

        <nav className="sidebar-menu" aria-label="Main navigation">
          {menuItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`sidebar-link ${
                activePage === item.id ? "active" : ""
              }`}
              aria-current={activePage === item.id ? "page" : undefined}
              onClick={() => handleNavigate(item.id)}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span className="status-dot" />
          <span>AirWatch Monitoring</span>
        </div>
      </aside>

      {isOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Close navigation menu"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

export default Sidebar;