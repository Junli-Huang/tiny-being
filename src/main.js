import "./style.css";
import { applyAction, createState, dominantNeed, settleState, STORAGE_KEY } from "./game.js";

const app = document.querySelector("#app");
const loaded = localStorage.getItem(STORAGE_KEY);
let state = loaded ? settleState(JSON.parse(loaded)) : null;

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, action: "idle" }));
}

function meter(label, value, icon) {
  const rounded = Math.round(value);
  const level = value < 25 ? "low" : value < 55 ? "mid" : "good";
  return `<div class="meter ${level}"><span class="meter-icon">${icon}</span><div><span>${label}</span><strong>${rounded}</strong><i><b style="width:${rounded}%"></b></i></div></div>`;
}

function startScreen() {
  app.innerHTML = `<main class="welcome"><div class="egg" aria-hidden="true"></div><p class="eyebrow">A SMALL LIFE IS WAITING</p><h1>Tiny Being</h1><p>它会在你离开时继续生活，也会记得你回来过。</p><form id="hatch-form"><label for="pet-name">给它取个名字</label><input id="pet-name" maxlength="10" value="小不点" autocomplete="off"><button>轻轻敲开蛋壳</button></form></main>`;
  document.querySelector("#hatch-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.querySelector("#pet-name").value.trim() || "小不点";
    state = createState(Date.now(), name);
    state.message = `${name} 从蛋壳里探出了头。它看见的第一个人是你。`;
    save();
    render();
  });
}

function render() {
  if (!state) return startScreen();
  const need = dominantNeed(state);
  const roomClass = state.sleeping ? "room sleeping" : "room";
  app.innerHTML = `<main class="game">
    <header><div><p class="eyebrow">DAY ${Math.max(1, Math.ceil((Date.now() - state.createdAt) / 86400000))}</p><h1>${escapeHtml(state.petName)}</h1></div><span class="status ${need.tone}"><i></i>${need.label}</span></header>
    <section class="meters">
      ${meter("饱食", state.hunger, "●")}${meter("心情", state.mood, "♥")}${meter("清洁", state.cleanliness, "✦")}${meter("精力", state.energy, "☾")}
    </section>
    <section class="${roomClass}">
      <div class="window"><span></span></div><div class="shelf"><i></i><b></b></div>
      <div class="bed"><i></i></div><div class="bowl"></div><div class="ball"></div>
      <button class="pet ${need.tone} ${state.action}" id="pet" aria-label="抚摸 ${escapeHtml(state.petName)}"><i class="ear left"></i><i class="ear right"></i><span class="face"><b></b><b></b><em></em></span><span class="shadow"></span></button>
      <div class="thought">${need.tone === "hungry" ? "🍞" : need.tone === "tired" ? "💤" : need.tone === "dirty" ? "🫧" : need.tone === "sad" ? "…" : "♡"}</div>
    </section>
    <p class="message">${escapeHtml(state.message)}</p>
    <nav aria-label="照顾操作">
      <button data-action="feed"><span>◉</span>喂食</button><button data-action="play"><span>●</span>玩耍</button><button data-action="clean"><span>✦</span>清洁</button><button data-action="sleep"><span>☾</span>${state.sleeping ? "叫醒" : "睡觉"}</button>
    </nav>
    <footer><span>V0.1 · 本地存档</span><button id="reset">重新开始</button></footer>
  </main>`;
  document.querySelectorAll("[data-action]").forEach((button) => button.addEventListener("click", () => act(button.dataset.action)));
  document.querySelector("#pet").addEventListener("click", () => act("touch"));
  document.querySelector("#reset").addEventListener("click", () => {
    if (confirm("要和现在的 Tiny Being 告别，重新孵化吗？")) {
      localStorage.removeItem(STORAGE_KEY); state = null; startScreen();
    }
  });
}

function act(action) {
  state = applyAction(state, action);
  save(); render();
  window.setTimeout(() => { if (state && !state.sleeping) { state.action = "idle"; render(); } }, 900);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
}

render();

window.setInterval(() => {
  if (!state) return;
  state = settleState(state);
  save(); render();
}, 60_000);
