function goTo(page){
    window.location.href = page + ".html";
}

const API_BASE = "http://localhost:5000";

async function loadPosts() {
  const postsContainer = document.getElementById("posts");
  if (!postsContainer) return;

  postsContainer.innerHTML = "กำลังโหลดโพสต์...";
  try {
    const res = await fetch(`${API_BASE}/api/posts`);
    const posts = await res.json();

    if (!res.ok || !Array.isArray(posts)) {
      postsContainer.innerHTML = "<p>โหลดโพสต์ไม่สำเร็จ</p>";
      return;
    }

    if (!posts.length) {
      postsContainer.innerHTML = "<p>ยังไม่มีโพสต์ใดๆ</p>";
      return;
    }

    postsContainer.innerHTML = "";
    posts.forEach((post) => {
      const div = document.createElement("div");
      const isOwner = post.username === localStorage.getItem("username");
      div.className = "post";
      div.setAttribute("data-id", post._id);
    
      div.innerHTML = `
        <h3>โพสต์โดย :  ${post.username}</h3>
        ${isOwner ? `
    <button class="edit-btn" onclick = "goTo('edit')">✏️ แก้ไข</button>
    <button class="delete-btn">🗑️ ลบ</button>
  ` : ""}
        <p>${post.content}</p>
        <p><b>หมวดหมู่:</b> ${post.category}</p>
        ${post.image ? `<img src="${API_BASE}/uploads/${post.image}" style="max-width:200px"/>` : ""}
        <br><button class="like-btn">Like (<span class="like-count">${post.likes || 0}</span>)</button>
        <hr/>
      `;
      postsContainer.appendChild(div);
    });
  } catch (err) {
    postsContainer.innerHTML = "<p>เกิดข้อผิดพลาดในการโหลดโพสต์</p>";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadPosts();

  const userArea = document.getElementById("user-area");
  const username = localStorage.getItem("username");
  if (userArea) {
    userArea.textContent = username ? `👤 ${username}` : "Guest";
  }
});

document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("like-btn")) {
    const postDiv = e.target.closest(".post");
    const postId = postDiv.getAttribute("data-id");
    const username = localStorage.getItem("username") || "ไม่ระบุชื่อ";

    try {
      const res = await fetch(`${API_BASE}/api/posts/${postId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);
      postDiv.querySelector(".like-count").textContent = data.likes;
    } catch (err) {
      alert("กดไลค์ไม่สำเร็จ");
    }
  }
});
