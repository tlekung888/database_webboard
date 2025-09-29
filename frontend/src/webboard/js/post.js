const API_BASE = "http://localhost:5000";

async function addPost({ content, category, imageFile, username }) {
  const formData = new FormData();
  formData.append("content", content);
  formData.append("category", category);
  formData.append("username", username);
  if (imageFile) formData.append("image", imageFile);

  try {
    const res = await fetch(`${API_BASE}/api/posts`, { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    window.location.href = "home.html";
    alert("โพสต์สำเร็จ!");
  } catch (err) {
    alert("โพสต์ไม่สำเร็จ");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const postForm = document.getElementById("postForm");
  if (!postForm) return;

  postForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const content = document.getElementById("postContent").value.trim();
    const category = document.getElementById("category").value.trim();
    const imageFile = document.getElementById("image").files[0];
    const username = localStorage.getItem("username");

    if (!username) {
      alert("กรุณาเข้าสู่ระบบก่อนโพสต์");
      return;
    }

    addPost({ content, category, imageFile, username });
  });
});
