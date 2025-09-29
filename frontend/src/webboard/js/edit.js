function goTo(page){
    window.location.href = page + ".html";
}

const API_BASE = "http://localhost:5000";

// ดึง query param id จาก URL
const params = new URLSearchParams(window.location.search);
const postId = params.get("id");

// โหลดโพสต์เดิมมาใส่ในฟอร์ม
async function loadPost() {
  try {
    const res = await fetch(`${API_BASE}/api/posts/${postId}`);
    const post = await res.json();
    if (!res.ok) throw new Error(post.error);

    document.getElementById("content").value = post.content;
    document.getElementById("category").value = post.category;
  } catch (err) {
    alert("โหลดโพสต์ไม่สำเร็จ");
  }
}

document.getElementById("edit-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const content = document.getElementById("content").value;
  const category = document.getElementById("category").value;

  try {
    const res = await fetch(`${API_BASE}/api/posts/${postId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, category }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    alert("แก้ไขโพสต์สำเร็จ");
    window.location.href = "home.html";
  } catch (err) {
    alert("แก้ไขโพสต์ไม่สำเร็จ");
  }
});

loadPost();
