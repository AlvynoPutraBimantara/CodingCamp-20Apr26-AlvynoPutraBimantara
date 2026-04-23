let name = localStorage.getItem("name") || "User";

// Custom Username
// Set username if not exists
if (!localStorage.getItem("name")) {
  const userName = prompt("What's your name?", "User");
  if (userName && userName.trim()) {
    name = userName.trim();
    localStorage.setItem("name", name);
  }
}

// Initialize dark mode from localStorage
if (localStorage.getItem("darkMode") === "enabled") {
  document.body.classList.add("dark");
}

// TIME AND DATE MODULE
function updateTime() {
  const now = new Date();

  document.getElementById("time").textContent = now.toLocaleTimeString();

  document.getElementById("date").textContent = now.toDateString();

  const hour = now.getHours();
  let greeting = "Good Morning";

  if (hour >= 12) greeting = "Good Afternoon";
  if (hour >= 18) greeting = "Good Evening";

  greeting += ", " + name;

  document.getElementById("greeting").textContent = greeting;
}

setInterval(updateTime, 1000);
updateTime();

// POMODORO TIMER
let time = 25 * 60;
let interval = null;
let isBreak = false;

function updateTimer() {
  let minutes = Math.floor(time / 60);
  let seconds = time % 60;

  document.getElementById("timer").textContent =
    `${minutes}:${seconds.toString().padStart(2, "0")}`;

  // Update timer status
  const statusElement = document.getElementById("timerStatus");
  if (statusElement) {
    statusElement.textContent = isBreak ? "Break Time!" : "Focus Time";
  }
}

function startTimer() {
  if (interval) return;

  interval = setInterval(() => {
    if (time > 0) {
      time--;
      updateTimer();
    } else {
      // Timer finished
      clearInterval(interval);
      interval = null;

      if (isBreak) {
        // Break finished, reset to work time
        time = 25 * 60;
        isBreak = false;
        alert("Break is over! Time to focus!");
        updateTimer();
      } else {
        // Work session finished, start break
        time = 5 * 60;
        isBreak = true;
        alert("Great job! Take a 5 minute break!");
        updateTimer();
        startTimer(); // Auto-start break
      }
    }
  }, 1000);
}

document.getElementById("start").onclick = () => {
  startTimer();
};

document.getElementById("stop").onclick = () => {
  clearInterval(interval);
  interval = null;
};

document.getElementById("reset").onclick = () => {
  clearInterval(interval);
  interval = null;
  time = 25 * 60;
  isBreak = false;
  updateTimer();
};

// Initialize timer display
updateTimer();

// TASK MANAGER
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentSort = "default";

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function getSortedTasks() {
  const indexed = tasks.map((task, index) => ({
    ...task,
    originalIndex: index,
  }));

  switch (currentSort) {
    case "alpha-asc":
      return [...indexed].sort((a, b) => a.text.localeCompare(b.text));
    case "alpha-desc":
      return [...indexed].sort((a, b) => b.text.localeCompare(a.text));
    case "modified-newest":
      return [...indexed].sort(
        (a, b) => (b.lastModified || 0) - (a.lastModified || 0),
      );
    case "modified-oldest":
      return [...indexed].sort(
        (a, b) => (a.lastModified || 0) - (b.lastModified || 0),
      );
    default:
      return indexed;
  }
}

function updateSortVisibility() {
  const sortContainer = document.getElementById("sortContainer");
  if (sortContainer) {
    sortContainer.style.display = tasks.length > 0 ? "flex" : "none";
  }
}

function renderTasks() {
  const list = document.getElementById("taskList");
  if (!list) return;

  updateSortVisibility();

  list.innerHTML = "";

  if (tasks.length === 0) {
    list.innerHTML =
      '<li style="color: #888; font-style: italic;">No tasks yet. Add one above!</li>';
    return;
  }

  const sortedTasks = getSortedTasks();

  sortedTasks.forEach(({ originalIndex, text, done }) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <input type="checkbox" ${done ? "checked" : ""} />
      <span style="${done ? "text-decoration: line-through; color: #888;" : ""}">
        ${text}
      </span>
      <button onclick="editTask(${originalIndex})" class="edit-btn">Edit</button>
      <button onclick="deleteTask(${originalIndex})" class="delete-btn">Delete</button>
    `;

    li.querySelector("input").onchange = () => {
      tasks[originalIndex].done = !tasks[originalIndex].done;
      tasks[originalIndex].lastModified = Date.now();
      saveTasks();
      renderTasks();
    };

    list.appendChild(li);
  });
}

document.getElementById("addTask").onclick = () => {
  const input = document.getElementById("taskInput");
  if (!input) return;

  const taskText = input.value.trim();

  if (!taskText) {
    alert("Please enter a task!");
    return;
  }

  if (tasks.some((t) => t.text.toLowerCase() === taskText.toLowerCase())) {
    alert("Task already exists!");
    return;
  }

  tasks.push({ text: taskText, done: false, lastModified: Date.now() });
  input.value = "";

  saveTasks();
  renderTasks();
};

document.getElementById("taskInput")?.addEventListener("keypress", (e) => {
  if (e.key === "Enter") document.getElementById("addTask").click();
});

// Sort dropdown listener
document.getElementById("sortSelect")?.addEventListener("change", (e) => {
  currentSort = e.target.value;
  renderTasks();
});

function editTask(index) {
  const currentTask = tasks[index].text;
  const updatedTask = prompt("Edit your task:", currentTask);

  if (updatedTask === null) return;

  const trimmedTask = updatedTask.trim();

  if (!trimmedTask) {
    alert("Task cannot be empty!");
    return;
  }

  const duplicateTask = tasks.some(
    (task, i) =>
      i !== index && task.text.toLowerCase() === trimmedTask.toLowerCase(),
  );

  if (duplicateTask) {
    alert("Task already exists!");
    return;
  }

  tasks[index].text = trimmedTask;
  tasks[index].lastModified = Date.now();

  saveTasks();
  renderTasks();
}

function deleteTask(index) {
  if (confirm("Are you sure you want to delete this task?")) {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
  }
}

renderTasks();

// QUICK LINKS
let links = JSON.parse(localStorage.getItem("links")) || [];

function saveLinks() {
  localStorage.setItem("links", JSON.stringify(links));
}

function renderLinks() {
  const container = document.getElementById("linksContainer");
  if (!container) return;

  container.innerHTML = "";

  if (links.length === 0) {
    container.innerHTML =
      '<p style="color: #888; font-style: italic;">No links saved yet. Add one below!</p>';
    return;
  }

  links.forEach((link, index) => {
    const linkDiv = document.createElement("div");
    linkDiv.className = "link-item";

    const btn = document.createElement("button");
    btn.textContent = link.name;
    btn.className = "link-btn";
    btn.onclick = () => {
      const url = link.url.startsWith("http")
        ? link.url
        : "https://" + link.url;
      window.open(url, "_blank");
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "×";
    deleteBtn.className = "delete-link-btn";
    deleteBtn.title = "Delete link";
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      if (confirm(`Delete link "${link.name}"?`)) {
        links.splice(index, 1);
        saveLinks();
        renderLinks();
      }
    };

    linkDiv.appendChild(btn);
    linkDiv.appendChild(deleteBtn);
    container.appendChild(linkDiv);
  });
}

document.getElementById("addLink").onclick = () => {
  const nameInput = document.getElementById("linkName");
  const urlInput = document.getElementById("linkURL");

  if (!nameInput || !urlInput) return;

  const name = nameInput.value.trim();
  const url = urlInput.value.trim();

  if (!name || !url) {
    alert("Please fill in both name and URL!");
    return;
  }

  // Validate URL format
  if (!isValidURL(url)) {
    alert("Please enter a valid URL!");
    return;
  }

  // Check for duplicate links
  if (
    links.some(
      (l) => l.url === url || l.name.toLowerCase() === name.toLowerCase(),
    )
  ) {
    alert("This link already exists!");
    return;
  }

  links.push({ name, url });

  // Clear inputs
  nameInput.value = "";
  urlInput.value = "";

  saveLinks();
  renderLinks();
};

function isValidURL(string) {
  try {
    const url = string.startsWith("http") ? string : "https://" + string;
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
}

// Add enter key support for link inputs
document.getElementById("linkName")?.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    document.getElementById("linkURL").focus();
  }
});

document.getElementById("linkURL")?.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    document.getElementById("addLink").click();
  }
});

renderLinks();

// DARK MODE
function setupDarkModeToggle() {
  let darkModeBtn = document.getElementById("darkModeToggle");

  if (!darkModeBtn) {
    darkModeBtn = document.createElement("button");
    darkModeBtn.id = "darkModeToggle";
    darkModeBtn.textContent = document.body.classList.contains("dark")
      ? "☀️ Light Mode"
      : "🌙 Dark Mode";
    darkModeBtn.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 10px 15px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      background: #007bff;
      color: white;
      z-index: 1000;
    `;
    document.body.appendChild(darkModeBtn);
  }

  darkModeBtn.onclick = () => {
    document.body.classList.toggle("dark");

    const isDark = document.body.classList.contains("dark");
    localStorage.setItem("darkMode", isDark ? "enabled" : "disabled");
    darkModeBtn.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
  };
}

setupDarkModeToggle();

// USER NAME EDITOR
function setupUserNameEditor() {
  const greetingElement = document.getElementById("greeting");
  if (!greetingElement) return;

  greetingElement.style.cursor = "pointer";
  greetingElement.title = "Click to change your name";

  greetingElement.onclick = () => {
    const newName = prompt("Enter your name:", name);
    if (newName && newName.trim()) {
      name = newName.trim();
      localStorage.setItem("name", name);
      updateTime();
    }
  };
}

setupUserNameEditor();
