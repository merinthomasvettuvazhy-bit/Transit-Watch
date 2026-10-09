
// ---- tab switching ----
document.querySelectorAll('.tab').forEach(tab=>{
  tab.addEventListener('click', ()=>{
    document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.page).classList.add('active');
  });
});

// ---- trend line chart (app vs facility issues, 30 days) ----
(function(){
  const days = 30, w = 640, h = 220, pad = 20;
  function series(base, amp, noise){
    return Array.from({length:days}, (_,i)=> Math.max(4, base + amp*Math.sin(i/4) + (Math.random()-0.5)*noise));
  }
  const appData = series(28, 6, 8);
  const facData = series(34, 8, 10);
  const all = appData.concat(facData);
  const max = Math.max(...all), min = 0;
  function toPoints(data){
    return data.map((v,i)=>{
      const x = pad + (i/(days-1))*(w-2*pad);
      const y = h-pad - ((v-min)/(max-min))*(h-2*pad);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  }
  const svg = document.getElementById('trendChart');
  svg.innerHTML = `
    <line x1="${pad}" y1="${h-pad}" x2="${w-pad}" y2="${h-pad}" stroke="#C9B98E" stroke-width="1"/>
    <polyline points="${toPoints(appData)}" fill="none" stroke="#3C5B8C" stroke-width="2.2"/>
    <polyline points="${toPoints(facData)}" fill="none" stroke="#B5542A" stroke-width="2.2"/>
  `;
})();

// ---- live feed table (generated rows) ----
(function(){
  const routes = ['14B','7','22','3A','9','18','6','22X'];
  const catsApp = ['GPS drift','Login failure','Payment error','Push notif missed','Route search crash'];
  const catsFac = ['Overcrowding','Cleanliness','Broken lighting','Signage damage','Ramp fault'];
  const sev = ['crit','high','med','low'];
  const sevLabel = {crit:'Critical',high:'High',med:'Medium',low:'Low'};
  const status = ['open','prog','res'];
  const statusLabel = {open:'Open',prog:'In progress',res:'Resolved'};
  const names = ['R. Nair','A. Costa','J. Kim','S. Fernandez','P. Okafor','M. Alvi','L. Bianchi','T. Wren'];
  let rows = '';
  for(let i=0;i<18;i++){
    const isApp = Math.random() > 0.5;
    const route = routes[Math.floor(Math.random()*routes.length)];
    const cat = isApp ? catsApp[Math.floor(Math.random()*catsApp.length)] : catsFac[Math.floor(Math.random()*catsFac.length)];
    const s = sev[Math.floor(Math.random()*sev.length)];
    const st = status[Math.floor(Math.random()*status.length)];
    const hh = String(9-Math.floor(i/3)).padStart(2,'0');
    const mm = String(Math.floor(Math.random()*59)).padStart(2,'0');
    rows += `<tr>
      <td>TW-${(4820-i)}</td>
      <td>${hh}:${mm}</td>
      <td><span class="badge ${isApp?'app':'fac'}">${isApp?'App':'Facility'}</span></td>
      <td>Route ${route}</td>
      <td>${cat}</td>
      <td><span class="badge ${s}">${sevLabel[s]}</span></td>
      <td><span class="badge ${st}">${statusLabel[st]}</span></td>
      <td>${names[Math.floor(Math.random()*names.length)]}</td>
    </tr>`;
  }
  document.getElementById('feedBody').innerHTML = rows;
})();



/* ===== Travillox-style Transit Watch shell controls ===== */
(function(){
  const body=document.body;
  const themeBtn=document.getElementById('theme-button');
  const saved=localStorage.getItem('transit-watch-theme');
  if(saved==='light') body.classList.add('light-theme');

  themeBtn?.addEventListener('click',()=>{
    body.classList.toggle('light-theme');
    localStorage.setItem('transit-watch-theme', body.classList.contains('light-theme')?'light':'dark');
    themeBtn.classList.add('active');
    setTimeout(()=>themeBtn.classList.remove('active'),350);
  });

  const adminWrap=document.getElementById('admin-wrap');
  const adminTrigger=document.getElementById('admin-trigger');
  const adminMenu=document.getElementById('admin-menu');
  const notificationButton=document.getElementById('notification-button');
  const notificationPanel=document.getElementById('notification-panel');

  adminTrigger?.addEventListener('click',e=>{
    e.stopPropagation();
    const open=!adminWrap.classList.contains('open');
    notificationPanel?.classList.remove('open');
    notificationButton?.setAttribute('aria-expanded','false');
    adminWrap.classList.toggle('open',open);
    adminTrigger.setAttribute('aria-expanded',String(open));
  });
  notificationButton?.addEventListener('click',e=>{
    e.stopPropagation();
    const open=!notificationPanel.classList.contains('open');
    adminWrap?.classList.remove('open');
    adminTrigger?.setAttribute('aria-expanded','false');
    notificationPanel.classList.toggle('open',open);
    notificationButton.setAttribute('aria-expanded',String(open));
  });
  document.addEventListener('click',()=>{
    adminWrap?.classList.remove('open');
    notificationPanel?.classList.remove('open');
    adminTrigger?.setAttribute('aria-expanded','false');
    notificationButton?.setAttribute('aria-expanded','false');
  });
  adminMenu?.addEventListener('click',e=>e.stopPropagation());
  notificationPanel?.addEventListener('click',e=>e.stopPropagation());

  const globalSearch=document.getElementById('global-search');
  const toast=document.getElementById('command-toast');
  function showToast(msg){
    if(!toast) return;
    toast.textContent=msg;
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer=setTimeout(()=>toast.classList.remove('show'),2200);
  }
  globalSearch?.addEventListener('input',()=>{
    const q=globalSearch.value.trim().toLowerCase();
    if(!q){
      document.querySelectorAll('.page').forEach(p=>p.style.display='');
      return;
    }
    let matches=0;
    document.querySelectorAll('.page').forEach(p=>{
      const hit=p.innerText.toLowerCase().includes(q);
      p.style.display=hit?'block':'none';
      if(hit) matches++;
    });
    showToast(matches ? `Found ${matches} matching section${matches===1?'':'s'}` : 'No matching section');
  });
  globalSearch?.addEventListener('keydown',e=>{
    if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();globalSearch.focus();}
    if(e.key==='Escape'){globalSearch.value='';globalSearch.dispatchEvent(new Event('input'));globalSearch.blur();}
  });

  document.querySelectorAll('.filter-chip').forEach(chip=>{
    chip.addEventListener('click',()=>{
      chip.parentElement?.querySelectorAll('.filter-chip').forEach(x=>x.classList.remove('active'));
      chip.classList.add('active');
    });
  });

  document.getElementById('page-print-btn')?.addEventListener('click',()=>window.print());
  document.getElementById('page-share-btn')?.addEventListener('click',()=>{
    const url=window.location.href;
    if(navigator.clipboard?.writeText) navigator.clipboard.writeText(url).then(()=>showToast('Link copied to clipboard'));
    else showToast(url);
  });

  const closeProfile=()=>document.getElementById('profile-modal')?.classList.remove('open');
  const modal=document.getElementById('profile-modal');
  document.getElementById('profile-modal-close')?.addEventListener('click',closeProfile);
  document.getElementById('profile-cancel')?.addEventListener('click',closeProfile);
  document.getElementById('profile-save')?.addEventListener('click',()=>{
    const name=document.getElementById('profile-name')?.value?.trim()||'Transit Admin';
    document.querySelectorAll('.admin-name').forEach(x=>x.textContent=name);
    document.querySelectorAll('.menu-user strong').forEach(x=>x.textContent=name);
    closeProfile(); showToast('Profile saved');
  });
  document.querySelectorAll('[data-admin-action]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const action=btn.dataset.adminAction;
      if(action==='profile') document.getElementById('profile-modal')?.classList.add('open');
      else if(action==='account') showToast('Account preferences selected');
      else showToast('Sign out selected');
      adminWrap?.classList.remove('open');
    });
  });
})();

// Transit Watch demo authentication. Production deployments should use a secure server-side identity provider.
function switchAuthTab(tab) {
  const login = tab === 'login';
  document.getElementById('loginForm').style.display = login ? '' : 'none';
  document.getElementById('signupForm').style.display = login ? 'none' : '';
  document.getElementById('loginTab').classList.toggle('active', login);
  document.getElementById('signupTab').classList.toggle('active', !login);
  const msg = document.getElementById('authMessage');
  msg.className = 'auth-message'; msg.textContent = '';
}
function showAuthMessage(message, isError = false) {
  const msg = document.getElementById('authMessage');
  msg.textContent = message;
  msg.className = 'auth-message show' + (isError ? ' error' : '');
}
function enterTransitWatch(user) {
  sessionStorage.setItem('transitWatchSession', JSON.stringify({name:user.name, email:user.email, role:user.role}));
  document.getElementById('authPage').style.display = 'none';
  const mark = document.querySelector('.spine .brand .mark');
  if (mark) mark.innerHTML = 'Transit<span class="dot"> Watch.</span>';
  const subtitle = document.querySelector('.spine .brand .sub');
  if (subtitle) subtitle.textContent = 'TRANSIT ISSUE INTELLIGENCE';
  const foot = document.querySelector('.spine-foot');
  if (foot) {
    const old = foot.innerHTML;
    if (!old.includes('auth-user-name')) foot.innerHTML = '<b class="auth-user-name"></b><br>' + old;
    const name = foot.querySelector('.auth-user-name');
    if(name) name.textContent = user.name || 'Transit Watch user';
  }
}
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  if (loginForm) loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const password = document.getElementById('loginPass').value;
    let accounts = [];
    try { accounts = JSON.parse(localStorage.getItem('transitWatchDemoAccounts') || '[]'); } catch (_) {}
    const account = accounts.find(a => a.email === email && a.password === password);
    if (!account) {
      showAuthMessage('Account not found or password is incorrect. Create an account first, or use the demo access below.', true);
      return;
    }
    enterTransitWatch({name:account.firstName + ' ' + account.lastName, email:account.email, role:account.role});
  });
  if (signupForm) signupForm.addEventListener('submit', e => {
    e.preventDefault();
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('signupEmail').value.trim().toLowerCase();
    const role = document.getElementById('signupRole').value;
    const password = document.getElementById('signupPass').value;
    const confirm = document.getElementById('confirmPass').value;
    if (password.length < 8) return showAuthMessage('Use a password with at least 8 characters.', true);
    if (password !== confirm) return showAuthMessage('Passwords do not match.', true);
    let accounts = [];
    try { accounts = JSON.parse(localStorage.getItem('transitWatchDemoAccounts') || '[]'); } catch (_) {}
    if (accounts.some(a => a.email === email)) return showAuthMessage('An account with this email already exists. Please sign in.', true);
    accounts.push({firstName,lastName,email,role,password});
    localStorage.setItem('transitWatchDemoAccounts', JSON.stringify(accounts));
    showAuthMessage('Account created. You can now sign in with your email and password.');
    document.getElementById('loginEmail').value = email;
    document.getElementById('loginPass').value = '';
    switchAuthTab('login');
    showAuthMessage('Account created successfully. Sign in with your new credentials.');
  });
  // A visible demo-access option keeps the dashboard previewable without setting a fake password.
  const login = document.getElementById('loginForm');
  if (login && !document.getElementById('demoAccess')) {
    const demo = document.createElement('button');
    demo.type = 'button'; demo.id = 'demoAccess'; demo.className = 'btn btn-ghost auth-submit';
    demo.style.marginTop = '9px'; demo.textContent = 'Open dashboard demo';
    demo.addEventListener('click', () => enterTransitWatch({name:'Demo Analyst',email:'demo@transitwatch.local',role:'Transit Analyst'}));
    login.appendChild(demo);
  }
  // Resume the local demo session for this browser tab.
  try {
    const saved = JSON.parse(sessionStorage.getItem('transitWatchSession') || 'null');
    if (saved) enterTransitWatch(saved);
  } catch (_) {}
});
