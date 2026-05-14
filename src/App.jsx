import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import RMInward from "./pages/RMInward";

function Dashboard() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Regen OS Dashboard</h1>

      <div style={{ marginTop: 20 }}>
        <Link
          to="/rm-inward"
          style={{
            padding: "12px 16px",
            background: "#166534",
            color: "white",
            textDecoration: "none",
            borderRadius: 10,
            fontWeight: "bold",
          }}
        >
          RM Inward
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/rm-inward" element={<RMInward />} />
      </Routes>
    </BrowserRouter>
  );
}