import { useEffect, useMemo, useState } from "react";
import { apiCall } from "../api/api";
import DataTable from "../components/DataTable";
import EditModal from "../components/EditModal";

export default function RMList() {
  const [rows, setRows] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const [stats, setStats] = useState({
    totalQty: 0,
    totalValue: 0,
    supplierCount: 0,
    avgRate: 0,
  });

  useEffect(() => {
    loadRows();
  }, []);

  function getSupplierName(s) {
    return (
      s.supplierName ||
      s.name ||
      s.SupplierName ||
      s["Supplier Name"] ||
      s.supplier ||
      s.Supplier ||
      ""
    );
  }

  async function loadRows() {
    try {
      const [rmRes, suppliersRes, categoriesRes] = await Promise.all([
        apiCall({ fn: "rm.list" }),
        apiCall({ fn: "suppliers.list" }),
        apiCall({ fn: "categories.list" }),
      ]);

      const cleanRows = (rmRes.rows || []).filter(
        (r) => String(r.status || "").toUpperCase() !== "DELETED"
      );

      const supplierOptions = (suppliersRes.rows || [])
        .map(getSupplierName)
        .filter(Boolean)
        .sort();

      const materialOptions = (categoriesRes.rows || [])
        .map((c) => c.categoryName || c.name || c["Category Name"] || c.material || "")
        .filter(Boolean)
        .sort();

      setRows(cleanRows);
      setSuppliers(supplierOptions);
      setMaterials(materialOptions);
      calculateStats(cleanRows);
    } catch (err) {
      console.log(err);
    }
  }

  function calculateStats(data) {
    let totalQty = 0;
    let totalValue = 0;
    const supplierSet = new Set();

    data.forEach((r) => {
      const qty = Number(r.netWeight || 0);
      const rate = Number(r.ratePerKg || 0);

      totalQty += qty;
      totalValue += qty * rate;

      if (r.supplier) supplierSet.add(r.supplier);
    });

    setStats({
      totalQty: totalQty.toFixed(0),
      totalValue: totalValue.toFixed(0),
      supplierCount: supplierSet.size,
      avgRate: totalQty > 0 ? (totalValue / totalQty).toFixed(2) : 0,
    });
  }

  function handleEdit(row) {
    setEditing({ ...row });
  }

  async function saveEdit() {
    try {
      setSaving(true);

      const res = await apiCall({
        fn: "rm.update",
        ...editing,
      });

      if (res.ok) {
        alert("Updated successfully");
        setEditing(null);
        loadRows();
      } else {
        alert(res.error || "Update failed");
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(row) {
    const ok = window.confirm("Mark RM entry deleted?");
    if (!ok) return;

    try {
      await apiCall({
        fn: "rm.update",
        ...row,
        status: "DELETED",
      });

      loadRows();
    } catch (err) {
      alert(err.message);
    }
  }

  function onChange(e) {
    const updated = {
      ...editing,
      [e.target.name]: e.target.value,
    };

    const gross = Number(updated.grossWeight || 0);
    const tare = Number(updated.tareWeight || 0);
    updated.netWeight = gross - tare;

    setEditing(updated);
  }

  const topSuppliers = useMemo(() => {
    const map = {};

    rows.forEach((r) => {
      const supplier = r.supplier || "Unknown";
      map[supplier] = (map[supplier] || 0) + Number(r.netWeight || 0);
    });

    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [rows]);

  return (
    <div style={pageStyle}>
      <div style={headerCard}>
        <div>
          <h1 style={{ margin: 0 }}>RM Inward List</h1>
          <div style={subText}>
            Raw material inward management & procurement tracking
          </div>
          <div style={debugText}>
            Supplier master loaded: {suppliers.length} | Material master loaded:{" "}
            {materials.length}
          </div>
        </div>
      </div>

      <div style={kpiGrid}>
        <KPI title="RM Qty" value={`${stats.totalQty} Kg`} />
        <KPI
          title="RM Value"
          value={`₹ ${Number(stats.totalValue).toLocaleString()}`}
        />
        <KPI title="Suppliers" value={stats.supplierCount} />
        <KPI title="Avg RM Rate" value={`₹ ${stats.avgRate}`} />
      </div>

      <div style={analyticsCard}>
        <h3 style={{ marginTop: 0 }}>Top Suppliers</h3>

        <div style={supplierGrid}>
          {topSuppliers.map((s, i) => (
            <div key={i} style={supplierCard}>
              <div style={{ fontWeight: 700 }}>{s[0]}</div>
              <div
                style={{
                  marginTop: 6,
                  color: "#0f766e",
                  fontWeight: 700,
                }}
              >
                {Number(s[1]).toFixed(0)} Kg
              </div>
            </div>
          ))}
        </div>
      </div>

      <DataTable
        title="RM Inward List"
        rows={rows}
        searchFields={[
          "supplier",
          "material",
          "vehicleNo",
          "date",
          "inwardId",
        ]}
        columns={[
          { key: "date", label: "Date" },
          { key: "inwardId", label: "Batch" },
          { key: "supplier", label: "Supplier" },
          { key: "vehicleNo", label: "Vehicle" },
          { key: "material", label: "Material" },
          { key: "netWeight", label: "Net Kg" },
          { key: "ratePerKg", label: "Rate" },
          { key: "estimatedRecovery", label: "Recovery %" },
          { key: "moisture", label: "Moisture" },
        ]}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {editing && (
        <EditModal
          title="Edit RM Entry"
          values={editing}
          onChange={onChange}
          onSave={saveEdit}
          onCancel={() => setEditing(null)}
          saving={saving}
          fields={[
            {
              key: "date",
              label: "Date",
            },
            {
              key: "supplier",
              label: "Supplier",
              type: "select",
              options: suppliers,
            },
            {
              key: "vehicleNo",
              label: "Vehicle No",
            },
            {
              key: "material",
              label: "Material",
              type: "select",
              options: materials,
            },
            {
              key: "grossWeight",
              label: "Gross Weight",
            },
            {
              key: "tareWeight",
              label: "Tare Weight",
            },
            {
              key: "netWeight",
              label: "Net Weight",
            },
            {
              key: "moisture",
              label: "Moisture %",
            },
            {
              key: "contamination",
              label: "Contamination %",
            },
            {
              key: "estimatedRecovery",
              label: "Recovery %",
            },
            {
              key: "ratePerKg",
              label: "Rate Per Kg",
            },
            {
              key: "remarks",
              label: "Remarks",
              type: "textarea",
            },
          ]}
        />
      )}
    </div>
  );
}

function KPI({ title, value }) {
  return (
    <div style={kpiCard}>
      <div style={kpiTitle}>{title}</div>
      <div style={kpiValue}>{value}</div>
    </div>
  );
}

const pageStyle = {
  padding: 20,
  width: "100%",
  maxWidth: "100%",
};

const headerCard = {
  background: "white",
  padding: 18,
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  marginBottom: 16,
};

const subText = {
  color: "#64748b",
  marginTop: 4,
  fontSize: 13,
};

const debugText = {
  color: "#0f766e",
  marginTop: 8,
  fontSize: 12,
  fontWeight: 700,
};

const kpiGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
  gap: 14,
  marginBottom: 16,
};

const kpiCard = {
  background: "white",
  padding: 16,
  borderRadius: 12,
  border: "1px solid #e5e7eb",
};

const kpiTitle = {
  color: "#64748b",
  fontSize: 12,
  marginBottom: 8,
};

const kpiValue = {
  fontSize: 22,
  fontWeight: 700,
  color: "#005d34",
};

const analyticsCard = {
  background: "white",
  padding: 18,
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  marginBottom: 16,
};

const supplierGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
  gap: 12,
};

const supplierCard = {
  border: "1px solid #e5e7eb",
  borderRadius: 10,
  padding: 12,
  background: "#f8fafc",
};