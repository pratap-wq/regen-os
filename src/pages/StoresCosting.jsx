import { useEffect, useMemo, useState } from "react";
import { apiCall } from "../api/api";
import { formatDate } from "../utils/date";

export default function StoresCosting() {
  const now = new Date();

  const [inwardRows, setInwardRows] = useState([]);
  const [issueRows, setIssueRows] = useState([]);
  const [consumables, setConsumables] = useState([]);
  const [extrusionRows, setExtrusionRows] = useState([]);
  const [status, setStatus] = useState("");

  const [month, setMonth] = useState(
    String(now.getMonth() + 1).padStart(2, "0")
  );
  const [year, setYear] = useState(String(now.getFullYear()));

  useEffect(() => {
    loadData();
  }, []);

  async function safeLoad(fn) {
    try {
      const res = await apiCall({ fn });
      return res.rows || [];
    } catch (err) {
      console.log(fn, err);
      return [];
    }
  }

  async function loadData() {
    try {
      const [inward, issue, master, extrusion] = await Promise.all([
        safeLoad("storesInward.list"),
        safeLoad("storesIssue.list"),
        safeLoad("consumables.list"),
        safeLoad("extrusion.list"),
      ]);

      setInwardRows(inward);
      setIssueRows(issue);
      setConsumables(master);
      setExtrusionRows(extrusion);
    } catch (err) {
      setStatus(err.message);
    }
  }

  function inSelectedMonth(row) {
    const d = new Date(row.date || row.createdAt || "");
    if (isNaN(d.getTime())) return false;

    return (
      String(d.getFullYear()) === year &&
      String(d.getMonth() + 1).padStart(2, "0") === month
    );
  }

  function beforeSelectedMonth(row) {
    const d = new Date(row.date || row.createdAt || "");
    if (isNaN(d.getTime())) return false;

    const selected = new Date(Number(year), Number(month) - 1, 1);
    return d < selected;
  }

  function getItemRate(itemName) {
    const master = consumables.find(
      (x) => String(x.itemName) === String(itemName)
    );

    if (master && Number(master.standardRate || 0) > 0) {
      return Number(master.standardRate || 0);
    }

    const inwardForItem = inwardRows
      .filter((x) => String(x.itemName) === String(itemName))
      .filter((x) => Number(x.rate || 0) > 0);

    if (inwardForItem.length === 0) return 0;

    const totalQty = inwardForItem.reduce(
      (s, r) => s + Number(r.qty || 0),
      0
    );

    const totalValue = inwardForItem.reduce(
      (s, r) =>
        s +
        Number(r.totalAmount || Number(r.qty || 0) * Number(r.rate || 0)),
      0
    );

    return totalQty > 0 ? totalValue / totalQty : 0;
  }

  const data = useMemo(() => {
    const monthInward = inwardRows.filter(inSelectedMonth);
    const monthIssue = issueRows.filter(inSelectedMonth);
    const monthExtrusion = extrusionRows.filter(inSelectedMonth);

    const openingInwardValue = inwardRows
      .filter(beforeSelectedMonth)
      .reduce(
        (s, r) =>
          s +
          Number(r.totalAmount || Number(r.qty || 0) * Number(r.rate || 0)),
        0
      );

    const openingIssueValue = issueRows
      .filter(beforeSelectedMonth)
      .reduce((s, r) => {
        const rate = Number(r.issueRate || 0) || getItemRate(r.itemName);
        return s + Number(r.issueValue || Number(r.qty || 0) * rate);
      }, 0);

    const openingStockValue = openingInwardValue - openingIssueValue;

    const inwardValue = monthInward.reduce(
      (s, r) =>
        s +
        Number(r.totalAmount || Number(r.qty || 0) * Number(r.rate || 0)),
      0
    );

    const inwardQty = monthInward.reduce((s, r) => s + Number(r.qty || 0), 0);

    const issueValue = monthIssue.reduce((s, r) => {
      const rate = Number(r.issueRate || 0) || getItemRate(r.itemName);
      return s + Number(r.issueValue || Number(r.qty || 0) * rate);
    }, 0);

    const issueQty = monthIssue.reduce((s, r) => s + Number(r.qty || 0), 0);

    const closingStockValue = openingStockValue + inwardValue - issueValue;

    const fgProduced = monthExtrusion.reduce(
      (s, r) => s + Number(r.fgOutputKg || 0),
      0
    );

    const storesCostPerKg = fgProduced > 0 ? issueValue / fgProduced : 0;

    const itemMap = {};
    monthIssue.forEach((r) => {
      const item = r.itemName || "Unknown";
      const rate = Number(r.issueRate || 0) || getItemRate(item);
      const value = Number(r.issueValue || Number(r.qty || 0) * rate);

      if (!itemMap[item]) {
        itemMap[item] = {
          itemName: item,
          category: r.category || "",
          qty: 0,
          value: 0,
          rate,
        };
      }

      itemMap[item].qty += Number(r.qty || 0);
      itemMap[item].value += value;
    });

    const itemList = Object.values(itemMap).sort((a, b) => b.value - a.value);

    const deptMap = {};
    monthIssue.forEach((r) => {
      const dept = r.department || "Unknown";
      const rate = Number(r.issueRate || 0) || getItemRate(r.itemName);
      const value = Number(r.issueValue || Number(r.qty || 0) * rate);

      if (!deptMap[dept]) {
        deptMap[dept] = {
          department: dept,
          qty: 0,
          value: 0,
        };
      }

      deptMap[dept].qty += Number(r.qty || 0);
      deptMap[dept].value += value;
    });

    const departmentList = Object.values(deptMap).sort(
      (a, b) => b.value - a.value
    );

    const categoryMap = {};
    monthIssue.forEach((r) => {
      const category = r.category || "Unknown";
      const rate = Number(r.issueRate || 0) || getItemRate(r.itemName);
      const value = Number(r.issueValue || Number(r.qty || 0) * rate);

      if (!categoryMap[category]) {
        categoryMap[category] = {
          category,
          qty: 0,
          value: 0,
        };
      }

      categoryMap[category].qty += Number(r.qty || 0);
      categoryMap[category].value += value;
    });

    const categoryList = Object.values(categoryMap).sort(
      (a, b) => b.value - a.value
    );

    const vendorMap = {};
    monthInward.forEach((r) => {
      const supplier = r.supplier || "Unknown";
      const value = Number(
        r.totalAmount || Number(r.qty || 0) * Number(r.rate || 0)
      );

      if (!vendorMap[supplier]) {
        vendorMap[supplier] = {
          supplier,
          qty: 0,
          value: 0,
        };
      }

      vendorMap[supplier].qty += Number(r.qty || 0);
      vendorMap[supplier].value += value;
    });

    const vendorList = Object.values(vendorMap).sort(
      (a, b) => b.value - a.value
    );

    const stockMap = {};

    inwardRows.forEach((r) => {
      const item = r.itemName || "Unknown";
      const value = Number(
        r.totalAmount || Number(r.qty || 0) * Number(r.rate || 0)
      );

      if (!stockMap[item]) {
        stockMap[item] = {
          itemName: item,
          category: r.category || "",
          inwardQty: 0,
          issueQty: 0,
          stockQty: 0,
          stockValue: 0,
          rate: 0,
        };
      }

      stockMap[item].inwardQty += Number(r.qty || 0);
      stockMap[item].stockValue += value;
    });

    issueRows.forEach((r) => {
      const item = r.itemName || "Unknown";
      const rate = Number(r.issueRate || 0) || getItemRate(item);
      const value = Number(r.issueValue || Number(r.qty || 0) * rate);

      if (!stockMap[item]) {
        stockMap[item] = {
          itemName: item,
          category: r.category || "",
          inwardQty: 0,
          issueQty: 0,
          stockQty: 0,
          stockValue: 0,
          rate,
        };
      }

      stockMap[item].issueQty += Number(r.qty || 0);
      stockMap[item].stockValue -= value;
    });

    Object.values(stockMap).forEach((x) => {
      x.stockQty = x.inwardQty - x.issueQty;
      x.rate = getItemRate(x.itemName);
    });

    const stockList = Object.values(stockMap)
      .sort((a, b) => b.stockValue - a.stockValue)
      .slice(0, 50);

    return {
      openingStockValue,
      inwardValue,
      inwardQty,
      issueValue,
      issueQty,
      closingStockValue,
      fgProduced,
      storesCostPerKg,
      itemList,
      departmentList,
      categoryList,
      vendorList,
      stockList,
      monthIssue,
      monthInward,
    };
  }, [inwardRows, issueRows, consumables, extrusionRows, month, year]);

  return (
    <div style={page}>
      <div style={hero}>
        <div>
          <div style={eyebrow}>Stores Costing</div>
          <h1 style={title}>Consumables Cost Dashboard</h1>
          <div style={subtitle}>
            Monthly stores spend, issue value, department consumption and cost/kg production.
          </div>
        </div>

        <div style={filters}>
          <select value={month} onChange={(e) => setMonth(e.target.value)} style={filter}>
            <option value="01">Jan</option>
            <option value="02">Feb</option>
            <option value="03">Mar</option>
            <option value="04">Apr</option>
            <option value="05">May</option>
            <option value="06">Jun</option>
            <option value="07">Jul</option>
            <option value="08">Aug</option>
            <option value="09">Sep</option>
            <option value="10">Oct</option>
            <option value="11">Nov</option>
            <option value="12">Dec</option>
          </select>

          <select value={year} onChange={(e) => setYear(e.target.value)} style={filter}>
            <option>2025</option>
            <option>2026</option>
            <option>2027</option>
          </select>
        </div>
      </div>

      {status && <div style={errorBox}>{status}</div>}

      <div style={kpiGrid}>
        <KPI title="Opening Stock Value" value={`₹ ${lakh(data.openingStockValue)} L`} />
        <KPI title="Stores Inward Value" value={`₹ ${lakh(data.inwardValue)} L`} />
        <KPI title="Stores Issue Value" value={`₹ ${lakh(data.issueValue)} L`} color="#dc2626" />
        <KPI title="Closing Stock Value" value={`₹ ${lakh(data.closingStockValue)} L`} />
        <KPI title="FG Production" value={`${ton(data.fgProduced)} T`} />
        <KPI title="Stores Cost / Kg" value={`₹ ${data.storesCostPerKg.toFixed(2)}`} color="#d97706" />
      </div>

      <div style={twoCol}>
        <Panel title="Department-wise Consumption">
          <SimpleTable
            columns={["Department", "Qty", "Value"]}
            rows={data.departmentList.map((x) => [
              x.department,
              qty(x.qty),
              `₹ ${lakh(x.value)} L`,
            ])}
          />
        </Panel>

        <Panel title="Category-wise Consumption">
          <SimpleTable
            columns={["Category", "Qty", "Value"]}
            rows={data.categoryList.map((x) => [
              x.category,
              qty(x.qty),
              `₹ ${lakh(x.value)} L`,
            ])}
          />
        </Panel>
      </div>

      <Panel title="Top Consumables by Cost">
        <SimpleTable
          columns={["Item", "Category", "Qty", "Value", "Avg Rate"]}
          rows={data.itemList.slice(0, 25).map((x) => [
            x.itemName,
            x.category,
            qty(x.qty),
            `₹ ${lakh(x.value)} L`,
            `₹ ${Number(x.rate || 0).toFixed(2)}`,
          ])}
        />
      </Panel>

      <div style={twoCol}>
        <Panel title="Vendor-wise Purchases">
          <SimpleTable
            columns={["Supplier", "Qty", "Value"]}
            rows={data.vendorList.slice(0, 20).map((x) => [
              x.supplier,
              qty(x.qty),
              `₹ ${lakh(x.value)} L`,
            ])}
          />
        </Panel>

        <Panel title="Current Stores Stock Value">
          <SimpleTable
            columns={["Item", "Stock Qty", "Value", "Rate"]}
            rows={data.stockList.map((x) => [
              x.itemName,
              qty(x.stockQty),
              `₹ ${lakh(x.stockValue)} L`,
              `₹ ${Number(x.rate || 0).toFixed(2)}`,
            ])}
          />
        </Panel>
      </div>

      <Panel title="Monthly Issue List">
        <div style={{ overflowX: "auto" }}>
          <table style={table}>
            <thead>
              <tr style={headRow}>
                <th style={th}>Date</th>
                <th style={th}>Item</th>
                <th style={th}>Category</th>
                <th style={th}>Qty</th>
                <th style={th}>Rate Used</th>
                <th style={th}>Value</th>
                <th style={th}>Department</th>
                <th style={th}>Purpose</th>
              </tr>
            </thead>

            <tbody>
              {data.monthIssue.map((r, i) => {
                const rate = Number(r.issueRate || 0) || getItemRate(r.itemName);
                const value = Number(r.issueValue || Number(r.qty || 0) * rate);

                return (
                  <tr key={i}>
                    <td style={td}>{formatDate(r.date)}</td>
                    <td style={td}><b>{r.itemName}</b></td>
                    <td style={td}>{r.category}</td>
                    <td style={td}>{r.qty}</td>
                    <td style={td}>₹ {rate.toFixed(2)}</td>
                    <td style={td}>₹ {value.toFixed(0)}</td>
                    <td style={td}>{r.department}</td>
                    <td style={td}>{r.purpose}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function KPI({ title, value, color = "#0f766e" }) {
  return (
    <div style={kpi}>
      <div style={kpiTitle}>{title}</div>
      <div style={{ ...kpiValue, color }}>{value}</div>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div style={panel}>
      <h3 style={panelTitle}>{title}</h3>
      {children}
    </div>
  );
}

function SimpleTable({ columns, rows }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={table}>
        <thead>
          <tr style={headRow}>
            {columns.map((c) => (
              <th key={c} style={th}>{c}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={empty}>
                No data for selected month.
              </td>
            </tr>
          ) : (
            rows.map((r, i) => (
              <tr key={i}>
                {r.map((c, j) => (
                  <td key={j} style={td}>{c}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function lakh(value) {
  return (Number(value || 0) / 100000).toFixed(2);
}

function ton(value) {
  return (Number(value || 0) / 1000).toFixed(1);
}

function qty(value) {
  return Number(value || 0).toFixed(2);
}

const page = {
  padding: 20,
};

const hero = {
  background: "linear-gradient(135deg,#064e3b,#0f766e)",
  color: "white",
  borderRadius: 18,
  padding: 24,
  marginBottom: 20,
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  flexWrap: "wrap",
};

const eyebrow = {
  fontSize: 13,
  textTransform: "uppercase",
  letterSpacing: 1.2,
  opacity: 0.85,
  fontWeight: 800,
};

const title = {
  margin: "6px 0",
  fontSize: 32,
  fontWeight: 950,
};

const subtitle = {
  opacity: 0.9,
};

const filters = {
  display: "flex",
  gap: 10,
  alignItems: "start",
};

const filter = {
  height: 42,
  borderRadius: 10,
  border: "none",
  padding: "0 12px",
  fontWeight: 800,
};

const kpiGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))",
  gap: 16,
  marginBottom: 18,
};

const kpi = {
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  boxShadow: "0 6px 18px rgba(15,23,42,0.06)",
};

const kpiTitle = {
  color: "#64748b",
  fontSize: 12,
  fontWeight: 800,
  textTransform: "uppercase",
  marginBottom: 8,
};

const kpiValue = {
  fontSize: 26,
  fontWeight: 950,
};

const twoCol = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(360px,1fr))",
  gap: 18,
  marginBottom: 18,
};

const panel = {
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  marginBottom: 18,
  boxShadow: "0 6px 18px rgba(15,23,42,0.06)",
};

const panelTitle = {
  marginTop: 0,
  marginBottom: 14,
  fontSize: 18,
  color: "#0f172a",
  fontWeight: 900,
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: 650,
};

const headRow = {
  background: "#0f766e",
  color: "white",
};

const th = {
  padding: 11,
  textAlign: "left",
  fontSize: 12,
  whiteSpace: "nowrap",
};

const td = {
  padding: 10,
  borderBottom: "1px solid #e5e7eb",
  fontSize: 13,
  whiteSpace: "nowrap",
};

const empty = {
  padding: 18,
  textAlign: "center",
  color: "#64748b",
};

const errorBox = {
  marginBottom: 16,
  background: "#fee2e2",
  color: "#991b1b",
  padding: 12,
  borderRadius: 10,
  fontWeight: 700,
};