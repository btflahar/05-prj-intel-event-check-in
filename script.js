const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");

const attendeeCountEl = document.getElementById("attendeeCount");
const progressBarEl = document.getElementById("progressBar");
const greetingEl = document.getElementById("greeting");

const teamCountEls = {
  water: document.getElementById("waterCount"),
  zero: document.getElementById("zeroCount"), // Team counters from the page
  power: document.getElementById("powerCount"),
};

const maxCount = 50; //max count 50

let count = 0;
let teamCounts = { water: 0, zero: 0, power: 0 };
let attendees = []; // { name, team, teamName }

function saveState() {
  localStorage.setItem("intel_count", String(count)); //local storage for refresh website
  localStorage.setItem("intel_teamCounts", JSON.stringify(teamCounts));
  localStorage.setItem("intel_attendees", JSON.stringify(attendees));
}

function loadState() {
  const savedCount = localStorage.getItem("intel_count");
  const savedTeams = localStorage.getItem("intel_teamCounts");
  const savedAttendees = localStorage.getItem("intel_attendees");

  if (savedCount) count = parseInt(savedCount, 10) || 0;
  if (savedTeams) {
    try {
      const parsed = JSON.parse(savedTeams);
      teamCounts = { water: 0, zero: 0, power: 0, ...parsed };
    } catch {}
  }

  if (savedAttendees) {
    try {
      attendees = JSON.parse(savedAttendees) || [];
    } catch {}
  }
}

function updateProgressUI() {
  attendeeCountEl.textContent = String(count);
  const pct = Math.min(100, Math.round((count / maxCount) * 100));
  progressBarEl.style.width = pct + "%";
}

function updateTeamCountersUI() {
  teamCountEls.water.textContent = String(teamCounts.water);
  teamCountEls.zero.textContent = String(teamCounts.zero);
  teamCountEls.power.textContent = String(teamCounts.power);
}

function showGreeting(msg, success = true) {
  greetingEl.textContent = msg;
  greetingEl.style.display = "block"; //simple styling without css
  greetingEl.classList.toggle("success-message", success);

  greetingEl.style.backgroundColor = success ? "" : "#fee2e2";
  greetingEl.style.color = success ? "" : "#991b1b";
}

function ensureAttendeeListContainer() {
  let list = document.getElementById("attendeeList");
  if (!list) {
    const container = document.querySelector(".team-stats");
    list = document.createElement("div");
    list.id = "attendeeList";
    list.style.marginTop = "18px";
    list.style.textAlign = "left";
    list.style.borderTop = "2px solid #f1f5f9"; //AI Container list for attendees bonus
    list.style.paddingTop = "16px";
    container.appendChild(list);

    const title = document.createElement("h4");
    title.textContent = "Attendee List";
    title.style.color = "#64748b";
    title.style.fontSize = "15px";
    title.style.marginBottom = "10px";
    list.appendChild(title);

    const ul = document.createElement("ul");
    ul.id = "attendeeListUl";
    ul.style.listStyle = "none";
    ul.style.paddingLeft = "0";
    ul.style.display = "grid";
    ul.style.gridTemplateColumns = "1fr";
    ul.style.gap = "8px";
    list.appendChild(ul);
  }
  return document.getElementById("attendeeListUl");
}

function renderAttendeeList() {
  const ul = ensureAttendeeListContainer();
  ul.innerHTML = "";
  attendees.forEach((a) => {
    const li = document.createElement("li"); //AI styled list help for attendees
    li.style.background = "#f8fafc";
    li.style.border = "1px solid #eef2f7";
    li.style.borderRadius = "10px";
    li.style.padding = "10px 12px";
    li.style.display = "flex";
    li.style.justifyContent = "space-between";
    li.style.alignItems = "center";

    const left = document.createElement("span");
    left.textContent = a.name;

    const right = document.createElement("span");
    right.textContent = a.teamName;
    right.style.color = "#475569";
    right.style.fontSize = "14px";

    li.appendChild(left);
    li.appendChild(right);
    ul.appendChild(li);
  });
}

function celebrateIfGoalReached() {
  if (count < maxCount) return;

  const entries = Object.entries(teamCounts); // winning team(s)
  const maxVal = Math.max(...entries.map(([, v]) => v));
  const winners = entries.filter(([, v]) => v === maxVal).map(([k]) => k);

  const toName = {
    water: "Team Water Wise",
    zero: "Team Net Zero", //display team totals
    power: "Team Renewables",
  };

  const winnerNames = winners.map((w) => toName[w]).join(" & ");
  showGreeting(`🎉 Attendance goal reached! Congrats to ${winnerNames}!`, true);

  form.querySelector('button[type="submit"]').disabled = true;
  nameInput.disabled = true; //disable submission Unless team is selected
  teamSelect.disabled = true;
}

function initUIFromState() {
  updateProgressUI();
  updateTeamCountersUI();
  renderAttendeeList();
  if (count >= maxCount) celebrateIfGoalReached();
}

form.addEventListener("submit", function (event) {
  //event listener
  event.preventDefault();

  const name = nameInput.value.trim();
  const team = teamSelect.value;
  const teamName =
    teamSelect.selectedOptions && teamSelect.selectedOptions.length
      ? teamSelect.selectedOptions[0].text
      : "";

  if (!name) {
    // Basic validation
    showGreeting("Please enter a name before checking in.", false);
    nameInput.focus();
    return;
  }

  if (!team) {
    showGreeting("Please select a team.", false);
    teamSelect.focus();
    return;
  }

  if (count >= maxCount) {
    showGreeting(
      `Capacity reached (${maxCount}/${maxCount}). Check-in is closed.`,
      false
    );
    return;
  }

  count += 1;
  teamCounts[team] = (teamCounts[team] || 0) + 1; //keep track of team counts

  updateProgressUI(); //update counts after adding team member
  updateTeamCountersUI();

  showGreeting(`Welcome, ${name} from ${teamName}! 🎉`, true); //greeting

  attendees.push({ name, team, teamName }); // Save attendee
  saveState(); //save after refresh

  renderAttendeeList();

  form.reset(); // Reset form for next entry
  nameInput.focus();

  celebrateIfGoalReached(); // Message if goal reached
});

loadState(); //iniitialize state from localStorage
initUIFromState();
