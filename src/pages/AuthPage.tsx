// AuthPage.tsx
import { useState } from "react";
import Login from "./Login";
import Registration from "./Register";

type Mode = "signin" | "signup";

// Social Icons (shared between components)
export const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export const GithubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
  </svg>
);

export const LinkedInIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [animating, setAnimating] = useState(false);

  const switchMode = (newMode: Mode) => {
    if (newMode === mode || animating) return;
    setAnimating(true);
    setTimeout(() => {
      setMode(newMode);
      setAnimating(false);
    }, 400);
  };

  const isSignIn = mode === "signin";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Nunito', sans-serif;
          background: #e8ecf5;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
        }

        .auth-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          width: 100%;
          background: linear-gradient(135deg, #dce3f5 0%, #e8ecf5 50%, #d8dff2 100%);
          font-family: 'Nunito', sans-serif;
        }

        .auth-card {
          position: relative;
          width: 820px;
          height: 500px;
          background: #fff;
          border-radius: 50px;
          box-shadow: 0 20px 60px rgba(90, 70, 180, 0.18), 0 4px 20px rgba(0,0,0,0.08);
          overflow: hidden;
          display: flex;
        }

        .panel {
          position: absolute;
          top: 0;
          width: 50%;
          height: 100%;
          background: linear-gradient(160deg, #7b6ee0 0%, #5a45b8 100%);
          border-radius: 50px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 50px 36px;
          text-align: center;
          z-index: 10;
          transition: left 0.55s cubic-bezier(0.77, 0, 0.18, 1);
        }

        .panel.sign-in-active { left: 50%; }
        .panel.sign-up-active { left: 0%; }

        .panel h2 {
          color: #fff;
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 14px;
          letter-spacing: -0.3px;
        }

        .panel p {
          color: rgba(255,255,255,0.82);
          font-size: 14px;
          font-weight: 500;
          line-height: 1.6;
          margin-bottom: 32px;
        }

        .panel-btn {
          border: 2px solid #fff;
          background: transparent;
          color: #fff;
          padding: 10px 36px;
          border-radius: 100px;
          font-family: 'Nunito', sans-serif;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.2s;
        }

        .panel-btn:hover {
          background: rgba(255,255,255,0.15);
        }

        .form-pane {
          position: absolute;
          top: 0;
          width: 50%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 36px 40px;
          transition: left 0.55s cubic-bezier(0.77, 0, 0.18, 1), opacity 0.35s ease;
        }

        .form-pane.signin-pane {
          left: 0%;
        }

        .form-pane.signup-pane {
          left: 50%;
        }

        .form-pane.signin-pane.sign-up-active {
          left: 0%;
          opacity: 0;
          pointer-events: none;
        }

        .form-pane.signup-pane.sign-in-active {
          left: 50%;
          opacity: 0;
          pointer-events: none;
        }

        @media (max-width: 680px) {
          .auth-card { width: 95vw; height: auto; flex-direction: column; }
          .panel, .form-pane { position: static; width: 100%; }
          .panel { border-radius: 20px 20px 0 0; padding: 30px 24px; }
          .form-pane { padding: 28px 24px; }
          .panel.sign-in-active, .panel.sign-up-active { left: unset; }
        }
      `}</style>

      <div className="auth-wrapper">
        <div className="auth-card">
          <div className={`form-pane signin-pane ${isSignIn ? "" : "sign-up-active"}`}>
            <Login />
          </div>

          <div className={`form-pane signup-pane ${isSignIn ? "sign-in-active" : ""}`}>
            <Registration />
          </div>

          <div className={`panel ${isSignIn ? "sign-in-active" : "sign-up-active"}`}>
            {isSignIn ? (
              <>
                <h2>Hello, Friend!</h2>
                <p>Register with your personal details to use all of site features</p>
                <button className="panel-btn" onClick={() => switchMode("signup")}>Sign Up</button>
              </>
            ) : (
              <>
                <h2>Welcome Back!</h2>
                <p>Enter your personal details to use all of site features</p>
                <button className="panel-btn" onClick={() => switchMode("signin")}>Sign In</button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}