const formBox = document.getElementById('form-box');
let isLogin = true;

function renderForm() {
  formBox.innerHTML = isLogin ? getLoginForm() : getRegisterForm();
  addFormListeners();
}

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
    <p class="toggle-text" onclick="switchForm()">Already have an account? <b>Login</b></p>
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
    <p class="toggle-text" onclick="switchForm()">Don't have an account? <b>Register</b></p>
  `;
}

// eslint-disable-next-line no-unused-vars
function switchForm() {
  isLogin = !isLogin;
  renderForm();
}

function addFormListeners() {
  const form = document.querySelector('form');
  const msgEl = document.querySelector('p[id$="-msg"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msgEl.textContent = '';
    msgEl.className = '';

    const formData = Object.fromEntries(new FormData(form));
    const endpoint = isLogin ? 'login' : 'register';

    try {
      const res = await fetch(`http://localhost:5000/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        msgEl.textContent = data.error || `${isLogin ? 'Login' : 'Register'} failed`;
        msgEl.className = 'error';
      } else {
        msgEl.textContent = isLogin ? 'Welcome back!' : `Welcome, ${data.user.username}!`;
        msgEl.className = 'success';

        if (isLogin) {
          setTimeout(() => {
            // redirect or go to another page
            window.location.href = "home.html"; // <-- เปลี่ยนตามหน้าเว็บคุณ
          }, 1500);
        }
      }
    } catch (err) {
      msgEl.textContent = 'Server error';
      msgEl.className = 'error';
    }
  });
}

// Start with login form
renderForm();
