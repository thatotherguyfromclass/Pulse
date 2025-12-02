import { Navbar, Container, Button } from "react-bootstrap";
import { logout } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { List } from "react-bootstrap-icons"; // Hamburger icon

const Header = ({ onToggleSidebar }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { success, error } = await logout();
    if (success) navigate("/login");
    else alert(error);
  };

  return (
    <Navbar
      expand={false}
      style={{ background: "#0D1B2A", borderBottom: "1px solid #6C63FF" }}
      className="px-3"
    >
      <Container fluid>
        {/* Mobile hamburger */}
        <Button
          variant="outline-light"
          onClick={onToggleSidebar}
          className="d-md-none"
          style={{ border: "none", color: "#6C63FF" }}
        >
          <List size={24} />
        </Button>

        {/* Brand / Logo */}
        <Navbar.Brand
          className="text-white ms-2"
          style={{ color: "#6C63FF", fontWeight: "bold" }}
        >
          <h2 className="navbar-brand fw-bold mt-2">PULSE</h2>
        </Navbar.Brand>

        {/* Logout button */}
        <Button
          variant="outline-light"
          onClick={handleLogout}
          className="ms-auto"
          style={{
            border: "1px solid #6C63FF",
            color: "#6C63FF",
            fontWeight: "bold",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#6C63FF";
            e.target.style.color = "#0D1B2A";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "transparent";
            e.target.style.color = "#6C63FF";
          }}
        >
          Logout
        </Button>
      </Container>
    </Navbar>
  );
};

export default Header;
