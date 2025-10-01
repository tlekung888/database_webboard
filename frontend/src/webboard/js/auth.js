let isLogin = true;

function getRegisterForm() {
  return `
    <h2>Register</h2>
    <form id="register-form">
      <input name="username" placeholder="Username" required />
      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Password" required minlength="6" />
      <button type="submit">Register</button>
      <p id="register-msg"></p>
    </form>
    <p onclick="switchForm()">Already have an account? <b>Login</b></p>
  `;
}

function getLoginForm() {
  return `
    <h2>Login</h2>
    <form id="login-form">
      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Password" required />
      <button type="submit">Login</button>
      <p id="login-msg"></p>
    </form>
    <p onclick="switchForm()">Don't have an account? <b>Register</b></p>
  `;
}

function addFormListeners() {
  const form = document.querySelector("form");
  const msgEl = document.querySelector('p[id$="-msg"]');

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(form));
    const endpoint = isLogin ? "login" : "register";

    try {
      const res = await fetch(`http://localhost:5000/api/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        msgEl.textContent = data.error || "Something went wrong";
        msgEl.className = "error";
      } else {
        if (isLogin) {
          msgEl.textContent = "Welcome back!";
          msgEl.className = "success";

          console.log('user from backend:', data.user);
          alert('user from backend: ' + JSON.stringify(data.user));
          localStorage.setItem("username", data.user.username);
          localStorage.setItem("email", data.user.email);
          localStorage.setItem("role", data.user.role);

          setTimeout(() => {
            if (data.user && data.user.username === "admin") {
              window.location.href = "admin.html";
            } else {
              window.location.href = "home.html";
            }
          }, 1500);
        } else {
          msgEl.textContent = data.message || "สมัครสมาชิกสำเร็จ!";
          msgEl.className = "success";

          // ✅ ไม่ต้อง redirect ทันที — อาจให้ user login เอง
          // หรือ redirect หลังจาก delay
          setTimeout(() => {
            isLogin = true;
            renderForm();
          }, 1500);
        }
      }
    } catch (err) {
      msgEl.textContent = "Server error";
      msgEl.className = "error";
    }
  });
}

function renderForm() {
  const formBox = document.getElementById("form-box");
  if (!formBox) return;

  formBox.innerHTML = isLogin ? getLoginForm() : getRegisterForm();
  addFormListeners();
}

function switchForm() {
  isLogin = !isLogin;
  renderForm();
}

document.addEventListener("DOMContentLoaded", renderForm);
