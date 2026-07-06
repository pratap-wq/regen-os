import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

import { auth, logout } from "./firebase";
import Sidebar from "./components/Sidebar";
import LucideIcon from "./components/LucideIcon";
import RegenGlobalStyles from "./components/RegenGlobalStyles";
import { button, getMode, regenTheme } from "./theme/regenTheme";

import Login from "./pages/Login";
import CommandCenter from "./pages/CommandCenter";
import Traceability from "./pages/Traceability";
import MaterialTransformation from "./pages/MaterialTransformation";
import MaterialReceiving from "./pages/MaterialReceiving";

import Dashboard from "./pages/Dashboard";

import Suppliers from "./pages/Suppliers";

import Dispatch from "./pages/Dispatch";
import ProductionMaterials from "./pages/ProductionMaterials";
import LiveInventory from "./pages/LiveInventory";
import MonthlyAudit from "./pages/MonthlyAudit";
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
  const [mode, setMode] = useState(
    () => localStorage.getItem("regen-theme") || "light"
  );
  const [presentationMode, setPresentationMode] = useState(false);
  const modeColors = getMode(mode);

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

  useEffect(() => {
    localStorage.setItem("regen-theme", mode);
  }, [mode]);

  if (loading) {
    return <div style={loadingStyle}>Loading RegenOS...</div>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      <RegenGlobalStyles />

      <div
        className={presentationMode ? "regen-presentation" : ""}
        data-theme={mode}
        style={appShell(modeColors)}
      >
        <aside style={sideWrap}>
          <Sidebar mode={mode} />
        </aside>

        <main style={mainWrap}>
          <div style={topBar(modeColors)}>
            <div>
              <div style={brandTitle(modeColors)}>
                <LucideIcon name="sparkles" size={20} />
                RegenOS Command Surface
              </div>

              <div style={brandSub(modeColors)}>
                RegenOS v1.0 RC1 · Premium manufacturing super app · <b>{user.email}</b>
              </div>
            </div>

            <div style={topActions}>
              <button
                type="button"
                onClick={() => setPresentationMode((value) => !value)}
                style={toggleButton(modeColors, presentationMode)}
              >
                <LucideIcon name="sparkles" size={16} />
                Investor Mode
              </button>

              <button
                type="button"
                onClick={() =>
                  setMode((value) => (value === "dark" ? "light" : "dark"))
                }
                style={toggleButton(modeColors, mode === "dark")}
              >
                <LucideIcon name={mode === "dark" ? "sun" : "moon"} size={16} />
                {mode === "dark" ? "Light" : "Dark"}
              </button>

              <button onClick={logout} style={logoutButton}>
                Logout
              </button>
            </div>
          </div>

          <div style={pageWrap(modeColors)}>
            <Routes>
              <Route
                path="/"
                element={
                  <CommandCenter
                    mode={mode}
                    presentationMode={presentationMode}
                  />
                }
              />
              <Route
                path="/command-center"
                element={
                  <CommandCenter
                    mode={mode}
                    presentationMode={presentationMode}
                  />
                }
              />
              <Route
                path="/production-control-center"
                element={<MaterialTransformation />}
              />
              <Route
                path="/material-transformation"
                element={<Navigate to="/production-control-center" replace />}
              />
              <Route path="/material-receiving" element={<MaterialReceiving />} />

              <Route path="/dashboard" element={<Dashboard />} />

              <Route path="/material-inventory" element={<LiveInventory />} />
              <Route path="/live-inventory" element={<Navigate to="/material-inventory" replace />} />
              <Route path="/suppliers" element={<Suppliers />} />

              <Route path="/dispatch" element={<Dispatch />} />
              <Route
                path="/production-materials"
                element={<ProductionMaterials />}
              />
              <Route path="/consumables" element={<Consumables />} />
              <Route path="/stores-inward" element={<StoresInward />} />
              <Route path="/stores-issue" element={<StoresIssue />} />
              <Route path="/live-stores" element={<LiveStoresInventory />} />
              <Route path="/quality" element={<Quality />} />
              <Route path="/traceability" element={<Traceability />} />
              <Route path="/stores-dashboard" element={<StoresCosting />} />
              <Route path="/stores-costing" element={<StoresCosting />} />

              <Route path="/monthly-close" element={<MonthlyAudit />} />
              <Route path="/fg-rates" element={<FGRates />} />
              <Route path="/factory-expenses" element={<FactoryExpenses />} />
              <Route
                path="/factory-cost-master"
                element={<FactoryCostMaster />}
              />
              <Route path="/alert-center" element={<AlertCenter />} />
              <Route path="/alert-settings" element={<AlertSettings />} />

              <Route path="/production" element={<Navigate to="/production-control-center" replace />} />
              <Route path="/production-history" element={<Navigate to="/production-control-center" replace />} />
              <Route path="/factory-pulse" element={<Navigate to="/command-center" replace />} />
              <Route path="/procurement-dashboard" element={<Navigate to="/material-receiving" replace />} />
              <Route path="/inventory-dashboard" element={<Navigate to="/material-inventory" replace />} />
              <Route path="/rm-inward" element={<Navigate to="/material-receiving" replace />} />
              <Route path="/rm-list" element={<Navigate to="/production-materials" replace />} />
              <Route path="/supplier-entry" element={<Navigate to="/suppliers" replace />} />
              <Route path="/wash-batches" element={<Navigate to="/production-control-center" replace />} />
              <Route path="/extrusion-batches" element={<Navigate to="/production-control-center" replace />} />
              <Route path="/color-sorter-batches" element={<Navigate to="/production-control-center" replace />} />
              <Route path="/inventory-adjustments" element={<Navigate to="/monthly-close" replace />} />

              <Route path="*" element={<Navigate to="/command-center" />} />
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

const appShell = (m) => ({
  display: "flex",
  width: "100%",
  height: "100vh",
  margin: 0,
  padding: 0,
  background:
    `radial-gradient(circle at 18% 0%, ${m.glow}, transparent 30%), radial-gradient(circle at 100% 10%, rgba(0,178,107,0.12), transparent 26%), ${m.page}`,
  overflow: "hidden",
  fontFamily: regenTheme.fonts.body,
  color: m.text,
});

const sideWrap = {
  width: 270,
  minWidth: 270,
  maxWidth: 270,
  flexShrink: 0,
  height: "100vh",
  overflow: "hidden",
  margin: 0,
  padding: 0,
  zIndex: 300,
  position: "sticky",
  top: 0,
  alignSelf: "flex-start",
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

const topBar = (m) => ({
  background: m.shell,
  padding: "14px 24px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  borderBottom: `1px solid ${m.border}`,
  boxShadow: regenTheme.shadow.soft,
  flexShrink: 0,
  position: "sticky",
  top: 0,
  zIndex: 150,
  backdropFilter: "blur(22px)",
});

const brandTitle = (m) => ({
  display: "flex",
  alignItems: "center",
  gap: 9,
  fontWeight: 900,
  fontSize: 20,
  color: m.text,
  fontFamily: regenTheme.fonts.heading,
});

const brandSub = (m) => ({
  fontSize: 13,
  color: m.subtleText,
  marginTop: 3,
});

const topActions = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  flexWrap: "wrap",
  justifyContent: "flex-end",
};

const toggleButton = (m, active) => ({
  ...button.secondary,
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  minHeight: 38,
  padding: "8px 12px",
  background: active ? regenTheme.colors.deepGreen : m.elevated,
  color: active ? "white" : m.text,
  border: `1px solid ${active ? regenTheme.colors.green : m.border}`,
  boxShadow: active ? "0 12px 26px rgba(0, 93, 52, 0.22)" : "none",
});

const logoutButton = {
  ...button.danger,
  minHeight: 38,
  background: "#fff1f2",
};

const pageWrap = (m) => ({
  flex: 1,
  overflowX: "hidden",
  overflowY: "auto",
  padding: "18px 22px",
  width: "100%",
  boxSizing: "border-box",
  background: "transparent",
  color: m.text,
});
