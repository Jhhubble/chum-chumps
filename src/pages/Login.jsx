import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { supabase } from "../lib/supabase";


function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  async function handleLogin(event) {
    event.preventDefault();
    setMessage("");
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    navigate("/picks");
  }


  return (
    <main style={styles.page}>
      <form onSubmit={handleLogin} style={styles.card}>
        <h2>College Football Pick'em</h2>
        <h2>Sign In</h2>

        <label style={styles.label}>
            Email
            <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                style={styles.input}
                required
            />
        </label>
        <label style={styles.label}>
            Password
            <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                style={styles.input}
                required
            />
        </label>
        <button type="submit" disabled={isLoading} style={styles.button}>
            {isLoading ? "Signing In..." : "Sign In"}
        </button>

        {message && <p>{message}</p>}

        <p>
            Don't have an account? <Link to="/register">Register here</Link>    
        </p>
      </form>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: "20px",
    backgroundColor: "#f3f4f6",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    display: "grid",
    gap: "16px",
    padding: "30px",
    borderRadius: "12px",
    backgroundColor: "white",
    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.15)",
  },
  label: {
    display: "grid",
    gap: "6px",
    textAlign: "left",
    fontWeight: "bold",
  },
  input: {
    padding: "12px",
    fontSize: "16px",
    border: "1px solid #aaa",
    borderRadius: "7px",
  },
  button: {
    padding: "14px",
    fontSize: "17px",
    color: "white",
    backgroundColor: "#0b5ed7",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};

export default Login;