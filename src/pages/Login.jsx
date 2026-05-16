import { loginWithGoogle } from "../firebase";

export default function Login() {

  async function handleLogin() {

    try {

      await loginWithGoogle();

      window.location.reload();

    } catch (err) {

      console.log(err);

    }

  }

  return (

    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f3f4f6",
      }}
    >

      <div
        style={{
          background: "white",
          padding: 40,
          borderRadius: 12,
          width: 350,
          textAlign: "center",
          boxShadow: "0 2px 20px rgba(0,0,0,0.08)",
        }}
      >

        <h1
          style={{
            marginBottom: 10,
            color: "#0f766e",
          }}
        >
          Regen OS
        </h1>

        <p
          style={{
            color: "#666",
            marginBottom: 30,
          }}
        >
          Internal ERP Access
        </p>

        <button
          onClick={handleLogin}
          style={{
            background: "#0f766e",
            color: "white",
            border: "none",
            padding: "14px 20px",
            borderRadius: 8,
            cursor: "pointer",
            width: "100%",
            fontSize: 16,
          }}
        >
          Login with Google
        </button>

      </div>

    </div>

  );

}