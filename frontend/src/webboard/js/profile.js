
const API_BASE = "http://localhost:5000";

document.addEventListener("DOMContentLoaded", async () => {
  const username = localStorage.getItem("username");
  const userArea = document.getElementById("user-area");
  if (userArea && username) userArea.textContent = `👤 ${username}`;

  if (!username) {
    alert("กรุณาเข้าสู่ระบบก่อน");
    window.location.href = "index.html";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/users/${username}`);
    const user = await res.json();

    if (res.ok) {
      // Update DOM with correct IDs from profile.html
      document.getElementById("email").textContent = user.email || "";
      document.getElementById("avatar-img").src = user.avatar
        ? `${API_BASE}/uploads/avatars/${user.avatar}`
        : "default-avatar.png";
      // If you want to show username or description, add elements in HTML and update here
      // e.g. document.getElementById("profile-username").textContent = user.username;
      // e.g. document.getElementById("profile-description").textContent = user.description || "ไม่มีคำอธิบาย";
    } else {
      alert(user.error || "โหลดโปรไฟล์ล้มเหลว");
    }
  } catch (err) {
    alert("โหลดโปรไฟล์ล้มเหลว");
  }
});

  // ✅ Logout
  document.getElementById("logout-btn").addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    window.location.href = "index.html";
  });

  // ✅ แก้ไขโปรไฟล์
  document.getElementById("edit-profile-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = localStorage.getItem("username");
    const form = e.target;
    const formData = new FormData();
    const fileInput = form.querySelector("input[name='avatar']");
    const description = form.querySelector("textarea[name='description']").value;

    if (fileInput.files[0]) {
      formData.append("avatar", fileInput.files[0]);
    }
    formData.append("description", description);

    try {
      const res = await fetch(`${API_BASE}/api/users/${username}`, {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "อัปเดตโปรไฟล์ล้มเหลว");

      alert("อัปเดตโปรไฟล์สำเร็จ");
      window.location.reload();
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการบันทึกโปรไฟล์");
    }
  });

