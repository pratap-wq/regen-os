import { lazy, Suspense, useEffect, useState } from "react";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { onAuthStateChanged } from "firebase/auth";

import { auth, logout } from "./firebase";

import Sidebar from "./components/Sidebar";

import Login from "./pages/Login";

const Traceability = lazy(() => import("./pages/Traceability"));
const Production = lazy(() => import("./pages/Production"));
const ProductionHistory = lazy(() => import("./pages/ProductionHistory"));
const ProductionControlCenter = lazy(() => import("./pages/ProductionControlCenter"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ProcurementDashboard = lazy(() => import("./pages/ProcurementDashboard"));
const InventoryDashboard = lazy(() => import("./pages/InventoryDashboard"));
const RMInward = lazy(() => import("./pages/RMInward"));
const RMList = lazy(() => import("./pages/RMList"));
const Suppliers = lazy(() => import("./pages/Suppliers"));
const SupplierEntry = lazy(() => import("./pages/SupplierEntry"));
const WashBatches = lazy(() => import("./pages/WashBatches"));
const ExtrusionBatches = lazy(() => import("./pages/ExtrusionBatches"));
const Dispatch = lazy(() => import("./pages/Dispatch"));
const ColorSorterBatches = lazy(() => import("./pages/ColorSorterBatches"));
const FactoryMasters = lazy(() => import("./pages/FactoryMasters"));
const LiveInventory = lazy(() => import("./pages/LiveInventory"));
const MonthlyAudit = lazy(() => import("./pages/MonthlyAudit"));
const InventoryAdjustments = lazy(() => import("./pages/InventoryAdjustments"));
const Quality = lazy(() => import("./pages/Quality"));
const FGRates = lazy(() => import("./pages/FGRates"));
const FactoryExpenses = lazy(() => import("./pages/FactoryExpenses"));
const Consumables = lazy(() => import("./pages/Consumables"));
const StoresInward = lazy(() => import("./pages/StoresInward"));
const StoresIssue = lazy(() => import("./pages/StoresIssue"));
const LiveStoresInventory = lazy(() => import("./pages/LiveStoresInventory"));
const StoresCosting = lazy(() => import("./pages/StoresCosting"));
const AlertSettings = lazy(() => import("./pages/AlertSettings"));
const AlertCenter = lazy(() => import("./pages/AlertCenter"));
const SystemHealth = lazy(() => import("./pages/SystemHealth"));
const MaterialMasterAdmin = lazy(() => import("./pages/MaterialMasterAdmin"));
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
    return <div style={loadingStyle}>Loading Regen OS...</div>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      <div style={appShell}>
        <aside style={sideWrap}>
          <Sidebar />
        </aside>

        <main style={mainWrap}>
          <div style={topBar}>
            <div>
              <div style={brandTitle}>Regen OS</div>

              <div style={brandSub}>
                Logged in: <b>{user.email}</b>
              </div>
            </div>

            <button onClick={logout} style={logoutButton}>
              Logout
            </button>
          </div>

          <div style={pageWrap}>
            <Suspense fallback={<div style={loadingStyle}>Loading RegenOS...</div>}>
              <Routes>
              <Route path="/" element={<Production />} />
              <Route path="/production" element={<Production />} />
              <Route
                path="/production-history"
                element={<ProductionHistory />}
              />
              <Route
                path="/production-control-center"
                element={<ProductionControlCenter />}
              />

              <Route path="/dashboard" element={<Dashboard />} />
              <Route
                path="/procurement-dashboard"
                element={<ProcurementDashboard />}
              />
              <Route
                path="/inventory-dashboard"
                element={<InventoryDashboard />}
              />

              <Route path="/live-inventory" element={<LiveInventory />} />
              <Route path="/rm-inward" element={<RMInward />} />
              <Route path="/rm-list" element={<RMList />} />
              <Route path="/suppliers" element={<Suppliers />} />
              <Route path="/supplier-entry" element={<SupplierEntry />} />

              <Route path="/wash-batches" element={<WashBatches />} />
              <Route path="/extrusion-batches" element={<ExtrusionBatches />} />
              <Route
                path="/color-sorter-batches"
                element={<ColorSorterBatches />}
              />

              <Route path="/dispatch" element={<Dispatch />} />
              <Route path="/factory-masters" element={<FactoryMasters />} />
              <Route path="/production-materials" element={<FactoryMasters />} />
              <Route path="/consumables" element={<Consumables />} />
              <Route path="/stores-inward" element={<StoresInward />} />
              <Route path="/stores-issue" element={<StoresIssue />} />
              <Route path="/live-stores" element={<LiveStoresInventory />} />
              <Route path="/quality" element={<Quality />} />
              <Route path="/traceability" element={<Traceability />} />
              <Route path="/stores-dashboard" element={<StoresCosting />} />
              <Route path="/stores-costing" element={<StoresCosting />} />

              <Route path="/monthly-close" element={<MonthlyAudit />} />
              <Route path="/inventory-adjustments" element={<InventoryAdjustments />} />
              <Route path="/fg-rates" element={<FGRates />} />
              <Route path="/factory-expenses" element={<FactoryExpenses />} />
              <Route path="/alert-center" element={<AlertCenter />} />
              <Route path="/alert-settings" element={<AlertSettings />} />
              <Route path="/system-health" element={<SystemHealth />} />
              <Route path="/material-master-admin" element={<MaterialMasterAdmin />} />

                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>
            </Suspense>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

const loadingStyle = {
  padding: 40,
  fontSize: 18,
};

const appShell = {
  display: "flex",
  width: "100%",
  height: "100vh",
  margin: 0,
  padding: 0,
  background: "#f8fafc",
  overflow: "hidden",
};

const sideWrap = {
  width: 250,
  minWidth: 250,
  maxWidth: 250,
  flexShrink: 0,
  height: "100vh",
  overflow: "hidden",
  margin: 0,
  padding: 0,
  zIndex: 300,
  position: "sticky",
  top: 0,
  alignSelf: "flex-start",
  background: "#005d34",
};

const mainWrap = {
  flex: 1,
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  overflow: "hidden",
  margin: 0,
  padding: 0,
};

const topBar = {
  background: "white",
  padding: "12px 22px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: "1px solid #e5e7eb",
  boxShadow: "0 2px 10px rgba(15,23,42,0.04)",
  flexShrink: 0,
  position: "sticky",
  top: 0,
  zIndex: 150,
};

const brandTitle = {
  fontWeight: 800,
  fontSize: 18,
  color: "#0f766e",
};

const brandSub = {
  fontSize: 13,
  color: "#64748b",
  marginTop: 3,
};

const logoutButton = {
  background: "#dc2626",
  color: "white",
  border: "none",
  padding: "10px 16px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 700,
};

const pageWrap = {
  flex: 1,
  overflowX: "hidden",
  overflowY: "auto",
  padding: "16px 20px",
  width: "100%",
  boxSizing: "border-box",
  background: "#f8fafc",
};
