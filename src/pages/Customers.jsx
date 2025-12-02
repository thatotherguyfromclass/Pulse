import { useEffect, useState } from "react";
import { Table, Button, Form, Modal, InputGroup, Row, Col } from "react-bootstrap";
import { getAuth } from "firebase/auth";
import { getCustomers, addCustomer, deleteCustomer } from "../services/firestoreService";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";

export default function Customers() {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // form state
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [notes, setNotes] = useState("");
  const [adding, setAdding] = useState(false);

  const [currency, setCurrency] = useState("₦");

  const user = getAuth().currentUser;

  const loadCustomers = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const list = await getCustomers(user.uid);
      setCustomers(list);
    } catch (err) {
      console.error("Failed to load customers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
          setCurrency(snap.data()?.currency || "₦");
        }

        await loadCustomers();
      } catch (err) {
        console.error("Error loading data:", err);
      }
    };

    loadData();
  }, [user]);

  const handleAdd = async () => {
    if (!user) return alert("User not logged in");
    if (!name || !whatsapp) return alert("Name and WhatsApp are required");

    setAdding(true);
    try {
      await addCustomer(user.uid, { name, whatsapp, notes });

      setShowModal(false);
      setName("");
      setWhatsapp("");
      setNotes("");

      await loadCustomers();
    } catch (error) {
      console.error(error);
      if (error.message.includes("Free plan limit")) {
        alert(
          "You have reached the customers limit on the Free plan. Go to Settings to upgrade to Premium for unlimited customers."
        );
      } else {
        alert("Failed to add customer");
      }
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    if (!user) return;
    if (window.confirm("Are you sure you want to delete this customer? All their orders will also be deleted.")) {
      try {
        await deleteCustomer(user.uid, id);
        await loadCustomers();
      } catch (err) {
        console.error("Failed to delete customer:", err);
        alert("Failed to delete customer.");
      }
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.whatsapp.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ color: "#E0E1DD" }}>
      <h2 style={{ color: "#6C63FF", marginBottom: "20px" }}>Customers</h2>

      {/* Search + Add */}
      <Row className="mb-3 g-2 align-items-center">
        <Col xs={12} md={4}>
          <InputGroup style={{ height: "38px" }}>
            <Form.Control
              className="custom-input"
              placeholder="Search name or WhatsApp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ background: "#1B263B", color: "#E0E1DD", height: "38px" }}
            />
          </InputGroup>
        </Col>

        <Col xs={6} md={2} className="ms-auto">
          <Button
            style={{ background: "#6C63FF", border: "none", fontWeight: "bold", height: "38px", whiteSpace: "nowrap" }}
            onClick={() => setShowModal(true)}
            className="w-100"
          >
            + Add Customer
          </Button>
        </Col>
      </Row>

      {/* Customers Table */}
      <div style={{ overflowX: "auto" }}>
        {loading ? (
          <p>Loading...</p>
        ) : filteredCustomers.length === 0 ? (
          <p>No customers found.</p>
        ) : (
          <Table striped bordered hover variant="dark" style={{ background: "#1B263B", minWidth: "600px" }}>
            <thead style={{ background: "#1B263B", color: "#6C63FF" }}>
              <tr>
                <th>Name</th>
                <th>WhatsApp</th>
                <th>Notes</th>
                <th>Total Orders</th>
                <th>Total Spent</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.whatsapp}</td>
                  <td>{c.notes || "-"}</td>
                  <td>{c.totalOrders}</td>
                  <td>{currency}{Number(c.totalSpent).toLocaleString()}</td>
                  <td>
                    <Button
                      variant="danger"
                      size="sm"
                      style={{ height: "28px", padding: "0 8px" }}
                      onClick={() => handleDelete(c.id)}
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

      {/* Add Customer Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Customer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Name</Form.Label>
              <Form.Control
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ background: "#1B263B", color: "#E0E1DD" }}
              />
            </Form.Group>

            <Form.Group className="mt-3">
              <Form.Label>WhatsApp Number</Form.Label>
              <Form.Control
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                style={{ background: "#1B263B", color: "#E0E1DD" }}
              />
            </Form.Group>

            <Form.Group className="mt-3">
              <Form.Label>Notes (optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ background: "#1B263B", color: "#E0E1DD" }}
              />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button
            style={{ background: "#6C63FF", border: "none", fontWeight: "bold" }}
            onClick={handleAdd}
            disabled={adding}
          >
            {adding ? "Adding..." : "Add"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
