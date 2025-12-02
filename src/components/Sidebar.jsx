import { Nav } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { House, People, Basket, BarChart, Gear } from "react-bootstrap-icons";

const Sidebar = ({ onLinkClick }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    { name: "Dashboard", path: "/dashboard", icon: <House /> },
    { name: "Customers", path: "/dashboard/customers", icon: <People /> },
    { name: "Orders", path: "/dashboard/orders", icon: <Basket /> },
    { name: "Settings", path: "/dashboard/settings", icon: <Gear /> },
  ];

  const handleClick = (path) => {
    navigate(path);
    if (onLinkClick) onLinkClick();
  };

  return (
    <Nav
      className="flex-column"
      style={{ minHeight: "100vh", background: "#1B263B", paddingTop: "20px" }}
    >
      {links.map((link) => {
        const isActive = location.pathname === link.path;
        return (
          <Nav.Link
            key={link.name}
            onClick={() => handleClick(link.path)}
            style={{
              color: isActive ? "#6C63FF" : "#E0E1DD",
              fontWeight: isActive ? "bold" : "500",
              display: "flex",
              alignItems: "center",
              padding: "10px 20px",
              marginBottom: "8px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.color = "#5DE2E7")}
            onMouseLeave={(e) => (e.target.style.color = isActive ? "#6C63FF" : "#E0E1DD")}
          >
            <span style={{ marginRight: "10px" }}>{link.icon}</span>
            {link.name}
          </Nav.Link>
        );
      })}
    </Nav>
  );
};

export default Sidebar;
