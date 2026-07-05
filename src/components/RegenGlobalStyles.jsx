export default function RegenGlobalStyles() {
  return (
    <style>
      {`
        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 93, 52, 0.35) transparent;
        }

        body {
          margin: 0;
          text-rendering: geometricPrecision;
          -webkit-font-smoothing: antialiased;
          background: #f7faf5;
        }

        button, a, input, select, textarea {
          transition:
            transform 160ms ease,
            box-shadow 160ms ease,
            border-color 160ms ease,
            background 160ms ease,
            color 160ms ease;
        }

        button:hover,
        a:hover {
          transform: translateY(-1px);
        }

        button:active,
        a:active {
          transform: translateY(0);
        }

        .regen-animate-in {
          animation: regenFadeUp 420ms cubic-bezier(.2,.8,.2,1) both;
        }

        .regen-float {
          animation: regenFloat 4.6s ease-in-out infinite;
        }

        .regen-pulse {
          animation: regenPulse 2.4s ease-in-out infinite;
        }

        .regen-presentation main {
          letter-spacing: -0.02em;
        }

        .regen-presentation .presentation-scale {
          transform: scale(1.018);
          transform-origin: top center;
        }

        @keyframes regenFadeUp {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.985);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes regenFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }

        @keyframes regenPulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(0, 178, 107, 0.28);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(0, 178, 107, 0);
          }
        }
      `}
    </style>
  );
}
