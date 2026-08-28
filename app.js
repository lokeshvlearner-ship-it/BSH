const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
const seed = () => { if (!localStorage.getItem('enterprise_admins')) localStorage.setItem('enterprise_admins', JSON.stringify([])); if (!localStorage.getItem('enterprise_stores')) localStorage.setItem('enterprise_stores', JSON.stringify([])); };
seed();
let role = 'admin'; let mode = 'login';
const authView = $('#auth-view'), dashView = $('#dashboard-view');
function showToast(message) { const t=$('#toast'); t.textContent=message; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2800); }
function setMode(next) {
  const previousMode = mode;
  mode = role === 'store' ? 'login' : next;
  $$('.tab').forEach(t => {
    t.classList.toggle('active', t.dataset.auth === mode);
    t.classList.toggle('hidden', role === 'store' && t.dataset.auth === 'signup');
  });
  $('#name-field').classList.toggle('hidden', mode === 'login');
  $('#confirm-field').classList.toggle('hidden', mode === 'login');
  $('#submit-label').textContent = mode === 'signup' ? `Create ${role} account` : `Continue to ${role}`;
  $('#switch-note').innerHTML = role === 'store' ? 'Store access is created by your admin.' : (mode === 'signup' ? `Already have an account? <button type="button" data-auth-switch="login">Log in instead</button>` : `New here? <button type="button" data-auth-switch="signup">Create a ${role} account</button>`);
  $('#form-error').textContent = '';

  // Replay a directional slide every time the user switches between login and signup.
  if (previousMode !== mode) {
    const card = $('.auth-card');
    card.classList.remove('slide-next', 'slide-previous');
    void card.offsetWidth;
    card.classList.add(mode === 'signup' ? 'slide-next' : 'slide-previous');
  }
}
function setRole(next) { role=next; $$('.role-card').forEach(c=>c.classList.toggle('selected',c.dataset.role===role)); $('.selected-role-label').textContent=role[0].toUpperCase()+role.slice(1); setMode('login'); $('#auth-form').reset(); }
$$('.role-card').forEach(c=>c.addEventListener('click',()=>setRole(c.dataset.role)));
$$('.tab').forEach(t=>t.addEventListener('click',()=>setMode(t.dataset.auth)));
document.addEventListener('click',e=>{const b=e.target.closest('[data-auth-switch]');if(b)setMode(b.dataset.auth)});
$('#toggle-password').addEventListener('click',()=>{const p=$('#password');p.type=p.type==='password'?'text':'password';});
function get(key){return JSON.parse(localStorage.getItem(key)||'[]')} function save(key,value){localStorage.setItem(key,JSON.stringify(value))}
$('#auth-form').addEventListener('submit',e=>{e.preventDefault(); const email=$('#email').value.trim().toLowerCase(), password=$('#password').value; const error=$('#form-error'); if(!email||!email.includes('@')) return error.textContent='Please enter a valid work email.'; if(password.length<8)return error.textContent='Password must be at least 8 characters.'; if(mode==='signup'){if($('#name').value.trim().length<2)return error.textContent='Please enter your name.';if(password!==$('#confirm').value)return error.textContent='Passwords do not match.';const key=role==='admin'?'enterprise_admins':'enterprise_stores', users=get(key);if(users.some(u=>u.email===email))return error.textContent='An account with this email already exists.'; users.push({name:$('#name').value.trim(),email,password,createdAt:Date.now()});save(key,users);showToast('Account created — welcome to Enterprises Dashboard');openDashboard({name:$('#name').value.trim(),email},role)}else{const users=get(role==='admin'?'enterprise_admins':'enterprise_stores'),user=users.find(u=>u.email===email&&u.password===password);if(!user)return error.textContent='Email or password is incorrect.';showToast('Welcome back, '+user.name.split(' ')[0]);openDashboard(user,role)}});
function openDashboard(user,currentRole){authView.classList.add('hidden');dashView.classList.remove('hidden');const stores=get('enterprise_stores');if(currentRole==='admin'){dashView.innerHTML=`<div class="dashboard"><div class="dash-header"><div><span class="eyebrow accent">ADMIN WORKSPACE</span><h2>Good morning, ${user.name.split(' ')[0]}.</h2><p>Your network, at a glance.</p></div><button class="logout" id="logout">Log out ↗</button></div><div class="dash-grid"><div class="panel"><h3>Your stores</h3><p>Invite and manage the people running your locations.</p><div id="store-list">${storeRows(stores)}</div><div class="add-store"><h3>Quick add a store</h3><p>Create store access with an email and a temporary password.</p><form id="store-form"><input id="store-name" placeholder="Store name" required><input id="store-email" type="email" placeholder="team@store.com" required><input id="store-pass" type="password" placeholder="Password (8+ chars)" required><button class="small-button">Add</button></form></div></div><div class="panel"><h3>Network overview</h3><div class="metric">${stores.length}</div><div class="metric-caption">active store${stores.length===1?'':'s'} connected</div><div class="metric" style="margin-top:35px">100%</div><div class="metric-caption">workspace health</div></div></div></div>`; $('#store-form').addEventListener('submit',addStore)}else{dashView.innerHTML=`<div class="dashboard"><div class="dash-header"><div><span class="eyebrow accent">STORE WORKSPACE</span><h2>${user.name.split(' ')[0]}'s workspace.</h2><p>Everything your team needs, in one place.</p></div><button class="logout" id="logout">Log out ↗</button></div><div class="dash-grid"><div class="panel"><h3>Today at a glance</h3><p>Welcome to your store dashboard. Your daily operations will appear here.</p><div class="metric">Ready</div><div class="metric-caption">store status</div></div><div class="panel"><h3>Signed in as</h3><div class="store-row"><div class="store-avatar">${user.name[0].toUpperCase()}</div><div><strong>${user.name}</strong><small>${user.email}</small></div><span class="badge">Active</span></div></div></div></div>`} $('#logout').addEventListener('click',()=>{dashView.classList.add('hidden');authView.classList.remove('hidden');showToast('You have been logged out')});}
function storeRows(stores){return stores.length?stores.map(s=>`<div class="store-row"><div class="store-avatar">${s.name[0].toUpperCase()}</div><div><strong>${s.name}</strong><small>${s.email}</small></div><span class="badge">Active</span></div>`).join(''):'<div class="empty">No stores yet. Add your first one below.</div>'}
function addStore(e){e.preventDefault();const name=$('#store-name').value.trim(),email=$('#store-email').value.trim().toLowerCase(),password=$('#store-pass').value;const stores=get('enterprise_stores');if(password.length<8)return showToast('Store password needs 8+ characters');if(stores.some(s=>s.email===email))return showToast('That store email already exists');stores.push({name,email,password});save('enterprise_stores',stores);showToast('Store access created');const list=$('#store-list');list.innerHTML=storeRows(stores);e.target.reset()}
setMode('login');