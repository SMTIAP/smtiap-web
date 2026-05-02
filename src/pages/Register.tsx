import { useState } from "react";
import axios from "axios";
import { GoogleIcon, GithubIcon, LinkedInIcon } from "./AuthPage";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      const res = await axios.post(
        "http://localhost:5000/api/users/register",
        {
          email,
          password
        }
      );

      setMessage("Account created successfully ✔");
      console.log(res.data);
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
  window.location.href = "http://localhost:5000/api/users/google";
};

const handleGithubLogin = () => {
  window.location.href = "http://localhost:5000/api/users/github";
};

const handleLinkedInLogin = () => {
  window.location.href = "http://localhost:5000/api/users/linkedin";
};

  return (
    <>
      <style>{`
        .registration-container {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .registration-container h1 {
          font-size: 26px;
          font-weight: 900;
          color: #1a1a2e;
          margin-bottom: 18px;
          letter-spacing: -0.5px;
        }
        .social-row {
          display: flex;
          gap: 10px;
          margin-bottom: 16px;
        }
        .social-btn {
          width: 42px;
          height: 42px;
          border: 1.5px solid #e0e0e8;
          border-radius: 10px;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
        }
        .social-btn:hover {
          border-color: #7b6ee0;
          box-shadow: 0 2px 10px rgba(123,110,224,0.2);
          transform: translateY(-2px);
        }
        .divider {
          font-size: 12px;
          color: #aaa;
          font-weight: 600;
          margin-bottom: 16px;
          letter-spacing: 0.3px;
        }
        .input-field {
          width: 100%;
          padding: 11px 16px;
          border: none;
          border-radius: 10px;
          background: #f0f1f7;
          font-family: 'Nunito', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #333;
          outline: none;
          margin-bottom: 12px;
          transition: box-shadow 0.2s, background 0.2s;
        }
        .input-field::placeholder { color: #aaa; font-weight: 500; }
        .input-field:focus {
          background: #ebebf8;
          box-shadow: 0 0 0 2.5px rgba(123,110,224,0.35);
        }
        .submit-btn {
          width: 100%;
          padding: 13px;
          background: linear-gradient(135deg, #7b6ee0, #5a45b8);
          color: #fff;
          border: none;
          border-radius: 100px;
          font-family: 'Nunito', sans-serif;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          cursor: pointer;
          transition: box-shadow 0.2s, transform 0.15s;
          box-shadow: 0 4px 18px rgba(90,69,184,0.35);
          margin-top: 4px;
        }
        .submit-btn:hover {
          box-shadow: 0 6px 22px rgba(90,69,184,0.5);
          transform: translateY(-1px);
        }
        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .submit-btn:active { transform: translateY(0); }

        .msg {
          margin-top: 10px;
          font-size: 12px;
          font-weight: 600;
        }
      `}</style>

      <div className="registration-container">
        <h1>Sign Up</h1>

        <div className="social-row">
          <div className="social-row">
  <button className="social-btn" onClick={handleGoogleLogin}>
    <GoogleIcon />
  </button>

  <button className="social-btn" onClick={handleGithubLogin}>
    <GithubIcon />
  </button>

  <button className="social-btn" onClick={handleLinkedInLogin}>
    <LinkedInIcon />
  </button>
</div>
        </div>

        <p className="divider">or use your email for registration</p>

        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          
          {/* username added (important for backend) */}

          <input
            className="input-field"
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <input
            className="input-field"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>
        </form>

        {message && <div className="msg">{message}</div>}
      </div>
    </>
  );
}