/* =========================================================
   StudyAtlas — app logic
   All data persists in localStorage. No frameworks, no backend.
   ========================================================= */
(function(){
  "use strict";

  const TASKS_KEY   = "studyatlas.tasks";
  const ACTIVITY_KEY= "studyatlas.activity"; // array of 'YYYY-MM-DD' — one entry per completion
  const THEME_KEY   = "studyatlas.theme";

  const TAG_COLORS = ["--tag-0","--tag-1","--tag-2","--tag-3","--tag-4","--tag-5","--tag-6","--tag-7"];

  /* ---------------- State ---------------- */
  let tasks = loadTasks();
  let activity = loadActivity();
  let currentView = "dashboard";
  let taskFilter = "all";
  let taskSort = "date";
  let calendarDate = new Date();
  let selectedCalDay = null;
  let editingId = null;

  /* ---------------- Storage helpers ---------------- */
  function loadTasks(){
    try{ return JSON.parse(localStorage.getItem(TASKS_KEY)) || []; }
    catch(e){ return []; }
  }
  function saveTasks(){ localStorage.setItem(TASKS_KEY, JSON.stringify(tasks)); }

  function loadActivity(){
    try{ return JSON.parse(localStorage.getItem(ACTIVITY_KEY)) || []; }
    catch(e){ return []; }
  }
  function saveActivity(){ localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activity)); }

  /* ---------------- Date helpers ---------------- */
  function todayStr(){ return fmtDate(new Date()); }
  function fmtDate(d){
    const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,"0"), day=String(d.getDate()).padStart(2,"0");
    return `${y}-${m}-${day}`;
  }
  function parseDate(str){
    // avoid timezone shift: parse as local date
    const [y,m,d] = str.split("-").map(Number);
    return new Date(y, m-1, d);
  }
  function daysBetween(a,b){
    const ms = parseDate(b) - parseDate(a);
    return Math.round(ms / 86400000);
  }
  function humanDue(dateStr){
    if(!dateStr) return "";
    const diff = daysBetween(todayStr(), dateStr);
    if(diff === 0) return "Today";
    if(diff === 1) return "Tomorrow";
    if(diff === -1) return "Yesterday";
    if(diff < 0) return `${Math.abs(diff)}d overdue`;
    if(diff <= 6) return `In ${diff}d`;
    return parseDate(dateStr).toLocaleDateString(undefined,{month:"short",day:"numeric"});
  }

  function colorForSubject(subject){
    if(!subject) return "var(--tag-0)";
    let hash = 0;
    for(let i=0;i<subject.length;i++) hash = subject.charCodeAt(i) + ((hash<<5)-hash);
    const idx = Math.abs(hash) % TAG_COLORS.length;
    return `var(${TAG_COLORS[idx]})`;
  }

  function uid(){ return "t" + Date.now().toString(36) + Math.random().toString(36).slice(2,7); }

  /* ---------------- Theme ---------------- */
  function initTheme(){
    const saved = localStorage.getItem(THEME_KEY) || "light";
    document.body.setAttribute("data-theme", saved);
    updateThemeUI(saved);
  }
  function updateThemeUI(theme){
    document.getElementById("themeIcon").textContent = theme === "dark" ? "☀️" : "🌙";
    document.getElementById("themeLabel").textContent = theme === "dark" ? "Light mode" : "Dark mode";
  }
  document.getElementById("themeToggle").addEventListener("click", ()=>{
    const cur = document.body.getAttribute("data-theme");
    const next = cur === "dark" ? "light" : "dark";
    document.body.setAttribute("data-theme", next);
    localStorage.setItem(THEME_KEY, next);
    updateThemeUI(next);
  });

  /* ---------------- Navigation ---------------- */
  const VIEW_TITLES = {
    dashboard:"Dashboard", tasks:"Tasks", calendar:"Study Calendar",
    deadlines:"Deadlines", progress:"Progress"
  };

  function switchView(view){
    currentView = view;
    document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));
    document.getElementById("view-"+view).classList.add("active");
    document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active", b.dataset.view===view));
    document.querySelectorAll(".bn-item").forEach(b=>b.classList.toggle("active", b.dataset.view===view));
    document.getElementById("viewTitle").textContent = VIEW_TITLES[view];
    closeSidebar();
    renderCurrentView();
  }

  document.querySelectorAll(".nav-item").forEach(btn=>{
    btn.addEventListener("click", ()=>switchView(btn.dataset.view));
  });
  document.querySelectorAll(".bn-item").forEach(btn=>{
    btn.addEventListener("click", ()=>switchView(btn.dataset.view));
  });

  function closeSidebar(){ document.getElementById("sidebar").classList.remove("open"); }
  document.getElementById("menuBtn").addEventListener("click", ()=>{
    document.getElementById("sidebar").classList.toggle("open");
  });

  /* ---------------- Header date ---------------- */
  document.getElementById("viewDate").textContent = new Date().toLocaleDateString(undefined,{
    weekday:"long", month:"long", day:"numeric"
  });
  document.getElementById("greetName").textContent = greeting() + " Here's your plan.";
  function greeting(){
    const h = new Date().getHours();
    if(h < 12) return "Good morning.";
    if(h < 18) return "Good afternoon.";
    return "Good evening.";
  }

  /* =========================================================
     Modal (Add / Edit task)
     ========================================================= */
  const overlay = document.getElementById("taskModalOverlay");
  const form = document.getElementById("taskForm");

  function openModal(task){
    editingId = task ? task.id : null;
    document.getElementById("modalTitle").textContent = task ? "Edit task" : "New task";
    document.getElementById("fieldTitle").value = task ? task.title : "";
    document.getElementById("fieldSubject").value = task ? task.subject : "";
    document.getElementById("fieldPriority").value = task ? task.priority : "medium";
    document.getElementById("fieldDate").value = task ? task.dueDate : "";
    document.getElementById("fieldTime").value = task ? task.dueTime : "";
    document.getElementById("fieldNotes").value = task ? task.notes : "";
    document.getElementById("deleteTaskBtn").hidden = !task;
    populateSubjectSuggestions();
    overlay.classList.add("open");
    setTimeout(()=>document.getElementById("fieldTitle").focus(), 50);
  }
  function closeModal(){
    overlay.classList.remove("open");
    form.reset();
    editingId = null;
  }
  function populateSubjectSuggestions(){
    const subjects = [...new Set(tasks.map(t=>t.subject).filter(Boolean))];
    const dl = document.getElementById("subjectSuggestions");
    dl.innerHTML = subjects.map(s=>`<option value="${escapeHtml(s)}">`).join("");
  }

  document.getElementById("quickAddBtn").addEventListener("click", ()=>openModal(null));
  document.getElementById("modalClose").addEventListener("click", closeModal);
  document.getElementById("cancelTaskBtn").addEventListener("click", closeModal);
  overlay.addEventListener("click", e=>{ if(e.target === overlay) closeModal(); });
  document.addEventListener("keydown", e=>{ if(e.key === "Escape" && overlay.classList.contains("open")) closeModal(); });

  form.addEventListener("submit", e=>{
    e.preventDefault();
    const title = document.getElementById("fieldTitle").value.trim();
    if(!title) return;
    const data = {
      title,
      subject: document.getElementById("fieldSubject").value.trim(),
      priority: document.getElementById("fieldPriority").value,
      dueDate: document.getElementById("fieldDate").value,
      dueTime: document.getElementById("fieldTime").value,
      notes: document.getElementById("fieldNotes").value.trim(),
    };
    if(editingId){
      const t = tasks.find(t=>t.id===editingId);
      Object.assign(t, data);
      showToast("Task updated");
    }else{
      tasks.unshift({ id: uid(), completed:false, createdAt: Date.now(), ...data });
      showToast("Task added");
    }
    saveTasks();
    closeModal();
    renderAll();
  });

  document.getElementById("deleteTaskBtn").addEventListener("click", ()=>{
    if(!editingId) return;
    tasks = tasks.filter(t=>t.id!==editingId);
    saveTasks();
    closeModal();
    showToast("Task deleted");
    renderAll();
  });

  function toggleComplete(id){
    const t = tasks.find(t=>t.id===id);
    if(!t) return;
    t.completed = !t.completed;
    if(t.completed){
      activity.push(todayStr());
    }else{
      const idx = activity.lastIndexOf(todayStr());
      if(idx > -1) activity.splice(idx,1);
    }
    saveTasks();
    saveActivity();
    renderAll();
  }

  function deleteTask(id){
    tasks = tasks.filter(t=>t.id!==id);
    saveTasks();
    renderAll();
  }

  /* =========================================================
     Toast
     ========================================================= */
  let toastTimer;
  function showToast(msg){
    const el = document.getElementById("toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=>el.classList.remove("show"), 2200);
  }

  /* =========================================================
     Task card renderer (shared by Tasks view + previews)
     ========================================================= */
  function taskCardHTML(t){
    const overdue = t.dueDate && !t.completed && daysBetween(todayStr(), t.dueDate) < 0;
    return `
    <li class="task-card ${t.completed ? "done" : ""}" style="border-left-color:${colorForSubject(t.subject)}" data-id="${t.id}">
      <button class="task-check ${t.completed?"checked":""}" data-action="toggle" aria-label="Toggle complete">✓</button>
      <div class="task-body" data-action="edit">
        <p class="task-title">${escapeHtml(t.title)}</p>
        <div class="task-meta">
          ${t.subject ? `<span class="pill subject">${escapeHtml(t.subject)}</span>` : ""}
          <span class="pill priority-${t.priority}">${t.priority}</span>
          ${t.dueDate ? `<span class="pill due ${overdue?"overdue":""}">${humanDue(t.dueDate)}${t.dueTime? " · "+t.dueTime:""}</span>` : ""}
        </div>
        ${t.notes ? `<p class="task-notes">${escapeHtml(t.notes)}</p>` : ""}
      </div>
      <div class="task-actions">
        <button class="icon-btn" data-action="edit" aria-label="Edit">✎</button>
        <button class="icon-btn" data-action="delete" aria-label="Delete">🗑</button>
      </div>
    </li>`;
  }

  function escapeHtml(str){
    const div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
  }

  // event delegation for task cards
  document.addEventListener("click", e=>{
    const card = e.target.closest(".task-card");
    if(!card) return;
    const id = card.dataset.id;
    const action = e.target.closest("[data-action]")?.dataset.action;
    if(action === "toggle") toggleComplete(id);
    else if(action === "delete") deleteTask(id);
    else if(action === "edit") openModal(tasks.find(t=>t.id===id));
  });

  /* =========================================================
     RENDER: Dashboard
     ========================================================= */
  function renderDashboard(){
    const today = todayStr();
    const dueToday = tasks.filter(t=>t.dueDate===today);
    const completedToday = tasks.filter(t=>t.dueDate===today && t.completed);
    const upcoming3 = tasks.filter(t=>{
      if(!t.dueDate || t.completed) return false;
      const d = daysBetween(today, t.dueDate);
      return d > 0 && d <= 3;
    });
    const overdue = tasks.filter(t=>t.dueDate && !t.completed && daysBetween(today,t.dueDate) < 0);

    document.getElementById("statToday").textContent = dueToday.length;
    document.getElementById("statCompleted").textContent = completedToday.length;
    document.getElementById("statUpcoming").textContent = upcoming3.length;
    document.getElementById("statOverdue").textContent = overdue.length;

    const pct = dueToday.length ? Math.round((completedToday.length/dueToday.length)*100) : 0;
    setRing("focusRing", pct);
    document.getElementById("ringPercent").textContent = pct+"%";

    // streak
    const streak = computeCurrentStreak();
    document.getElementById("streakCount").textContent = streak;

    // upcoming preview (next 5 incomplete by due date)
    const previewList = tasks
      .filter(t=>!t.completed && t.dueDate)
      .sort((a,b)=>a.dueDate.localeCompare(b.dueDate))
      .slice(0,5);
    const previewEl = document.getElementById("upcomingPreview");
    previewEl.innerHTML = previewList.length ? previewList.map(t=>`
      <li>
        <span class="tag-dot" style="background:${colorForSubject(t.subject)}"></span>
        ${escapeHtml(t.title)}
        <span class="mini-due">${humanDue(t.dueDate)}</span>
      </li>`).join("") : `<li class="mini-empty">Nothing on the horizon — enjoy the calm.</li>`;

    renderHeatmap("heatmapGrid", 10);
  }

  function setRing(id, pct){
    const circle = document.getElementById(id);
    const circumference = 2 * Math.PI * 60; // r=60
    const offset = circumference - (pct/100)*circumference;
    circle.style.strokeDasharray = circumference;
    circle.style.strokeDashoffset = offset;
  }

  /* ---- Heatmap ---- */
  function renderHeatmap(elId, weeks){
    const el = document.getElementById(elId);
    el.innerHTML = "";
    const counts = {};
    activity.forEach(d=> counts[d] = (counts[d]||0)+1 );

    const totalDays = weeks*7;
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (totalDays-1));
    // align start to Sunday for clean columns
    start.setDate(start.getDate() - start.getDay());

    for(let i=0;i<totalDays + 7;i++){
      const d = new Date(start);
      d.setDate(start.getDate()+i);
      if(d > end) break;
      const key = fmtDate(d);
      const c = counts[key] || 0;
      const lvl = c===0?0 : c===1?1 : c===2?2 : c<=4?3:4;
      const cell = document.createElement("i");
      cell.className = "lv"+lvl;
      cell.title = `${key}: ${c} completed`;
      el.appendChild(cell);
    }
  }

  function computeCurrentStreak(){
    const daySet = new Set(activity);
    let streak = 0;
    let cursor = new Date();
    // if nothing done today yet, streak still counts from yesterday backwards
    if(!daySet.has(fmtDate(cursor))) cursor.setDate(cursor.getDate()-1);
    while(daySet.has(fmtDate(cursor))){
      streak++;
      cursor.setDate(cursor.getDate()-1);
    }
    return streak;
  }

  function computeBestStreak(){
    const daySet = new Set(activity);
    if(daySet.size===0) return 0;
    const sorted = [...daySet].sort();
    let best = 1, cur = 1;
    for(let i=1;i<sorted.length;i++){
      if(daysBetween(sorted[i-1], sorted[i]) === 1) cur++;
      else cur = 1;
      best = Math.max(best,cur);
    }
    return best;
  }

  /* =========================================================
     RENDER: Tasks
     ========================================================= */
  function renderTasks(){
    let list = tasks.slice();
    if(taskFilter==="active") list = list.filter(t=>!t.completed);
    if(taskFilter==="completed") list = list.filter(t=>t.completed);

    if(taskSort==="date"){
      list.sort((a,b)=> (a.dueDate||"9999").localeCompare(b.dueDate||"9999"));
    }else if(taskSort==="priority"){
      const order = {high:0, medium:1, low:2};
      list.sort((a,b)=> order[a.priority]-order[b.priority]);
    }else if(taskSort==="subject"){
      list.sort((a,b)=> (a.subject||"").localeCompare(b.subject||""));
    }

    const container = document.getElementById("taskListContainer");
    container.innerHTML = list.map(taskCardHTML).join("");
    document.getElementById("taskEmptyState").classList.toggle("show", list.length===0);
  }

  document.querySelectorAll("#taskFilterSeg .seg-btn").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      taskFilter = btn.dataset.filter;
      document.querySelectorAll("#taskFilterSeg .seg-btn").forEach(b=>b.classList.toggle("active", b===btn));
      renderTasks();
    });
  });
  document.getElementById("taskSort").addEventListener("change", e=>{
    taskSort = e.target.value;
    renderTasks();
  });

  /* =========================================================
     RENDER: Calendar
     ========================================================= */
  function renderCalendar(){
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    document.getElementById("calMonthLabel").textContent =
      calendarDate.toLocaleDateString(undefined,{month:"long", year:"numeric"});

    const grid = document.getElementById("calendarGrid");
    grid.innerHTML = "";

    const firstOfMonth = new Date(year, month, 1);
    const startOffset = firstOfMonth.getDay();
    const startDate = new Date(year, month, 1 - startOffset);

    const tasksByDate = {};
    tasks.forEach(t=>{
      if(!t.dueDate) return;
      (tasksByDate[t.dueDate] ||= []).push(t);
    });

    for(let i=0;i<42;i++){
      const d = new Date(startDate);
      d.setDate(startDate.getDate()+i);
      const key = fmtDate(d);
      const outside = d.getMonth() !== month;
      const isToday = key === todayStr();
      const dayTasks = tasksByDate[key] || [];

      const cell = document.createElement("div");
      cell.className = `cal-day ${outside?"outside":""} ${isToday?"today":""} ${selectedCalDay===key?"selected":""}`;
      cell.dataset.date = key;
      cell.innerHTML = `
        <span>${d.getDate()}</span>
        <div class="cal-dots">${dayTasks.slice(0,4).map(t=>`<span style="background:${colorForSubject(t.subject)}"></span>`).join("")}</div>
      `;
      cell.addEventListener("click", ()=>{
        selectedCalDay = key;
        renderCalendar();
        renderDayDetail(key, dayTasks);
      });
      grid.appendChild(cell);
    }

    if(selectedCalDay){
      renderDayDetail(selectedCalDay, tasksByDate[selectedCalDay] || []);
    }
  }

  function renderDayDetail(dateKey, dayTasks){
    document.getElementById("dayDetailTitle").textContent =
      parseDate(dateKey).toLocaleDateString(undefined,{weekday:"long", month:"long", day:"numeric"});
    const list = document.getElementById("dayDetailList");
    list.innerHTML = dayTasks.length ? dayTasks.map(t=>`
      <li>
        <span class="tag-dot" style="background:${colorForSubject(t.subject)}"></span>
        ${escapeHtml(t.title)}
        <span class="mini-due">${t.completed?"Done":t.priority}</span>
      </li>`).join("") : `<li class="mini-empty">No tasks due this day.</li>`;
  }

  document.getElementById("calPrev").addEventListener("click", ()=>{
    calendarDate.setMonth(calendarDate.getMonth()-1);
    renderCalendar();
  });
  document.getElementById("calNext").addEventListener("click", ()=>{
    calendarDate.setMonth(calendarDate.getMonth()+1);
    renderCalendar();
  });

  /* =========================================================
     RENDER: Deadlines
     ========================================================= */
  function renderDeadlines(){
    const today = todayStr();
    const pending = tasks.filter(t=>!t.completed && t.dueDate).sort((a,b)=>a.dueDate.localeCompare(b.dueDate));

    const groups = { overdue:[], today:[], week:[], later:[] };
    pending.forEach(t=>{
      const diff = daysBetween(today, t.dueDate);
      if(diff < 0) groups.overdue.push(t);
      else if(diff === 0) groups.today.push(t);
      else if(diff <= 7) groups.week.push(t);
      else groups.later.push(t);
    });

    const labels = {
      overdue:"Overdue", today:"Due today", week:"This week", later:"Later"
    };

    const container = document.getElementById("deadlinesContainer");
    let html = "";
    Object.keys(groups).forEach(key=>{
      if(groups[key].length===0) return;
      html += `
        <div class="deadline-group ${key==='overdue'?'overdue':''}">
          <h4>${labels[key]} <span class="count">${groups[key].length}</span></h4>
          <ul class="task-list">${groups[key].map(taskCardHTML).join("")}</ul>
        </div>`;
    });
    container.innerHTML = html;
    document.getElementById("deadlineEmptyState").classList.toggle("show", pending.length===0);
  }

  /* =========================================================
     RENDER: Progress
     ========================================================= */
  function renderProgress(){
    const total = tasks.length;
    const done = tasks.filter(t=>t.completed).length;
    const pct = total ? Math.round((done/total)*100) : 0;
    setRing("overallRing", pct);
    document.getElementById("overallPercent").textContent = pct+"%";
    document.getElementById("overallFraction").textContent = `${done} / ${total}`;

    document.getElementById("curStreak").textContent = computeCurrentStreak();
    document.getElementById("bestStreak").textContent = computeBestStreak();
    document.getElementById("totalDone").textContent = done;

    // per-subject breakdown
    const subjects = {};
    tasks.forEach(t=>{
      const s = t.subject || "General";
      subjects[s] ||= {total:0, done:0};
      subjects[s].total++;
      if(t.completed) subjects[s].done++;
    });
    const breakdown = document.getElementById("subjectBreakdown");
    const entries = Object.entries(subjects).sort((a,b)=>b[1].total-a[1].total);
    breakdown.innerHTML = entries.length ? entries.map(([name,v])=>{
      const p = v.total ? Math.round((v.done/v.total)*100) : 0;
      return `
      <div class="subject-row">
        <div class="subject-row-head">
          <span>${escapeHtml(name)}</span>
          <small>${v.done}/${v.total}</small>
        </div>
        <div class="bar-track"><div class="bar-fill" style="width:${p}%;background:${colorForSubject(name)}"></div></div>
      </div>`;
    }).join("") : `<p class="empty-state show" style="padding:10px 0;">Add subjects to your tasks to see a breakdown.</p>`;

    renderHeatmap("heatmapGridLarge", 20);
  }

  /* =========================================================
     Master render dispatcher
     ========================================================= */
  function renderCurrentView(){
    if(currentView==="dashboard") renderDashboard();
    else if(currentView==="tasks") renderTasks();
    else if(currentView==="calendar") renderCalendar();
    else if(currentView==="deadlines") renderDeadlines();
    else if(currentView==="progress") renderProgress();
  }
  function renderAll(){
    renderDashboard();
    renderTasks();
    renderCalendar();
    renderDeadlines();
    renderProgress();
  }

  /* ---------------- Init ---------------- */
  initTheme();
  renderAll();
})();