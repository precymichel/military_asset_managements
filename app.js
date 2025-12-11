// SIMPLE DOM HELPER (same as your original)
const API = (path, opts={}) => fetch('http://localhost:4000' + path, opts).then(r => r.json());

function el(tag, attrs, ...children){
  const e = document.createElement(tag);
  if (attrs) for (const k of Object.keys(attrs)) e.setAttribute(k, attrs[k]);
  for (const c of children) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  return e;
}

/* ---------------------------------------------------------
   LOGIN SCREEN  (Bulma styled)
--------------------------------------------------------- */
function showLogin(){
  const root = document.getElementById('root');
  root.innerHTML = '';

  // Inputs with Bulma
  const u = el('input', { placeholder: 'Username', id:'u', class:'input' });
  const p = el('input', { placeholder: 'Password', id:'p', type:'password', class:'input' });

  const btn = el('button', { class:'button is-primary is-fullwidth mt-4' }, 'Login');

  const box = el('div', { class:'box' },
    el('h1', { class:'title is-4 has-text-centered' }, 'Military Asset Login'),

    el('div', { class:'field' },
      el('label', { class:'label' }, 'Username'),
      el('div', { class:'control' }, u)
    ),

    el('div', { class:'field' },
      el('label', { class:'label' }, 'Password'),
      el('div', { class:'control' }, p)
    ),

    el('div', { class:'field' },
      el('div', { class:'control' }, btn)
    )
  );

  const container = el('div', { class:'section' },
    el('div', { class:'container' },
      el('div', { class:'columns is-centered' },
        el('div', { class:'column is-4' }, box)
      )
    )
  );

  root.appendChild(container);

  // Login button logic
  btn.onclick = async () => {
    btn.classList.add("is-loading");

    const res = await fetch('http://localhost:4000/api/login', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ username: u.value, password: p.value })
    });

    const j = await res.json();
    btn.classList.remove("is-loading");

    if (j.token){
      localStorage.setItem('token', j.token);
      localStorage.setItem('user', JSON.stringify(j.user));
      showDashboard();
    } else {
      const error = el('div', { class:'notification is-danger mt-3' }, 'Login failed');
      box.appendChild(error);
      setTimeout(() => error.remove(), 2500);
    }
  };
}

/* ---------------------------------------------------------
   DASHBOARD SCREEN (Bulma styled)
--------------------------------------------------------- */
async function showDashboard(){
  const root = document.getElementById('root');
  root.innerHTML = '';

  const token = localStorage.getItem('token');

  const assets = await fetch('http://localhost:4000/api/assets', {
    headers:{ Authorization:'Bearer ' + token }
  }).then(r => r.json());

  // Count assets by type
  const byType = { vehicle:0, weapon:0, ammunition:0 };
  assets.forEach(a => {
    if (byType[a.equipment_type] !== undefined)
      byType[a.equipment_type] += (a.quantity || 0);
  });

  /* -------- HEADER -------- */
  const header = el('div', { class:'level' },
    el('div', { class:'level-left' },
      el('h2', { class:'title is-4' }, 'Dashboard')
    ),
    el('div', { class:'level-right' },
      el('button', { id:'logout', class:'button is-danger' }, 'Logout')
    )
  );

  /* -------- STAT CARDS -------- */
  const statCards = el('div', { class:'columns' },

    el('div', { class:'column' },
      el('div', { class:'box has-background-info has-text-white' },
        el('p', { class:'title is-3' }, String(byType.vehicle)),
        el('p', { class:'subtitle' }, 'Vehicles')
      )
    ),

    el('div', { class:'column' },
      el('div', { class:'box has-background-success has-text-white' },
        el('p', { class:'title is-3' }, String(byType.weapon)),
        el('p', { class:'subtitle' }, 'Weapons')
      )
    ),

    el('div', { class:'column' },
      el('div', { class:'box has-background-warning has-text-dark' },
        el('p', { class:'title is-3' }, String(byType.ammunition)),
        el('p', { class:'subtitle' }, 'Ammunition')
      )
    )
  );

  /* -------- ASSET TABLE -------- */
  const table = el('table', { class:'table is-fullwidth is-striped is-hoverable' });
  const thead = el('thead', {},
    el('tr', {},
      el('th', {}, 'ID'),
      el('th', {}, 'Name'),
      el('th', {}, 'Type'),
      el('th', {}, 'Base'),
      el('th', {}, 'Qty')
    )
  );

  const tbody = el('tbody');
  assets.forEach(a => {
    tbody.appendChild(el('tr', {},
      el('td', {}, String(a.id)),
      el('td', {}, a.name),
      el('td', {}, a.equipment_type),
      el('td', {}, a.base),
      el('td', {}, String(a.quantity))
    ));
  });

  table.appendChild(thead);
  table.appendChild(tbody);

  /* -------- MAIN PAGE LAYOUT -------- */
  const page = el('div', { class:'section' },
    el('div', { class:'container' },
      header,
      statCards,
      el('div', { class:'box mt-4' }, table),
      el('button', { id:'purchase-btn', class:'button is-link mt-4' }, 'Add Purchase')
    )
  );

  root.appendChild(page);

  document.getElementById('logout').onclick = () => {
    localStorage.clear();
    showLogin();
  };

  document.getElementById('purchase-btn').onclick = () => showPurchaseForm();
}

/* ---------------------------------------------------------
   PURCHASE FORM SCREEN (Bulma styled)
--------------------------------------------------------- */
function showPurchaseForm(){
  const root = document.getElementById('root');
  root.innerHTML = '';

  const aId = el('input', { class:'input', placeholder:'Asset ID' });
  const qty = el('input', { class:'input', placeholder:'Quantity' });
  const desc = el('input', { class:'input', placeholder:'Description' });

  const submitBtn = el('button', { class:'button is-primary mt-3' }, 'Submit');
  const backBtn = el('button', { class:'button is-light mt-3 ml-2' }, 'Back');

  const box = el('div', { class:'box' },
    el('h2', { class:'title is-4' }, 'Add Purchase'),

    el('div', { class:'field' },
      el('label', { class:'label' }, 'Asset ID'),
      el('div', { class:'control' }, aId)
    ),

    el('div', { class:'field' },
      el('label', { class:'label' }, 'Quantity'),
      el('div', { class:'control' }, qty)
    ),

    el('div', { class:'field' },
      el('label', { class:'label' }, 'Description'),
      el('div', { class:'control' }, desc)
    ),

    el('div', { class:'buttons' },
      submitBtn,
      backBtn
    )
  );

  root.appendChild(
    el('div', { class:'section' },
      el('div', { class:'container' },
        el('div', { class:'columns is-centered' },
          el('div', { class:'column is-5' }, box)
        )
      )
    )
  );

  submitBtn.onclick = async () => {
    const token = localStorage.getItem('token');

    const res = await fetch('http://localhost:4000/api/purchases', {
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'Authorization':'Bearer '+token
      },
      body: JSON.stringify({
        asset_id: parseInt(aId.value),
        quantity: parseInt(qty.value),
        description: desc.value
      })
    });

    const j = await res.json();

    const note = el('div', { class:'notification is-primary mt-3' }, JSON.stringify(j));
    box.appendChild(note);
    setTimeout(()=> note.remove(), 3000);

    showDashboard();
  };

  backBtn.onclick = () => showDashboard();
}

/* ---------------------------------------------------------
   START APP
--------------------------------------------------------- */
showLogin();
