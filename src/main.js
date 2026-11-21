import flagsmith from '@flagsmith/flagsmith';
import './style.css';

const app = document.querySelector('#app');
const checks = [
  { id: 'ssh', title: 'SSH access', command: 'ssh user@your-linux-host', detail: 'Confirm you can authenticate to the Linux host with the intended account and key.' },
  { id: 'mesh', title: 'Private network path', command: 'tailscale status', detail: 'Check that the host is online in your private mesh network and the expected peer is reachable.' },
  { id: 'web', title: 'Web service health', command: 'systemctl status apache2', detail: 'Check that Apache is active. On RHEL-based systems, the service may be named httpd.' },
  { id: 'dns', title: 'DNS resolution', command: 'getent hosts your-hostname', detail: 'Confirm the hostname resolves to the expected address.' }
];
const state = { variant:'quick', connected:false, message:'Preview mode — add a Flagsmith client-side environment key to run the live experiment.', completed:new Set(), conversionSent:false };
function visitorId() {
  const key='asir-infra-preflight-visitor';
  try { let id=localStorage.getItem(key); if(!id){id='visitor-'+(crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random().toString(36).slice(2));localStorage.setItem(key,id);} return id; }
  catch { return 'visitor-session-'+Date.now()+'-'+Math.random().toString(36).slice(2); }
}
const identity=visitorId();
const escapeHtml=(v)=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function render(){
  const guided=state.variant==='guided', count=state.completed.size, percent=Math.round(count/checks.length*100);
  app.innerHTML=`
  <div class="shell"><header class="topbar"><a class="brand" href="#top"><span class="brand-mark">A</span><span>ASIR<span class="muted">.INFRA</span></span></a><div class="top-meta"><span class="pulse"></span> EXPERIMENT LAB / REMOTE LINUX</div><a class="portfolio" href="https://your-high-lord.github.io/remote-linux-infrastructure-lab/" target="_blank" rel="noreferrer">Portfolio ↗</a></header>
  <main id="top"><section class="hero"><div class="eyebrow">INFRASTRUCTURE OPERATIONS / PREFLIGHT 001</div><h1>Know your infrastructure<br><span>before you ship.</span></h1><p class="hero-copy">A practical pre-deployment runbook for checking a remote Linux environment — access, network path, web service and DNS.</p><div class="hero-tags"><span>LINUX</span><span>SSH</span><span>TAILSCALE</span><span>APACHE</span><span>DNS</span></div></section>
  <section class="status-strip"><div><span class="label">SESSION ID</span><strong>${escapeHtml(identity.slice(0,22))}…</strong></div><div><span class="label">EXPERIMENT</span><strong>${state.connected?'FLAGSMITH CONNECTED':'LOCAL PREVIEW'}</strong></div><div><span class="label">EXPERIENCE</span><strong>${guided?'GUIDED RUNBOOK':'QUICK CHECKLIST'}</strong></div></section>
  <section class="workspace"><div class="panel main-panel"><div class="panel-heading"><div><div class="eyebrow">01 / READINESS WORKFLOW</div><h2>Preflight checks</h2></div><span class="counter">${String(count).padStart(2,'0')} <span>/ 04</span></span></div><div class="progress-track"><div class="progress-fill" style="width:${percent}%"></div></div><div class="progress-caption"><span>CHECKLIST PROGRESS</span><span>${percent}% COMPLETE</span></div><div class="steps">${checks.map((c,i)=>`
  <article class="step ${state.completed.has(c.id)?'done':''}"><div class="step-number">${String(i+1).padStart(2,'0')}</div><div class="step-body"><div class="step-title-row"><h3>${c.title}</h3><span class="step-state">${state.completed.has(c.id)?'VERIFIED':'PENDING'}</span></div>${guided?`<p>${c.detail}</p>`:''}<code>${c.command}</code>${guided?'<p class="hint">Run this command on your own host. This demo records your confirmation; it does not execute commands remotely.</p>':''}<button class="check-btn" data-step="${c.id}" ${state.completed.has(c.id)?'disabled':''}>${state.completed.has(c.id)?'✓ CHECKED':'MARK AS VERIFIED'}</button></div></article>`).join('')}</div>
  <div class="finish-row"><div><strong>${count===checks.length?'Preflight complete':'Ready when you are'}</strong><span>${count===checks.length?'Your checklist has been completed.':'Verify each item after checking it on your host.'}</span></div><button id="reset-btn" class="reset-btn">RESET RUN</button></div></div>
  <aside class="side-column"><div class="panel side-panel"><div class="eyebrow">02 / RUNBOOK NOTES</div><h2>${guided?'Why these checks?':'Quick mode'}</h2><p>${guided?'A green checklist is not a guarantee of security or availability. It is a repeatable starting point before a deployment or troubleshooting session.':'Use the commands as a quick reminder. The guided experience adds context for safer hand-offs.'}</p><div class="note-list"><div><span>01</span> Confirm identity and access first.</div><div><span>02</span> Verify the network path before the service.</div><div><span>03</span> Check service health and name resolution.</div></div></div>
  <div class="panel side-panel flag-panel"><div class="eyebrow">03 / EXPERIMENT STATUS</div><h2>Experience variant</h2><div class="variant-pill">${guided?'B / GUIDED':'A / QUICK'}</div><p id="flag-message">${escapeHtml(state.message)}</p><a href="https://docs.flagsmith.com/experimentation/run-an-experiment" target="_blank" rel="noreferrer">Experimentation docs ↗</a></div><div class="disclaimer">DEMO LIMITATION<br><span>This browser checklist does not SSH into a host, inspect a private network, or execute system commands. Users perform and confirm checks themselves.</span></div></aside></section></main>
  <footer><span>ASIR.INFRA / EXPERIMENT BUILD</span><span>BUILT FOR OPERATORS, NOT JUST DASHBOARDS.</span></footer></div>`;
  app.querySelectorAll('[data-step]').forEach(b=>b.addEventListener('click',()=>markStep(b.dataset.step)));
  app.querySelector('#reset-btn').addEventListener('click',resetRun);
}
function markStep(id){if(!checks.some(c=>c.id===id)||state.completed.has(id))return;state.completed.add(id);render();if(state.completed.size===checks.length)trackCompletion();}
function trackCompletion(){if(!state.connected||state.conversionSent)return;state.conversionSent=true;flagsmith.trackEvent('preflight_completed',{value:1,metadata:{variant:state.variant,checks_completed:checks.length}});flagsmith.flushEvents().catch(e=>console.warn('Flagsmith event flush failed:',e));}
function resetRun(){state.completed.clear();state.conversionSent=false;render();}
async function initialiseExperiment(){
  const environmentID=import.meta.env.VITE_FLAGSMITH_ENVIRONMENT_KEY;
  if(!environmentID){render();return;}
  try{await flagsmith.init({environmentID,enableEvents:true});await flagsmith.identify(identity);const flag=flagsmith.getExperimentFlag('preflight_experience');if(flag?.value)state.variant=String(flag.value).toLowerCase()==='guided'?'guided':'quick';state.connected=true;state.message=flag?.value?`Live assignment received: ${flag.value}.`:'Flagsmith connected. No live variant was returned; showing quick preview.';render();if(state.completed.size===checks.length)trackCompletion();}
  catch(e){console.error('Flagsmith initialisation failed:',e);state.message='Could not connect to Flagsmith. Running in local preview mode.';render();}
}
render();initialiseExperiment();
window.addEventListener('pagehide',()=>{if(state.connected)flagsmith.flushEvents().catch(()=>{});});
