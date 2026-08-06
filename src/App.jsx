import { Navigate, Route, Routes } from "react-router";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Header from "./components/Header";
import GameCard from "./components/GameCard";
import Standings from "./components/Standings";


function PicksPage() {
  return (
    <div style={{ padding: "30px" }}>
      <Header />

      <GameCard />

      <Standings />
    </div>
  );
}


function App() {
  return (
    <Routes>
      <Route path="/login"  element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/picks" element={<PicksPage />} />

      <Route path="/" element={<Navigate to="/login" replace />} />
  </Routes>
  );
}

export default App;