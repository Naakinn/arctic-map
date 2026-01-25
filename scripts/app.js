let m = new bootstrap.Modal(document.getElementById("mStage"));

let curTopic = "space";
let st = [];

let p = { done: {}, ok: 0 };

function keyP() {
  return "p_" + curTopic;
}

function loadP() {
  let s = localStorage.getItem(keyP());
  if (s) p = JSON.parse(s);
  if (!p.done) p.done = {};
  if (!p.ok) p.ok = 0;
}

function saveP() {
  localStorage.setItem(keyP(), JSON.stringify(p));
}

function normP() {
  let ok = 0;
  let ids = {};
  for (let x of st) ids[x.id] = 1;

  for (let id in p.done) {
    if (!ids[id]) delete p.done[id];
  }

  for (let x of st) {
    if (p.done[x.id]) ok++;
  }

  if (p.ok !== ok) {
    p.ok = ok;
    saveP();
  }
}

function setTopic(id) {
  curTopic = id;
  st = topics.find(x => x.id === id).stages;

  loadP();
  normP();
  updP();
  render();
}

function updP() {
  let all = st.length;
  let done = 0;

  for (let x of st) {
    if (p.done[x.id]) done++;
  }

  document.getElementById("pAll").textContent = all;
  document.getElementById("pDone").textContent = done;
  document.getElementById("pOk").textContent = p.ok;

  let pr = all === 0 ? 0 : Math.round((done / all) * 100);
  document.getElementById("pBar").style.width = pr + "%";
}

function card(x) {
  let done = p.done[x.id] ? "✅ пройдено" : "⏳ не пройдено";

  return `
  <div class="col-12 col-md-6 col-lg-4">
    <div class="card h-100">
      <div class="card-body d-flex flex-column">
        <div class="d-flex justify-content-between align-items-start gap-2">
          <h6 class="card-title mb-1">${x.title}</h6>
          <span class="badge text-bg-light">${done}</span>
        </div>
        <p class="card-text text-muted mt-2">${x.text}</p>
        <button class="btn btn-primary mt-auto" data-id="${x.id}">Открыть этап</button>
      </div>
    </div>
  </div>`;
}

function render() {
  let html = "";
  for (let x of st) html += card(x);
  document.getElementById("list").innerHTML = html;

  document.querySelectorAll("button[data-id]").forEach(b => {
    b.addEventListener("click", () => openStage(b.dataset.id));
  });

  document.getElementById("topicName").textContent =
    topics.find(x => x.id === curTopic).title;
}

function openStage(id) {
  let x = st.find(z => z.id === id);

  document.getElementById("mTitle").textContent = x.title;
  document.getElementById("mText").textContent = x.text;
  document.getElementById("mFact").textContent = x.fact;
  document.getElementById("mSrc").textContent = x.src.join(" | ");

  document.getElementById("qText").textContent = x.q.t;

  let box = document.getElementById("qAns");
  box.innerHTML = "";

  let msg = document.getElementById("qMsg");
  msg.innerHTML = "";

  for (let i = 0; i < x.q.a.length; i++) {
    let bt = document.createElement("button");
    bt.className = "btn btn-outline-primary";
    bt.textContent = x.q.a[i];
    bt.onclick = () => answer(x, i);
    box.appendChild(bt);
  }

  m.show();
}

function answer(x, i) {
  let ok = i === x.q.ok;
  let msg = document.getElementById("qMsg");

  if (ok) {
    msg.innerHTML = `<div class="alert alert-success py-2">Верно! 🎉</div>`;
    if (!p.done[x.id]) {
      p.ok++;
      p.done[x.id] = 1;
      saveP();
    }
  } else {
    msg.innerHTML = `<div class="alert alert-danger py-2">Не совсем. Попробуй ещё раз 🙂</div>`;
  }

  updP();
  render();
}

document.getElementById("btnReset").onclick = () => {
  p = { done: {}, ok: 0 };
  saveP();
  updP();
  render();
};

document.getElementById("btnSpace").onclick = () => setTopic("space");
document.getElementById("btnArctic").onclick = () => setTopic("arctic");

setTopic("space");
