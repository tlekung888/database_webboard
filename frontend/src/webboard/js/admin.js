// admin.js
if (typeof API_BASE === 'undefined') {
  var API_BASE = "http://localhost:5000";
}

// --- Users ---
async function loadUsers() {
  const res = await fetch(`${API_BASE}/api/users/all`);
  const users = await res.json();
  const tbody = document.querySelector("#users-table tbody");
  tbody.innerHTML = "";
  users.forEach(user => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${user.username}</td>
      <td>${user.email}</td>
      <td>
        <select data-username="${user.username}" class="role-select">
          <option value="user" ${user.role === 'user' ? 'selected' : ''}>user</option>
          <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>admin</option>
        </select>
      </td>
      <td><input value="${user.description || ''}" data-username="${user.username}" class="desc-input" /></td>
      <td>${user.avatar ? `<img src='${API_BASE}/uploads/avatars/${user.avatar}' width='40'/>` : '-'}</td>
      <td>
        <button onclick="updateUser('${user.username}')">Save</button>
        <button onclick="deleteUser('${user.username}')">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function updateUser(username) {
  const role = document.querySelector(`select[data-username='${username}']`).value;
  const description = document.querySelector(`input[data-username='${username}']`).value;
  await fetch(`${API_BASE}/api/users/${username}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role, description })
  });
  alert("User updated");
  loadUsers();
}

async function deleteUser(username) {
  if (!confirm("Delete user?")) return;
  await fetch(`${API_BASE}/api/users/${username}`, { method: "DELETE" });
  alert("User deleted");
  loadUsers();
}

// --- Posts ---
async function loadPosts() {
  const res = await fetch(`${API_BASE}/api/posts`);
  const posts = await res.json();
  const tbody = document.querySelector("#posts-table tbody");
  tbody.innerHTML = "";
  posts.forEach(post => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${post._id || post.id}</td>
      <td>${post.username}</td>
      <td><input value="${post.content}" data-id="${post._id || post.id}" class="post-content-input" /></td>
      <td><input value="${post.category}" data-id="${post._id || post.id}" class="post-category-input" /></td>
      <td>${post.image ? `<img src='${API_BASE}/uploads/${post.image}' width='40'/>` : '-'}</td>
      <td>
        <button onclick="updatePost('${post._id || post.id}')">Save</button>
        <button onclick="deletePost('${post._id || post.id}')">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function updatePost(id) {
  const content = document.querySelector(`input.post-content-input[data-id='${id}']`).value;
  const category = document.querySelector(`input.post-category-input[data-id='${id}']`).value;
  await fetch(`${API_BASE}/api/posts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, category, role: "admin", username: "admin" })
  });
  alert("Post updated");
  loadPosts();
}

async function deletePost(id) {
  if (!confirm("Delete post?")) return;
  await fetch(`${API_BASE}/api/posts/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role: "admin", username: "admin" })
  });
  alert("Post deleted");
  loadPosts();
}

// --- Comments ---
async function loadComments() {
  const res = await fetch(`${API_BASE}/api/posts`);
  const posts = await res.json();
  const tbody = document.querySelector("#comments-table tbody");
  tbody.innerHTML = "";
  posts.forEach(post => {
    (post.comments || []).forEach(comment => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${post._id || post.id}</td>
        <td>${comment._id || comment.id}</td>
        <td>${comment.username}</td>
        <td><input value="${comment.content}" data-postid="${post._id || post.id}" data-commentid="${comment._id || comment.id}" class="comment-content-input" /></td>
        <td>
          <button onclick="updateComment('${post._id || post.id}','${comment._id || comment.id}')">Save</button>
          <button onclick="deleteComment('${post._id || post.id}','${comment._id || comment.id}')">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  });
}

async function updateComment(postId, commentId) {
  const content = document.querySelector(`input.comment-content-input[data-postid='${postId}'][data-commentid='${commentId}']`).value;
  await fetch(`${API_BASE}/api/posts/${postId}/comments/${commentId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, role: "admin", username: "admin" })
  });
  alert("Comment updated");
  loadComments();
}

async function deleteComment(postId, commentId) {
  if (!confirm("Delete comment?")) return;
  await fetch(`${API_BASE}/api/posts/${postId}/comments/${commentId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role: "admin", username: "admin" })
  });
  alert("Comment deleted");
  loadComments();
}

window.onload = function() {
  loadUsers();
  loadPosts();
  loadComments();
};
