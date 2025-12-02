// src/pages/DashboardHome.jsx
import { useEffect, useState } from "react";
import { Row, Col, Card, Table } from "react-bootstrap";
import { getAuth } from "firebase/auth";
import { getCustomers, getOrders, getUserData } from "../services/firestoreService";

export default function DashboardHome() {
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState("₦");


  const user = getAuth().currentUser;

  const loadData = async () => {
    setLoading(true);
    if (user) {
      const userData = await getUserData(user.uid);
      setCurrency(userData?.currency || "₦");

      const custs = await getCustomers(user.uid);
      setCustomers(custs);

      const ords = await getOrders(user.uid);
      // Sort by date descending
      ords.sort(
        (a, b) =>
          (b.date?.toDate ? b.date.toDate() : 0) -
          (a.date?.toDate ? a.date.toDate() : 0)
      );
      setOrders(ords);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const totalSales = orders.reduce(
    (sum, o) => (o.status === "Paid" ? sum + Number(o.price) : sum),
    0
  );

  return (
    <div style={{ color: "#E0E1DD" }}>
      <h2 className="show-text" style={{ color: "#6C63FF", marginBottom: "10px" }}>
        Dashboard
      </h2>
      <p className="show-text" style={{ marginBottom: "30px", color: "#A9B2C3" }}>
        Here’s an overview of your customers, orders, and sales. Keep track of your business at a glance.
      </p>

      {loading ? (
        <p className="show-text">Loading...</p>
      ) : (
        <>
          {/* Stats Cards */}
          <Row className="mb-4 g-3">
            <Col xs={12} md={4}>
              <Card style={{ background: "#1B263B", border: "1px solid #415A77" }}>
                <Card.Body>
                  <Card.Title className="show-text">Total Customers</Card.Title>
                  <h3 className="show-text">{customers.length}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} md={4}>
              <Card style={{ background: "#1B263B", border: "1px solid #415A77" }}>
                <Card.Body>
                  <Card.Title className="show-text">Total Orders</Card.Title>
                  <h3 className="show-text">{orders.length}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} md={4}>
              <Card style={{ background: "#1B263B", border: "1px solid #415A77" }}>
                <Card.Body>
                  <Card.Title className="show-text">Total Sales</Card.Title>
                  <h3 className="show-text">{currency}{totalSales.toLocaleString()}</h3>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Recent Orders */}
          <Row>
            <Col xs={12}>
              <Card style={{ background: "#1B263B", border: "1px solid #415A77" }}>
                <Card.Body>
                  <Card.Title className="show-text">Recent Orders</Card.Title>
                  {orders.length === 0 ? (
                    <p className="show-text">No recent orders</p>
                  ) : (
                    <div style={{ overflowX: "auto" }}>
                      <Table
                        striped
                        bordered
                        hover
                        variant="dark"
                        style={{ minWidth: "650px" }}
                      >
                        <thead style={{ color: "#6C63FF" }}>
                          <tr>
                            <th>Customer</th>
                            <th>Product</th>
                            <th>Price</th>
                            <th>Status</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.slice(0, 5).map((o) => (
                            <tr key={o.id}>
                              <td>{customers.find((c) => c.id === o.customerId)?.name || "Unknown"}</td>
                              <td>{o.product}</td>
                              <td>{currency}{Number(o.price).toLocaleString()}</td>
                              <td>{o.status}</td>
                              <td>{o.date?.toDate ? o.date.toDate().toLocaleDateString() : "N/A"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
}
