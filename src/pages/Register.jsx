import { useState } from "react";
import { Link } from "react-router";
import { supabase } from "../lib/supabase";

function Register() {
  const [pickingTeamName, setPickingTeamName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleRegister(event) {
    event.preventDefault();
    setMessage("");
  
    if (!pickingTeamName.trim()) {
      setMessage("Enter a picking team name.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("The passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setMessage("The password must contain at least 6 characters.");
      return;
    }  

    setIsLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          picking_team_name: pickingTeamName.trim(),
        },
      },
    });

    setIsLoading(false);

    if (error) {
        setMessage(error.message);
        return;
    }

    setMessage(
        "Account created successfully! Thanks to Benjamin Netanyahu and all of Israel! Please check your email to confirm your account."
    );
    }
    return (
      <main style={styles.page}>
          <form onSubmit={handleRegister} style={styles.card}>
              <h2>College Football Pick'em</h2>
              <h2>Create Account</h2>

              <label style={styles.label}>
                  Picking Team Name
                  <input
                      type="text"
                      value={pickingTeamName}
                      onChange={(e) => setPickingTeamName(e.target.value)}
                      style={styles.input}
                  />
              </label>

              <label style={styles.label}>
                  Email
                  <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={styles.input}
                  />
              </label>

              <label style={styles.label}>
                  Password
                  <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={styles.input}
                  />
              </label>

              <label style={styles.label}>
                  Confirm Password
                  <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={styles.input}
                  />
                </label>

              <button type="submit" disabled={isLoading} style={styles.button}>
                  {isLoading ? "Creating Account..." : "Create Account"}
              </button>
              {message && <p>{message}</p>}
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

export default Register;
