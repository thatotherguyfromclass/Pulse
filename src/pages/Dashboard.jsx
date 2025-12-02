import { useState } from "react";
import { Container, Row, Col, Offcanvas } from "react-bootstrap";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import MainContent from "../components/MainContent";

// Import your pages
import DashboardHome from "./DashboardHome";
import Customers from "./Customers";
import Orders from "./Orders";
import Settings from "./Settings";

const Dashboard = () => {
  const [showSidebar, setShowSidebar] = useState(false);

  const handleSidebarToggle = () => setShowSidebar(!showSidebar);
  const handleSidebarClose = () => setShowSidebar(false);

  return (
    <div style={{ background: "#0D1B2A", minHeight: "100vh", color: "#E0E1DD" }}>
      <Header onToggleSidebar={handleSidebarToggle} />

      <Container fluid className="p-0">
        <Row className="g-0">
          {/* Desktop Sidebar */}
          <Col
            xs={0}
            md={3}
            lg={2}
            className="d-none d-md-block"
            style={{
              background: "#1B263B",
              minHeight: "100vh",
              borderRight: "2px solid #6C63FF",
            }}
          >
            <Sidebar />
          </Col>

          {/* Main Content */}
          <Col xs={12} md={9} lg={10} style={{ padding: "20px" }}>
            <MainContent>
              <Routes>
                <Route index element={<DashboardHome />} />
                <Route path="customers" element={<Customers />} />
                <Route path="orders" element={<Orders />} />
                <Route path="settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>
            </MainContent>
          </Col>
        </Row>
      </Container>

      {/* Mobile Offcanvas Sidebar */}
      <Offcanvas
        show={showSidebar}
        onHide={handleSidebarClose}
        placement="start"
        style={{ background: "#1B263B", color: "#E0E1DD" }}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Sidebar onLinkClick={handleSidebarClose} />
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
};

export default Dashboard;
