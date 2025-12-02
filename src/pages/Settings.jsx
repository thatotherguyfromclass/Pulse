import { useEffect, useState } from "react";
import { Card, Form, Button, Spinner, Alert } from "react-bootstrap";
import { getAuth, updateEmail } from "firebase/auth";
import { getUserData, updateUserData, deleteUserAccount } from "../services/firestoreService";

export default function Settings() {
  const auth = getAuth();
  const user = auth.currentUser;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currency, setCurrency] = useState("₦");
  const [subscription, setSubscription] = useState("free"); // track subscription
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const currencyList = [
    { code: "₦", label: "Nigerian Naira (₦)" },
    { code: "GH₵", label: "Ghanaian Cedi (GH₵)" },
    { code: "KSh", label: "Kenyan Shilling (KSh)" },
    { code: "R", label: "South African Rand (R)" },
    { code: "USh", label: "Ugandan Shilling (USh)" },
    { code: "TZS", label: "Tanzanian Shilling (TZS)" },
    { code: "$", label: "US Dollar ($)" },
  ];

  useEffect(() => {
    const loadUserData = async () => {
      const data = await getUserData(user.uid);
      setName(data.name);
      setEmail(data.email);
      setCurrency(data.currency || "₦");
      setSubscription(data.subscriptionStatus || "free"); // load subscription status
      setLoading(false);
    };
    loadUserData();
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      if (email !== user.email) await updateEmail(user, email);
      await updateUserData(user.uid, { name, email, currency });
      setMessage("Settings updated successfully!");
    } catch (error) {
      setMessage("Error: " + error.message);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account? All data will be permanently deleted."
    );
    if (!confirmDelete) return;

    await deleteUserAccount(user.uid);
  };

  if (loading) return <p className="text-center mt-4">Loading settings...</p>;

  return (
    <div style={{ color: "#E0E1DD" }}>
      <h2 style={{ color: "#6C63FF", marginBottom: "20px" }}>Settings</h2>

      {message && <Alert variant="info">{message}</Alert>}

      <Card style={{ background: "#1B263B", border: "1px solid #415A77" }} className="p-3">
        <Form>
          <Form.Group className="mb-3">
            <Form.Label style={{ color: "#E0E1DD" }}>Name</Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ background: "#0D1B2A", color: "#E0E1DD", borderColor: "#6C63FF" }}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label style={{ color: "#E0E1DD" }}>Email</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ background: "#0D1B2A", color: "#E0E1DD", borderColor: "#6C63FF" }}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label style={{ color: "#E0E1DD" }}>Currency</Form.Label>
            <Form.Select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              style={{ background: "#0D1B2A", color: "#E0E1DD", borderColor: "#6C63FF" }}
            >
              {currencyList.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Button
            onClick={handleSave}
            disabled={saving}
            style={{ width: "100%", backgroundColor: "#6C63FF", border: "none", fontWeight: "bold" }}
          >
            {saving ? <Spinner animation="border" size="sm" /> : "Save Changes"}
          </Button>
        </Form>

        <hr style={{ borderColor: "#415A77" }} />

        <Button
          onClick={handleDelete}
          style={{ width: "100%", backgroundColor: "#FF4D4D", border: "none", fontWeight: "bold", marginTop: "10px" }}
        >
          Delete Account
        </Button>

        {/* Only show Upgrade button if user is not premium */}
        {subscription !== "premium" && (
          <Form.Group className="mb-4">
            <Button
              onClick={() => {
                window.open("https://codedbyprince.gumroad.com/l/pulse-premium", "_blank");
                setMessage(
                  "Once you complete the payment, it may take up to 12 hours for your account to be upgraded to Premium."
                );
              }}
              style={{
                width: "100%",
                backgroundColor: "#F4C95D",
                border: "none",
                fontWeight: "bold",
                marginTop: "10px"
              }}
            >
              Upgrade to Premium
            </Button>
          </Form.Group>
        )}

      </Card>
    </div>
  );
}
