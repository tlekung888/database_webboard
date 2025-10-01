function goTo(page) {
  window.location.href = page + ".html";
}

function goToEdit(id) {
  window.location.href = `edit.html?id=${id}`;
}


const API_BASE = "http://localhost:5000";

const searchInput = document.getElementById("search");
const postsContainer = document.getElementById("posts");


// โหลดโพสต์ทั้งหมดตอนเริ่ม
window.addEventListener("DOMContentLoaded", loadPosts);

// ฟังก์ชันกรองโพสต์ตามหมวดหมู่
async function filterByCategory(category) {
  const postsContainer = document.getElementById("posts");
  postsContainer.innerHTML = "กำลังโหลดโพสต์...";
  try {
    const res = await fetch(`${API_BASE}/api/posts`);
    const posts = await res.json();
    const filtered = posts.filter(post =>
      (post.category || '').toLowerCase().trim() === category.toLowerCase().trim()
    );
    if (!filtered.length) {
      postsContainer.innerHTML = `<p>ไม่พบโพสต์ในหมวดหมู่: ${category}</p>`;
      return;
    }
    renderPosts(filtered);
  } catch (err) {
    postsContainer.innerHTML = `<p>เกิดข้อผิดพลาดในการโหลดโพสต์</p>`;
  }
}

// เพิ่ม event ให้ sidebar ทุกลิงก์หมวดหมู่
document.addEventListener("DOMContentLoaded", () => {
  // ...existing code...
  // เลือกทุกลิงก์ใน sidebar ที่เป็นหมวดหมู่หรือ sub-category
  document.querySelectorAll('.sidebar a').forEach(a => {
    a.addEventListener('click', function(e) {
      e.preventDefault();
      const category = this.textContent.trim();
      filterByCategory(category);
    });
  });
});

// ✅ ค้นหาเมื่อพิมพ์
searchInput.addEventListener("input", async () => {
  const keyword = searchInput.value.trim().toLowerCase();
  if (keyword === "") {
    loadPosts(); // โหลดใหม่ทั้งหมดถ้าค้นหาว่าง
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/posts`);
    const posts = await res.json();

    const filtered = posts.filter((post) => {
      return (
        post.content.toLowerCase().includes(keyword) ||
        post.username.toLowerCase().includes(keyword) ||
        post.category.toLowerCase().includes(keyword)
      );
    });

    renderPosts(filtered);
  } catch (err) {
    alert("ค้นหาโพสต์ล้มเหลว");
  }
});

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

    // ✅ ใช้ renderPosts แบบใหม่
    renderPosts(posts);
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
  // กดปุ่ม Like
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

  // ✅ กดปุ่มลบโพสต์
  if (e.target.classList.contains("delete-btn")) {
    const postDiv = e.target.closest(".post");
    const postId = postDiv.getAttribute("data-id");

    const confirmDelete = window.confirm(
      "คุณแน่ใจหรือไม่ว่าต้องการลบโพสต์นี้?"
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${API_BASE}/api/posts/${postId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาด");

      postDiv.remove(); // ลบออกจาก DOM
      alert("โพสต์ถูกลบเรียบร้อยแล้ว");
    } catch (err) {
      alert("ลบโพสต์ไม่สำเร็จ");
    }
  }
});

function renderPosts(posts) {
  postsContainer.innerHTML = "";

  posts.forEach((post) => {
    const div = document.createElement("div");
    div.className = "post";
    div.setAttribute("data-id", post._id);
    const isOwner = post.username === localStorage.getItem("username");

    let html = `
      <h3>โพสต์โดย : ${post.username}</h3>
      ${
        isOwner
          ? `
        <button onclick="goToEdit('${post._id}')">✏️ แก้ไข</button>
        <button class="delete-btn">🗑️ ลบ</button>
      `
          : ""
      }
      <p>${post.content}</p>
      <p><b>หมวดหมู่:</b> ${post.category}</p>
      ${
        post.image
          ? `<img src="${API_BASE}/uploads/${post.image}" style="max-width:700px; margin-left:440px;"/>`
          : ""
      }
      <br>
      <button class="like-btn">Like (<span class="like-count">${
        post.likes || 0
      }</span>)</button>
      <button class="toggle-comments-btn">💬 Comment</button>

      <!-- กล่องคอมเมนต์ (ซ่อนเริ่มต้น) -->
      <div class="comments-section" style="display: none;">
        <div class="comments" id="comments-${post._id}">
          ${(post.comments || [])
            .map(
              (c) => `
            <div class="comment" data-id="${c._id}">
              <p><b>${c.username}</b>: ${c.content}</p>
              ${
                c.username === localStorage.getItem("username") ||
                localStorage.getItem("role") === "admin"
                  ? `<button class="edit-comment-btn">แก้ไข</button>
                     <button class="delete-comment-btn">ลบ</button>`
                  : ""
              }
            </div>
          `
            )
            .join("")}
        </div>

        <form class="add-comment-form" data-postid="${post._id}">
          <input type="text" name="comment" placeholder="เขียนความคิดเห็น..." required />
          <button type="submit">ส่ง</button>
        </form>
      </div>
      <hr/>
    `;

    div.innerHTML = html;
    postsContainer.appendChild(div);
  });
}

document.addEventListener("submit", async (e) => {
  if (e.target.classList.contains("add-comment-form")) {
    e.preventDefault();
    const postId = e.target.getAttribute("data-postid");
    const input = e.target.querySelector("input[name='comment']");
    const content = input.value.trim();
    const username = localStorage.getItem("username");
    const role = localStorage.getItem("role");

    if (!username) {
      alert("กรุณาเข้าสู่ระบบ");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, username }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      loadPosts(); // รีโหลดโพสต์ (หรือเฉพาะคอมเมนต์ก็ได้)
    } catch (err) {
      alert("เพิ่มคอมเมนต์ล้มเหลว");
    }
    console.log(role);

  }
});

document.addEventListener("click", async (e) => {
  // แก้ไข comment
  if (e.target.classList.contains("edit-comment-btn")) {
    const commentDiv = e.target.closest(".comment");
    const commentId = commentDiv.getAttribute("data-id");
    const postDiv = e.target.closest(".post");
    const postId = postDiv.getAttribute("data-id");

    const newContent = prompt(
      "แก้ไขคอมเมนต์:",
      commentDiv.querySelector("p").innerText.split(": ")[1]
    );
    if (!newContent) return;

    try {
      const res = await fetch(
        `${API_BASE}/api/posts/${postId}/comments/${commentId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: newContent,
            username: localStorage.getItem("username"),
            role: localStorage.getItem("role"),
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      loadPosts();
    } catch (err) {
      alert("แก้ไขคอมเมนต์ไม่สำเร็จ");
    }
  }

  // ลบ comment
  if (e.target.classList.contains("delete-comment-btn")) {
    const commentDiv = e.target.closest(".comment");
    const commentId = commentDiv.getAttribute("data-id");
    const postDiv = e.target.closest(".post");
    const postId = postDiv.getAttribute("data-id");

    // if (!confirm("ลบคอมเมนต์ใช่หรือไม่?")) return;

    try {
      const res = await fetch(
        `${API_BASE}/api/posts/${postId}/comments/${commentId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: localStorage.getItem("username"),
            role: localStorage.getItem("role"),
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      loadPosts();
    } catch (err) {
      alert("ลบคอมเมนต์ไม่สำเร็จ");
    }
  }

  // toggle comment section
  if (e.target.classList.contains("toggle-comments-btn")) {
    const postDiv = e.target.closest(".post");
    const commentsSection = postDiv.querySelector(".comments-section");
    if (commentsSection) {
      commentsSection.style.display =
        commentsSection.style.display === "none" ? "block" : "none";
    }
  }
});
