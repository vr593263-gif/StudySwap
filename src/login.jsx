function Login({
  onLogin,
  onShowSignup,
  onForgotPassword,
}) {
  const handleSubmit = async (event) => {
    event.preventDefault();

    const email = event.target.email.value.trim();
    const password = event.target.password.value;

    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Login failed");
        return;
      }

      onLogin(data.user);
    } catch (error) {
      console.error("Login error:", error);
      alert("Cannot connect to server");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">

        <div className="login-left">
          <div className="login-brand">
            Study<span>Swap</span>
          </div>

          <div className="login-illustration">📚</div>

          <h1>
            Learn together.
            <br />
            <span>Grow together.</span>
          </h1>

          <p>
            Share resources, discover notes and
            study smarter with your fellow students.
          </p>
        </div>

        <div className="login-right">
          <div className="login-box">

            <h2>Welcome back 👋</h2>

            <p className="login-subtitle">
              Login to continue to StudySwap
            </p>

            <form onSubmit={handleSubmit}>

              <label>Email</label>

              <input
                type="email"
                name="email"
                placeholder="Enter your email"
              />

              <label>Password</label>

              <input
                type="password"
                name="password"
                placeholder="Enter your password"
              />

              <div className="login-options">

                <label className="remember-me">
                  <input type="checkbox" />
                  Remember me
                </label>

                <button
                  type="button"
                  className="forgot-password"
                  onClick={onForgotPassword}
                >
                  Forgot password?
                </button>

              </div>

              <button
                type="submit"
                className="login-button"
              >
                Login
              </button>

            </form>

            <div className="login-divider">
              <span>or</span>
            </div>

            <button
              type="button"
              className="google-button"
              onClick={() =>
                alert("Google login will be added later!")
              }
            >
              <span>G</span>
              Continue with Google
            </button>

            <p className="signup-text">
              Don't have an account?{" "}

              <button
                type="button"
                onClick={onShowSignup}
              >
                Sign up
              </button>
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;