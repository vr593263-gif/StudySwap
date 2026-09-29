import { useState } from "react";

function ForgotPassword({ onBackToLogin }) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] =
    useState("");

  const handleSendOTP = async (event) => {
    event.preventDefault();

    if (!email.trim()) {
      setMessage("Please enter your email address");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
          }),
        }
      );

      const text = await response.text();

let data;

try {
  data = JSON.parse(text);
} catch {
  data = {
    message: text || "Server returned an invalid response",
  };
}

      if (!response.ok) {
        setMessage(data.message || "Failed to send OTP");
        setMessageType("error");
        return;
      }

      setOtpSent(true);

      setMessage(
        "OTP sent successfully. Check your Gmail."
      );

      setMessageType("success");
    } catch (error) {
      console.error(error);

      setMessage("Cannot connect to server");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (event) => {
    event.preventDefault();

    if (otp.length !== 6) {
      setMessage("Please enter the 6-digit OTP");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/verify-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            otp: otp.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Wrong OTP. Please try again."
        );

        setMessageType("error");
        return;
      }

      setOtpVerified(true);

      setMessage(
        "OTP verified successfully! ✓"
      );

      setMessageType("success");
    } catch (error) {
      console.error(error);

      setMessage("Cannot connect to server");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();

    if (newPassword.length < 6) {
      setMessage(
        "Password must be at least 6 characters"
      );

      setMessageType("error");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");

      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            otp: otp.trim(),
            newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Password reset failed"
        );

        setMessageType("error");
        return;
      }

      alert(
        "Password reset successfully! 🎉"
      );

      onBackToLogin();
    } catch (error) {
      console.error(error);

      setMessage("Cannot connect to server");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">

        {/* LEFT SIDE */}

        <div className="login-left">

          <div className="login-brand">
            Study<span>Swap</span>
          </div>

          <div className="login-illustration">
            {otpVerified ? "🔑" : "🔐"}
          </div>

          <h1>
            {otpVerified ? (
              <>
                Create your
                <br />
                <span>new password.</span>
              </>
            ) : otpSent ? (
              <>
                Verify your
                <br />
                <span>OTP.</span>
              </>
            ) : (
              <>
                Forgot your
                <br />
                <span>password?</span>
              </>
            )}
          </h1>

          <p>
            {otpVerified
              ? "Your email has been verified. Choose a strong new password."
              : otpSent
              ? "Enter the 6-digit code we sent to your registered email."
              : "Enter your registered email and we'll send you a verification code."}
          </p>

        </div>

        {/* RIGHT SIDE */}

        <div className="login-right">

          <div className="login-box">

            {/* STEP 1 — EMAIL */}

            {!otpSent && (
              <>
                <h2>Reset Password 🔐</h2>

                <p className="login-subtitle">
                  Enter your registered email
                </p>

                <form onSubmit={handleSendOTP}>

                  <label>Email</label>

                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                  />

                  <button
  type="submit"
  className="login-button"
>
  {loading ? "Sending OTP..." : "Send OTP"}
</button>

                </form>
              </>
            )}

            {/* STEP 2 — OTP */}

            {otpSent && !otpVerified && (
              <>
                <h2>Enter OTP 🔑</h2>

                <p className="login-subtitle">
                  Code sent to{" "}
                  <strong>{email}</strong>
                </p>

                <form onSubmit={handleVerifyOTP}>

                  <label>6-Digit OTP</label>

                  <input
                    className="otp-input"
                    type="text"
                    inputMode="numeric"
                    maxLength="6"
                    placeholder="000000"
                    value={otp}
                    onChange={(event) => {
                      const value =
                        event.target.value.replace(
                          /\D/g,
                          ""
                        );

                      setOtp(value);

                      if (messageType === "error") {
                        setMessage("");
                      }
                    }}
                  />

                  {message && (
                    <p
                      className={`form-message ${messageType}`}
                    >
                      {messageType === "error"
                        ? "❌ "
                        : "✓ "}
                      {message}
                    </p>
                  )}

                 <button
  type="submit"
  className="login-button"
>
  {loading ? "Verifying..." : "Verify OTP"}
</button>

                </form>
              </>
            )}

            {/* STEP 3 — NEW PASSWORD */}

            {otpVerified && (
              <>
                <h2>New Password 🔐</h2>

                <p className="login-subtitle">
                  Create a new password for your account
                </p>

                <form onSubmit={handleResetPassword}>

                  <label>New Password</label>

                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(event) =>
                      setNewPassword(
                        event.target.value
                      )
                    }
                  />

                  <label>
                    Confirm New Password
                  </label>

                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value
                      )
                    }
                  />

                  {message && (
                    <p
                      className={`form-message ${messageType}`}
                    >
                      {messageType === "error"
                        ? "❌ "
                        : "✓ "}
                      {message}
                    </p>
                  )}

                  <button
  type="submit"
  className="login-button"
>
  {loading
    ? "Resetting Password..."
    : "Reset Password"}
</button>

                </form>
              </>
            )}

            <p className="signup-text">
              Remember your password?{" "}

              <button
  type="button"
  className="back-login-button"
  onClick={() => {
    onBackToLogin();
  }}
>
  Back to Login
</button>
            </p>

          </div>

        </div>

      </div>
    </div>
  );
}

export default ForgotPassword;