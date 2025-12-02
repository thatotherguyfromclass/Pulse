import { useState } from "react";
import { Form, Alert, Spinner, Button, Card, InputGroup } from "react-bootstrap";
import { signup } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { Eye, EyeSlash } from 'react-bootstrap-icons';

const Signup = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currency, setCurrency] = useState("₦"); // NEW
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { user, error } = await signup(email, password, name, currency);
    setLoading(false);

    if (error) {
      setError(error);
    } else {
      setName("");
      setEmail("");
      setPassword("");

      navigate("/login", { 
        state: { signupMessage: "Account created successfully! You can now login." }
      });
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center pt-5"
      style={{ background: "#0D1B2A", minHeight: "100vh",
      overflowY: "auto",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "20px"}}
    >
      <Card
        style={{
          width: "400px",
          background: "#0D1B2A",
          border: "2px solid #6C63FF",
          borderRadius: "12px",
          margin: "20px"
        }}
        className="p-4 shadow-lg"
      >
        <h2 className="text-center mb-2" style={{ color: "#6C63FF", fontWeight: "bold" }}>
          Sign Up
        </h2>
        <p className="text-center mb-4" style={{ color: "#A9B2C3" }}>
          Register for an account to manage your WhatsApp sales, orders, and customers seamlessly.
        </p>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>

          {/* NAME */}
          <Form.Group className="mb-3">
            <Form.Label style={{ color: "#E0E1DD" }}>Name</Form.Label>
            <Form.Control
              className="custom-input"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                borderColor: "#6C63FF",
                background: "#1B263B",
                fontWeight: "500",
                color: "#E0E1DD",
              }}
            />
          </Form.Group>

          {/* EMAIL */}
          <Form.Group className="mb-3">
            <Form.Label style={{ color: "#E0E1DD" }}>Email</Form.Label>
            <Form.Control
              className="custom-input"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                borderColor: "#6C63FF",
                background: "#1B263B",
                fontWeight: "500",
                color: "#E0E1DD",
              }}
            />
          </Form.Group>

          {/* NEW — CURRENCY SELECT */}
          <Form.Group className="mb-3">
            <Form.Label style={{ color: "#E0E1DD" }}>Preferred Currency</Form.Label>
            <Form.Select
              className="custom-input"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              style={{
                borderColor: "#6C63FF",
                background: "#1B263B",
                color: "#E0E1DD",
                fontWeight: "500",
              }}
            >
              <option value="₦">🇳🇬 Nigerian Naira (₦)</option>
              <option value="GH₵">🇬🇭 Ghanaian Cedi (GH₵)</option>
              <option value="KSh">🇰🇪 Kenyan Shilling (KSh)</option>
              <option value="R">🇿🇦 South African Rand (R)</option>
              <option value="UGX">🇺🇬 Ugandan Shilling (UGX)</option>
              <option value="TSh">🇹🇿 Tanzanian Shilling (TSh)</option>
              <option value="$">🇺🇸 US Dollar ($)</option>
            </Form.Select>
          </Form.Group>

          {/* PASSWORD */}
          <Form.Group className="mb-4">
            <Form.Label style={{ color: "#E0E1DD" }}>Password</Form.Label>
            <InputGroup>
              <Form.Control
                className="custom-input"
                type={showPassword ? "text" : "password"}
                placeholder="Enter a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  borderColor: "#6C63FF",
                  background: "#1B263B",
                  fontWeight: "500",
                  color: "#E0E1DD",
                }}
              />
              <Button
                variant="outline-secondary"
                onClick={() => setShowPassword(!showPassword)}
                style={{ borderColor: "#6C63FF", background: "#1B263B", color: "#E0E1DD" }}
              >
                {showPassword ? <EyeSlash /> : <Eye />}
              </Button>
            </InputGroup>
          </Form.Group>

          <Button
            type="submit"
            className="w-100 mb-3"
            disabled={loading}
            style={{
              backgroundColor: "#6C63FF",
              border: "none",
              fontWeight: "bold",
              padding: "10px"
            }}
          >
            {loading ? <Spinner animation="border" size="sm" /> : "Sign Up"}
          </Button>
        </Form>

        <p className="text-center" style={{ color: "#E0E1DD", fontWeight: "500" }}>
          Already have an account?{" "}
          <span
            style={{ color: "#6C63FF", cursor: "pointer", fontWeight: "bold" }}
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </Card>
    </div>
  );
};

export default Signup;
