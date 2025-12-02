import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, InputGroup, Row, Col } from "react-bootstrap";
import { getAuth } from "firebase/auth";
import { getOrders, addOrder, deleteOrder, updateOrder, getCustomers } from "../services/firestoreService";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [adding, setAdding] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currency, setCurrency] = useState("₦");

  // form state
  const [product, setProduct] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState("Pending");
  const [customerId, setCustomerId] = useState("");
  const [date, setDate] = useState("");
  const [editingOrder, setEditingOrder] = useState(null);

  const user = getAuth().currentUser;

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        setCurrency(snap.data()?.currency || "₦");
      }

      const custs = await getCustomers(user.uid);
      setCustomers(custs);

      const ords = await getOrders(user.uid);
      setOrders(ords);
    } catch (err) {
      console.error("Failed to load orders/customers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const resetForm = () => {
    setProduct("");
    setPrice("");
    setStatus("Pending");
    setCustomerId("");
    setDate("");
    setEditingOrder(null);
  };

  const handleAddOrUpdate = async () => {
    if (!product || !price || !customerId) return alert("Fill required fields");

    setAdding(true);
    setShowModal(false);

    try {
      if (editingOrder) {
        await updateOrder(user.uid, editingOrder.id, editingOrder, {
          product,
          price,
          status,
          customerId,
          date: date ? new Date(date) : undefined
        });
      } else {
        await addOrder(user.uid, {
          product,
          price,
          status,
          customerId,
          date: date ? new Date(date) : undefined
        });
      }

      resetForm();
      await loadData();
    } catch (error) {
      console.error(error);
      if (error.message.includes("Free plan limit")) {
        alert(
          "You have reached the orders limit on the Free plan. Go to Settings to upgrade to Premium for unlimited orders."
        );
      } else {
        alert("Failed to save order. Please try again.");
      }
    } finally {
      setAdding(false);
    }
  };

  const handleEdit = (order) => {
    setEditingOrder(order);
    setProduct(order.product);
    setPrice(order.price);
    setStatus(order.status);
    setCustomerId(order.customerId);
    setDate(order.date?.toDate ? order.date.toDate().toISOString().split("T")[0] : "");
    setShowModal(true);
  };

  const handleDelete = async (order) => {
    if (!user) return;
    if (window.confirm("Are you sure you want to delete this order? Totals will be updated.")) {
      try {
        await deleteOrder(user.uid, order);
        await loadData();
      } catch (err) {
        console.error("Failed to delete order:", err);
        alert("Failed to delete order.");
      }
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customers.find((c) => c.id === o.customerId)?.name || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "All" || o.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ color: "#E0E1DD" }}>
      <h2 style={{ color: "#6C63FF", marginBottom: "20px" }}>Orders</h2>

      {/* Search + Filters + Add Button */}
      <Row className="mb-3 g-2 align-items-center">
        <Col xs={12} md={4}>
          <InputGroup style={{ height: "38px" }}>
            <Form.Control
              className="custom-input"
              placeholder="Search product or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ background: "#1B263B", color: "#E0E1DD", height: "38px" }}
            />
          </InputGroup>
        </Col>

        <Col xs={6} md={3}>
          <Form.Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ background: "#1B263B", color: "#E0E1DD", height: "38px" }}
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
            <option value="Completed">Completed</option>
          </Form.Select>
        </Col>

        <Col xs={6} md={2} className="ms-auto">
          <Button
            style={{ background: "#6C63FF", border: "none", fontWeight: "bold", height: "38px" }}
            onClick={() => setShowModal(true)}
            className="w-100"
          >
            + Add Order
          </Button>
        </Col>
      </Row>

      {/* Orders Table */}
      <div style={{ overflowX: "auto" }}>
        {loading ? (
          <p>Loading...</p>
        ) : filteredOrders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <Table striped bordered hover variant="dark" style={{ background: "#1B263B", minWidth: "650px" }}>
            <thead style={{ background: "#1B263B", color: "#6C63FF" }}>
              <tr>
                <th>Customer</th>
                <th>Product</th>
                <th>Price</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o) => (
                <tr key={o.id}>
                  <td>{customers.find((c) => c.id === o.customerId)?.name || "Unknown"}</td>
                  <td>{o.product}</td>
                  <td>{currency}{Number(o.price).toLocaleString()}</td>
                  <td>{o.status}</td>
                  <td>{o.date?.toDate ? o.date.toDate().toLocaleDateString() : "N/A"}</td>
                  <td>
                    <Button
                      variant="warning"
                      size="sm"
                      className="me-2"
                      style={{ height: "28px", padding: "0 8px" }}
                      onClick={() => handleEdit(o)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      style={{ height: "28px", padding: "0 8px" }}
                      onClick={() => handleDelete(o)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>

      {/* Add / Edit Order Modal */}
      <Modal show={showModal} onHide={() => { setShowModal(false); resetForm(); }} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingOrder ? "Edit Order" : "Add Order"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Customer</Form.Label>
              <Form.Select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                style={{ background: "#1B263B", color: "#E0E1DD" }}
              >
                <option value="">Select Customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mt-3">
              <Form.Label>Product</Form.Label>
              <Form.Control
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                style={{ background: "#1B263B", color: "#E0E1DD" }}
              />
            </Form.Group>

            <Form.Group className="mt-3">
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                style={{ background: "#1B263B", color: "#E0E1DD" }}
              />
            </Form.Group>

            <Form.Group className="mt-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{ background: "#1B263B", color: "#E0E1DD" }}
              >
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mt-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{ background: "#1B263B", color: "#E0E1DD" }}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            style={{ background: "#6C63FF", border: "none", fontWeight: "bold" }}
            onClick={handleAddOrUpdate}
            disabled={adding}
          >
            {adding ? (editingOrder ? "Updating..." : "Adding...") : (editingOrder ? "Update" : "Add")}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
