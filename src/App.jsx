import { useEffect, useState } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { onAuthStateChanged } from "firebase/auth";

import { auth, logout } from "./firebase";

import Sidebar from "./components/Sidebar";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RMInward from "./pages/RMInward";
import RMList from "./pages/RMList";
import Suppliers from "./pages/Suppliers";
import WashBatches from "./pages/WashBatches";
import ExtrusionBatches from "./pages/ExtrusionBatches";
import Dispatch from "./pages/Dispatch";
import MonthlyAudit from "./pages/MonthlyAudit";
import LiveInventory from "./pages/LiveInventory";
import FGRates from "./pages/FGRates";
import FactoryExpenses from "./pages/FactoryExpenses";
import Consumables from "./pages/Consumables";
import SupplierEntry from "./pages/SupplierEntry";
import StoresInward from "./pages/StoresInward";
import StoresIssue from "./pages/StoresIssue";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u && u.email && u.email.endsWith("@regenplastic.com")) {
        setUser(u);
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 40, fontSize: 18 }}>
        Loading Regen OS...
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          background: "#f3f4f6",
        }}
      >
        <Sidebar />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              background: "white",
              padding: 15,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #ddd",
              position: "sticky",
              top: 0,
              zIndex: 100,
            }}
          >
            <div>
              Logged in: <b>{user.email}</b>
            </div>

            <button
              onClick={logout}
              style={{
                background: "#dc2626",
                color: "white",
                border: "none",
                padding: "10px 14px",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Logout
            </button>
          </div>

          <div style={{ flex: 1, overflow: "auto" }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/live-inventory" element={<LiveInventory />} />
              <Route path="/rm-inward" element={<RMInward />} />
              <Route path="/rm-list" element={<RMList />} />
              <Route path="/suppliers" element={<Suppliers />} />
              <Route path="/wash-batches" element={<WashBatches />} />
              <Route path="/extrusion-batches" element={<ExtrusionBatches />} />
              <Route path="/dispatch" element={<Dispatch />} />
              <Route path="/monthly-audit" element={<MonthlyAudit />} />
              <Route path="/fg-rates" element={<FGRates />} />
              <Route path="/consumables" element={<Consumables />} />
              <Route path="/factory-expenses" element={<FactoryExpenses />} />
              <Route path="*" element={<Navigate to="/" />} />
              <Route path="/supplier-entry" element={<SupplierEntry />} />
              <Route path="/stores-inward" element={<StoresInward />} />
              <Route path="/stores-issue" element={<StoresIssue />} />


            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}