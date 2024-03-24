// Define message types
const messageTypes = { LEFT: "left", RIGHT: "right", LOGIN: "login" };

// Chat stuff
const chatWindow = document.getElementById("chat");
const messagesList = document.getElementById("messagesList");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const logoutBtn = document.getElementById("logoutBtn"); // Added logout button

// Login stuff
let username = "";
const usernameInput = document.getElementById("usernameInput");
const passwordInput = document.getElementById("passwordInput"); // Add password input field
const loginBtn = document.getElementById("loginBtn");
const loginWindow = document.getElementById("login");

const messages = []; // { author, date, content, type }

// Connect to socket.io - automatically tries to connect on the same port app was served from
var socket = io();

socket.on("message", (message) => {
  // Update type of message based on username
  if (message.type !== messageTypes.LOGIN) {
    if (message.author === username) {
      message.type = messageTypes.RIGHT;
    } else {
      message.type = messageTypes.LEFT;
    }
  }

  messages.push(message);
  displayMessages();

  // Scroll to the bottom
  chatWindow.scrollTop = chatWindow.scrollHeight;
});

createMessageHTML = (message) => {
  if (message.type === messageTypes.LOGIN) {
    return `
      <p class="secondary-text text-center mb-2">${message.author} joined the chat...</p>
    `;
  }
  return `
    <div class="message ${
      message.type === messageTypes.LEFT ? "message-left" : "message-right"
    }">
      <div class="message-details flex">
        <p class="flex-grow-1 message-author">${
          message.type === messageTypes.LEFT ? message.author : ""
        }</p>
        <p class="message-date">${message.date}</p>
      </div>
      <p class="message-content">${message.content}</p>
    </div>
  `;
};

displayMessages = () => {
  const messagesHTML = messages
    .map((message) => createMessageHTML(message))
    .join("");
  messagesList.innerHTML = messagesHTML;
};

sendBtn.addEventListener("click", (e) => {
  e.preventDefault();
  if (!messageInput.value) {
    return console.log("Invalid input");
  }

  const date = new Date();
  const month = ("0" + date.getMonth()).slice(0, 2);
  const day = date.getDate();
  const year = date.getFullYear();
  const dateString = `${month}/${day}/${year}`;

  const message = {
    author: username,
    date: dateString,
    content: messageInput.value,
  };
  sendMessage(message);
  // Clear input
  messageInput.value = "";
});

loginBtn.addEventListener("click", (e) => {
  e.preventDefault();
  if (!usernameInput.value || !passwordInput.value) {
    // Check if both username and password are provided
    alert("Please enter both username and password");
    return;
  }

  // Check if username and password match the ones in the JSON file
  fetch("users.json")
    .then((response) => response.json())
    .then((data) => {
      const users = data.users; // Access the users array within the data object
      // Continue with your logic to find the user
      const user = users.find(
        (user) =>
          user.username === usernameInput.value &&
          user.password === passwordInput.value
      );
      if (user) {
        // Login successful, proceed with chat
        username = usernameInput.value;
        sendMessage({ author: username, type: messageTypes.LOGIN });
        // Show chat window and hide login
        loginWindow.classList.add("hidden");
        chatWindow.classList.remove("hidden");
        // Redirect to chat route
        // Alert successful login
        setTimeout(() => {
          alert("Login successful!");
        }, 1000);
      } else {
        // Invalid username or password
        alert("Invalid username or password");
      }
    })
    .catch((error) => console.error("Error loading users:", error));
});

logoutBtn.addEventListener("click", logout); // Added event listener for logout button

sendMessage = (message) => {
  socket.emit("message", message);
};

// Logout function
function logout() {
  // Clear username
  username = "";
  // Show login window and hide chat window
  loginWindow.classList.remove("hidden");
  chatWindow.classList.add("hidden");
}
