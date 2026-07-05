import { useEffect, useState } from "react";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { onAuthStateChanged } from "firebase/auth";

import { auth, logout } from "./firebase";

import Sidebar from "./components/Sidebar";
import { button, regenTheme } from "./theme/regenTheme";

import Login from "./pages/Login";
import Traceability from "./pages/Traceability";
import Production from "./pages/Production";
import ProductionHistory from "./pages/ProductionHistory";
import ProductionControlCenter from "./pages/ProductionControlCenter";

import Dashboard from "./pages/Dashboard";
import ProcurementDashboard from "./pages/ProcurementDashboard";
import InventoryDashboard from "./pages/InventoryDashboard";

import RMInward from "./pages/RMInward";
import RMList from "./pages/RMList";
import Suppliers from "./pages/Suppliers";
import SupplierEntry from "./pages/SupplierEntry";

import WashBatches from "./pages/WashBatches";
import ExtrusionBatches from "./pages/ExtrusionBatches";
import Dispatch from "./pages/Dispatch";
import ColorSorterBatches from "./pages/ColorSorterBatches";
import ProductionMaterials from "./pages/ProductionMaterials";
import LiveInventory from "./pages/LiveInventory";
import MonthlyAudit from "./pages/MonthlyAudit";
import InventoryAdjustments from "./pages/InventoryAdjustments";
import Quality from "./pages/Quality";
import FGRates from "./pages/FGRates";
import FactoryExpenses from "./pages/FactoryExpenses";

import Consumables from "./pages/Consumables";
import StoresInward from "./pages/StoresInward";
import StoresIssue from "./pages/StoresIssue";
import LiveStoresInventory from "./pages/LiveStoresInventory";
import StoresCosting from "./pages/StoresCosting";

import AlertSettings from "./pages/AlertSettings";
import AlertCenter from "./pages/AlertCenter";
import FactoryCostMaster from "./pages/FactoryCostMaster";
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
    return <div style={loadingStyle}>Loading RegenOS...</div>;
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
                RegenOS v1.0 RC1 · Logged in: <b>{user.email}</b>
              </div>
            </div>

            <button onClick={logout} style={logoutButton}>
              Logout
            </button>
          </div>

          <div style={pageWrap}>
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
              <Route path="/production-materials" element={<ProductionMaterials />} />
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
              <Route path="/factory-cost-master" element={<FactoryCostMaster />} />
              <Route path="/alert-center" element={<AlertCenter />} />
              <Route path="/alert-settings" element={<AlertSettings />} />

              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

const loadingStyle = {
  padding: 40,
  fontSize: 18,
  color: regenTheme.colors.deepGreen,
  fontFamily: regenTheme.fonts.body,
};

const appShell = {
  display: "flex",
  width: "100%",
  height: "100vh",
  margin: 0,
  padding: 0,
  background: regenTheme.colors.page,
  overflow: "hidden",
  fontFamily: regenTheme.fonts.body,
  color: regenTheme.colors.black,
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
  background: regenTheme.colors.deepGreen,
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
  background: "rgba(255, 255, 255, 0.94)",
  padding: "14px 24px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: `1px solid ${regenTheme.colors.line}`,
  boxShadow: regenTheme.shadow.soft,
  flexShrink: 0,
  position: "sticky",
  top: 0,
  zIndex: 150,
  backdropFilter: "blur(10px)",
};

const brandTitle = {
  fontWeight: 900,
  fontSize: 20,
  color: regenTheme.colors.deepGreen,
  fontFamily: regenTheme.fonts.heading,
};

const brandSub = {
  fontSize: 13,
  color: regenTheme.colors.slate,
  marginTop: 3,
};

const logoutButton = {
  ...button.danger,
  background: "#fff1f2",
};

const pageWrap = {
  flex: 1,
  overflowX: "hidden",
  overflowY: "auto",
  padding: "18px 22px",
  width: "100%",
  boxSizing: "border-box",
  background:
    "radial-gradient(circle at top left, rgba(166,206,57,0.18), transparent 28%), #f7faf5",
};
