import { useState, useEffect } from "react";
import { Form, Button, Card, Alert, Spinner, InputGroup } from "react-bootstrap";
import { login, resetPassword } from "../services/authService";
import { useNavigate, useLocation } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Show message passed from signup page
  useEffect(() => {
    if (location.state && location.state.signupMessage) {
      setSuccess(location.state.signupMessage);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const { user, error } = await login(email, password);
    setLoading(false);

    if (error) setError(error);
    else navigate("/dashboard");
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError("Please enter your email to reset password.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const { success, error } = await resetPassword(email);
    setLoading(false);

    if (error) setError(error);
    else setSuccess("Password reset email sent! Check your inbox/spam.");
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100" style={{ background: "#0D1B2A" }}>
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
          Login
        </h2>
        <p className="text-center mb-4" style={{ color: "#A9B2C3" }}>
          Access your dashboard to manage WhatsApp sales, orders, and customers.
        </p>

        {success && <Alert variant="success">{success}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label style={{ color: "#E0E1DD" }}>Email</Form.Label>
            <Form.Control
                className="custom-input"
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                borderColor: "#6C63FF",
                background: "#1B263B",
                color: "#E0E1DD",
                fontWeight: "500"
              }}
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label style={{ color: "#E0E1DD" }}>Password</Form.Label>
            <InputGroup>
              <Form.Control
                className="custom-input"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  borderColor: "#6C63FF",
                  background: "#1B263B",
                  color: "#E0E1DD",
                  fontWeight: "500"
                }}
              />
              <Button
                variant="outline-secondary"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  borderColor: "#6C63FF",
                  background: "#1B263B",
                  color: "#E0E1DD"
                }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
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
            {loading ? <Spinner animation="border" size="sm" /> : "Login"}
          </Button>
        </Form>

        <p className="text-center" style={{ color: "#E0E1DD", fontWeight: "500" }}>
          Forgot password?{" "}
          <span
            style={{ color: "#6C63FF", cursor: "pointer", fontWeight: "bold" }}
            onClick={handleResetPassword}
          >
            Reset
          </span>
        </p>

        <p className="text-center" style={{ color: "#E0E1DD", fontWeight: "500" }}>
          Don't have an account?{" "}
          <span
            style={{ color: "#6C63FF", cursor: "pointer", fontWeight: "bold" }}
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </span>
        </p>
      </Card>
    </div>
  );
};

export default Login;
