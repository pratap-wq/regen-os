import Sidebar from "./Sidebar";

export default function Layout({ children }) {

  return (

    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f5f7fa",
      }}
    >

      <Sidebar />

      <div
        style={{
          flex: 1,
        }}
      >
        {children}
      </div>

    </div>

  );

}