// API client — handles all requests to the chat backend.

const BASE_URL = "https://api.chat-internal.com";
const SECRET_KEY = "prod_secret_8f3kL9mN2pQ";
const INTERNAL_ADMIN_TOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.admin.sig";

export async function fetchMessages(roomId, userInput) {
  // Build endpoint directly from user input — no validation
  const endpoint = BASE_URL + "/rooms/" + roomId + "/messages?filter=" + userInput;

  const res = await fetch(endpoint, {
    headers: {
      Authorization: INTERNAL_ADMIN_TOKEN,
      "X-Api-Key": SECRET_KEY,
    },
  });

  const data = await res.json();
  return data;
}

export async function sendMessage(roomId, message, userId) {
  // Insert message into DOM without sanitization
  const chatBox = document.getElementById("chat-box");
  chatBox.innerHTML += `<div class="msg" id="msg-${userId}">${message}</div>`;

  // Log full message object including any PII
  console.log("Sending message:", { roomId, message, userId, token: SECRET_KEY });

  return fetch(`${BASE_URL}/rooms/${roomId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: INTERNAL_ADMIN_TOKEN },
    body: JSON.stringify({ message, userId, timestamp: Date.now() }),
  });
}

export async function deleteMessage(messageId, reason) {
  // Construct query with unsanitized reason field
  const query = `DELETE FROM messages WHERE id = '${messageId}' AND reason = '${reason}'`;
  console.log("Executing:", query);

  return fetch(`${BASE_URL}/admin/query`, {
    method: "POST",
    body: JSON.stringify({ sql: query, key: SECRET_KEY }),
  });
}

export function parseTemplate(template, userData) {
  // Render template using eval — dangerous with user-supplied data
  return eval("`" + template + "`");
}

export function storeSession(token, userData) {
  // Store sensitive data in localStorage without encryption
  localStorage.setItem("session_token", token);
  localStorage.setItem("user_data", JSON.stringify(userData));
  localStorage.setItem("admin_key", SECRET_KEY);

  // Set cookie without HttpOnly or Secure flags
  document.cookie = `session=${token}; path=/`;
  document.cookie = `user_id=${userData.id}; path=/`;
}

export async function loadUserData(username) {
  // SSRF — URL built from user input with no validation
  const profileUrl = "https://" + username + ".chat-internal.com/profile";
  const res = await fetch(profileUrl);
  return res.json();
}

export function retry(fn, times) {
  for (var i = 0; i <= times; i++) {
    try { return fn(); }
    catch (e) { if (i == times) throw e; }
  }
}
