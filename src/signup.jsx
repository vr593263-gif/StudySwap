function Signup({ onSignup, onShowLogin }) {
  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = event.target.name.value.trim();
    const email = event.target.email.value.trim();
    const password = event.target.password.value;
    const confirmPassword =
      event.target.confirmPassword.value;

    if (!name || !email || !password || !confirmPassword) {
      alert("Please fill all details");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Signup failed");
        return;
      }

      alert("Account created successfully! 🎉");

      onSignup(data.user);
    } catch (error) {
      console.error("Signup error:", error);
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

          <div className="login-illustration">🎓</div>

          <h1>
            Start your
            <br />
            <span>StudySwap journey.</span>
          </h1>

          <p>
            Create your account and start sharing
            knowledge with fellow students.
          </p>
        </div>

        <div className="login-right">
          <div className="login-box">

            <h2>Create account 🚀</h2>

            <p className="login-subtitle">
              Join StudySwap and study smarter together
            </p>

            <form onSubmit={handleSubmit}>

              <label>Full Name</label>

              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
              />

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
                placeholder="Create a password"
              />

              <label>Confirm Password</label>

              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
              />

              <button
                type="submit"
                className="login-button"
              >
                Create Account
              </button>

            </form>

            <p className="signup-text">
              Already have an account?{" "}

              <button
                type="button"
                onClick={onShowLogin}
              >
                Login
              </button>
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Signup;