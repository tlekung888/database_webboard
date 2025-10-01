function goToEdit(id) {
  window.location.href = `edit.html?id=${id}`;
}



const API_BASE = "http://localhost:5000";



// ✅ ดึง ID จาก query param
// const params = new URLSearchParams(window.location.search);
const postId = new URLSearchParams(window.location.search).get("id");
// ถ้า URL มี ?id=xxx --> postId จะไม่เป็น null แล้ว

// const postId = params.get("id");

// ✅ ตรวจสอบว่าได้ id จริงไหม (log ดูได้)
console.log("Post ID:", postId);

// โหลดโพสต์เดิมมาใส่ในฟอร์ม
async function loadPost() {
  if (!postId) {
    alert("ไม่พบโพสต์");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/posts/${postId}`);
    const post = await res.json();

    if (!res.ok) throw new Error(post.error);

    // ✅ ใส่ข้อมูลเดิมลงใน form
    document.getElementById("content").value = post.content;
    document.getElementById("category").value = post.category;
  } catch (err) {
    console.error("Load post error:", err);
    alert("โหลดโพสต์ไม่สำเร็จ");
  }
}

// ✅ รอ DOM โหลดก่อนค่อยผูก event
window.addEventListener("DOMContentLoaded", () => {
  loadPost();

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
});
