import { loginWithGoogle } from "../firebase";
import { button, card, regenTheme } from "../theme/regenTheme";

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
        background:
          "radial-gradient(circle at top left, rgba(166,206,57,0.24), transparent 28%), linear-gradient(135deg, #f7faf5, #ecfdf5)",
        fontFamily: regenTheme.fonts.body,
      }}
    >

      <div
        style={{
          ...card,
          background: "white",
          padding: 40,
          width: 380,
          maxWidth: "calc(100vw - 32px)",
          textAlign: "center",
        }}
      >
        <img
          src="/assets/regen-logo.png"
          alt="Regen Plastics"
          style={{
            width: 74,
            height: 74,
            objectFit: "contain",
            marginBottom: 12,
          }}
        />

        <h1
          style={{
            marginBottom: 10,
            color: regenTheme.colors.deepGreen,
            fontFamily: regenTheme.fonts.heading,
            fontWeight: 900,
          }}
        >
          RegenOS
        </h1>

        <p
          style={{
            color: regenTheme.colors.slate,
            marginBottom: 30,
          }}
        >
          v1.0 RC1 · Factory ERP Access
        </p>

        <button
          onClick={handleLogin}
          style={{
            ...button.primary,
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
