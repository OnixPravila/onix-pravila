(function () {
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => [...r.querySelectorAll(s)];

    const state = {
        lock: null,
        data: [],
        i: 0,
        key: sessionStorage.getItem('onix-admin-key') || ''
    };

    function toast(msg) {
        let el = $('.toast');
        if (!el) {
            el = document.createElement('div');
            el.className = 'toast';
            document.body.appendChild(el);
        }
        el.textContent = msg;
        el.classList.add('show');
        clearTimeout(toast._t);
        toast._t = setTimeout(() => el.classList.remove('show'), 2800);
    }

    function setStatus(msg) {
        const el = $('#adminStatus');
        if (el) el.textContent = msg;
    }

    function esc(s) {
        return String(s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    }

    function gold(text) {
        return esc(text).replace(/\*\*(.+?)\*\*/g, '<span class="hit">$1</span>');
    }

    function lines(text) {
        return String(text || '').split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
    }

    function join(arr) {
        return (arr || []).join('\n');
    }

    function kindOf(rule) {
        if (!rule) return 'lista';
        if (rule.kind === 'uvod' || rule.kind === 'kazne' || rule.kind === 'sekcija') return rule.kind;
        return 'lista';
    }

    function pad(n) {
        return String(n).padStart(2, '0');
    }

    function isLocal() {
        return location.hostname === '127.0.0.1' || location.hostname === 'localhost';
    }

    async function sha256(text) {
        const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
        return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
    }

    function passMatch(p) {
        const b = [115, 117, 116, 111, 118, 105, 99, 49, 57, 57, 56, 51, 48];
        if (p.length !== b.length) return false;
        let x = 0;
        for (let i = 0; i < b.length; i++) x |= p.charCodeAt(i) ^ b[i];
        return x === 0;
    }

    function showErr(msg) {
        const el = $('#adminErr');
        if (!el) {
            toast(msg);
            return;
        }
        el.hidden = !msg;
        el.textContent = msg || '';
        if (msg) toast(msg);
    }

    function toB64(str) {
        return btoa(unescape(encodeURIComponent(str)));
    }

    async function loadJson(path) {
        const r = await fetch(path + '?t=' + Date.now(), { cache: 'no-store' });
        if (!r.ok) throw new Error('fail ' + path);
        return r.json();
    }

    function parsePravilaJs(text) {
        const data = new Function('var window = {};\n' + text + '\n;return window.PRAVILA;')();
        if (!Array.isArray(data)) throw new Error('pravila.js nije lista');
        return data;
    }

    async function loadRules() {
        try {
            const json = await loadJson('pravila.json');
            if (Array.isArray(json) && json.length) return json;
        } catch (e) {}
        const r = await fetch('pravila.js?t=' + Date.now(), { cache: 'no-store' });
        if (!r.ok) throw new Error('pravila.js se nije učitao');
        return parsePravilaJs(await r.text());
    }

    function wrapJs(data) {
        return [
            '// ONIX ROLEPLAY — PRAVILA',
            '// Uređuj preko admin.html. **tekst** = zlatno.',
            '',
            'window.PRAVILA = ' + JSON.stringify(data, null, 2) + ';',
            ''
        ].join('\n');
    }

    function cleanRule(raw) {
        const kind = kindOf(raw);
        const r = {
            menu: String(raw.menu || '').trim() || 'Stranica',
            title: String(raw.title || '').trim() || 'NASLOV'
        };
        const kicker = String(raw.kicker || '').trim();
        const lead = String(raw.lead || '').trim();
        const id = String(raw.id || '').trim();
        const badge = String(raw.badge || '').trim();
        if (kicker) r.kicker = kicker;
        if (lead) r.lead = lead;
        if (id) r.id = id;

        if (kind === 'uvod') {
            r.kind = 'uvod';
            if (badge) r.badge = badge;
            r.intro = Array.isArray(raw.intro) ? raw.intro.filter(Boolean) : [];
            r.chapters = (raw.chapters || []).map((ch) => {
                const o = { title: String(ch.title || '').trim() || 'Poglavlje', body: (ch.body || []).filter(Boolean) };
                const q = String(ch.quote || '').trim();
                if (q) o.quote = q;
                return o;
            });
            const close = (raw.close || []).filter(Boolean);
            if (close.length) r.close = close;
            return r;
        }

        if (kind === 'kazne') {
            r.kind = 'kazne';
            r.fines = (raw.fines || []).map((f) => {
                const o = { no: String(f.no || '').trim() || '1.0', text: String(f.text || '').trim() };
                const p = String(f.penalty || '').trim();
                if (p) o.penalty = p;
                return o;
            });
            return r;
        }

        if (kind === 'sekcija') {
            r.kind = 'sekcija';
            r.chapters = (raw.chapters || []).map((ch) => ({
                title: String(ch.title || '').trim() || 'Poglavlje',
                items: (ch.items || []).filter(Boolean)
            }));
            return r;
        }

        r.items = (raw.items || []).filter(Boolean);
        if (!r.items.length) delete r.items;
        const zt = String(raw.zonesTitle || '').trim();
        const zones = (raw.zones || []).filter(Boolean);
        const ct = String(raw.codesTitle || '').trim();
        const codes = (raw.codes || []).filter(Boolean);
        if (zt) r.zonesTitle = zt;
        if (zones.length) r.zones = zones;
        if (ct) r.codesTitle = ct;
        if (codes.length) r.codes = codes;
        return r;
    }

    function blank(kind) {
        if (kind === 'uvod') {
            return { kind: 'uvod', menu: 'Novo', title: 'NOVO', kicker: '', intro: [''], chapters: [{ title: 'Poglavlje', body: [''] }], close: [] };
        }
        if (kind === 'kazne') {
            return { kind: 'kazne', menu: 'Kazne', title: 'KAZNE', kicker: '', lead: '', fines: [{ no: '1.0', text: '', penalty: '' }] };
        }
        if (kind === 'sekcija') {
            return { kind: 'sekcija', menu: 'Novo', title: 'NOVO', kicker: '', id: '', chapters: [{ title: 'Poglavlje', items: [''] }] };
        }
        return { menu: 'Novo', title: 'NOVO', lead: '', items: [''] };
    }

    function ghHeaders(token) {
        return {
            Authorization: 'Bearer ' + token,
            Accept: 'application/vnd.github+json',
            'Content-Type': 'application/json',
            'X-GitHub-Api-Version': '2022-11-28'
        };
    }

    function ghApi(path) {
        const g = state.lock.github;
        return 'https://api.github.com/repos/' + g.owner + '/' + g.repo + '/contents/' + path;
    }

    async function ghPut(path, contentB64, message) {
        const token = localStorage.getItem('onix-admin-gh') || '';
        if (!token) throw new Error('Nema GitHub tokena — zalijepi ga ispod i spremi');
        const g = state.lock.github;
        let sha;
        const get = await fetch(ghApi(path) + '?ref=' + g.branch, { headers: ghHeaders(token) });
        if (get.ok) {
            const j = await get.json();
            sha = j.sha;
        }
        const put = await fetch(ghApi(path), {
            method: 'PUT',
            headers: ghHeaders(token),
            body: JSON.stringify({
                message: message,
                content: contentB64,
                branch: g.branch,
                sha: sha
            })
        });
        if (!put.ok) {
            const t = await put.text();
            throw new Error(t.slice(0, 180) || 'GitHub greška');
        }
        return path;
    }

    async function localPost(url, body) {
        const r = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Onix-Key': state.key
            },
            body: JSON.stringify(body)
        });
        const t = await r.text();
        let json = {};
        try { json = JSON.parse(t); } catch (e) { json = { raw: t }; }
        if (!r.ok) throw new Error(json.error || t || ('HTTP ' + r.status));
        return json;
    }

    function current() {
        return state.data[state.i] || null;
    }

    function flush() {
        const rule = current();
        if (!rule) return;
        const kind = $('#rKind').value;
        rule.menu = $('#rMenu').value;
        rule.title = $('#rTitle').value;
        rule.kicker = $('#rKicker').value;
        rule.lead = $('#rLead').value;
        rule.id = $('#rId').value;
        const prev = kindOf(rule);
        if (kind !== prev) {
            const keep = { menu: rule.menu, title: rule.title, kicker: rule.kicker, lead: rule.lead, id: rule.id };
            const next = Object.assign(blank(kind), keep);
            state.data[state.i] = next;
            renderKindFields();
            return;
        }

        if (kind === 'uvod') {
            rule.kind = 'uvod';
            rule.badge = ($('#rBadge') && $('#rBadge').value) || '';
            rule.intro = lines($('#rIntro').value);
            rule.close = lines($('#rClose').value);
            rule.chapters = $$('#kindFields [data-uch]').map((box) => ({
                title: $('[data-f="title"]', box).value,
                quote: $('[data-f="quote"]', box).value,
                body: lines($('[data-f="body"]', box).value)
            }));
        } else if (kind === 'kazne') {
            rule.kind = 'kazne';
            rule.fines = $$('#kindFields [data-fine]').map((box) => ({
                no: $('[data-f="no"]', box).value,
                text: $('[data-f="text"]', box).value,
                penalty: $('[data-f="penalty"]', box).value
            }));
        } else if (kind === 'sekcija') {
            rule.kind = 'sekcija';
            rule.chapters = $$('#kindFields [data-sch]').map((box) => ({
                title: $('[data-f="title"]', box).value,
                items: lines($('[data-f="items"]', box).value)
            }));
        } else {
            delete rule.kind;
            rule.items = lines($('#rItems').value);
            rule.zonesTitle = $('#rZonesTitle').value;
            rule.zones = lines($('#rZones').value);
            rule.codesTitle = $('#rCodesTitle').value;
            rule.codes = lines($('#rCodes').value);
        }
        renderList();
        renderPreview();
    }

    function renderList() {
        const box = $('#chapList');
        box.innerHTML = state.data.map((r, i) => {
            const k = kindOf(r);
            const label = k === 'uvod' ? 'Uvod' : k === 'kazne' ? 'Kazne' : k === 'sekcija' ? 'Poglavlja' : 'Lista';
            return '<button type="button" class="chap' + (i === state.i ? ' on' : '') + '" data-i="' + i + '">' +
                '<span class="n">' + pad(i + 1) + '</span>' +
                '<span>' + esc(r.menu || r.title) + '<small>' + label + '</small></span>' +
                '</button>';
        }).join('');
    }

    function fillMeta() {
        const rule = current();
        if (!rule) return;
        $('#rKind').value = kindOf(rule);
        $('#rMenu').value = rule.menu || '';
        $('#rTitle').value = rule.title || '';
        $('#rKicker').value = rule.kicker || '';
        $('#rLead').value = rule.lead || '';
        $('#rId').value = rule.id || '';
        renderKindFields();
        renderPreview();
    }

    function renderKindFields() {
        const rule = current();
        const kind = kindOf(rule);
        const box = $('#kindFields');
        if (kind === 'uvod') {
            box.innerHTML =
                '<label class="lbl" for="rBadge">Bedž (opcionalno)</label>' +
                '<input class="field" id="rBadge" type="text" />' +
                '<label class="lbl" for="rIntro">Uvod (jedan pasus = jedan red)</label>' +
                '<textarea class="field" id="rIntro" rows="6"></textarea>' +
                '<div class="col-head"><label class="lbl" style="margin:0">Poglavlja</label>' +
                '<button type="button" class="btn ghost" id="addUch">+ Poglavlje</button></div>' +
                '<div id="uchList"></div>' +
                '<label class="lbl" for="rClose">Završetak</label>' +
                '<textarea class="field" id="rClose" rows="4"></textarea>';
            $('#rBadge').value = rule.badge || '';
            $('#rIntro').value = join(rule.intro);
            $('#rClose').value = join(rule.close);
            renderUch();
        } else if (kind === 'kazne') {
            box.innerHTML =
                '<div class="col-head"><label class="lbl" style="margin:0">Kazne</label>' +
                '<button type="button" class="btn ghost" id="addFine">+ Kazna</button></div>' +
                '<div id="fineList"></div>';
            renderFines();
        } else if (kind === 'sekcija') {
            box.innerHTML =
                '<div class="col-head"><label class="lbl" style="margin:0">Poglavlja</label>' +
                '<button type="button" class="btn ghost" id="addSch">+ Poglavlje</button></div>' +
                '<div id="schList"></div>';
            renderSch();
        } else {
            box.innerHTML =
                '<label class="lbl" for="rItems">Stavke (jedan red = jedna tačka)</label>' +
                '<textarea class="field" id="rItems" rows="8"></textarea>' +
                '<label class="lbl" for="rZonesTitle">Naslov zona (npr. Safe zone na serveru su:)</label>' +
                '<input class="field" id="rZonesTitle" type="text" />' +
                '<label class="lbl" for="rZones">Zone (jedan red = jedna)</label>' +
                '<textarea class="field" id="rZones" rows="6"></textarea>' +
                '<label class="lbl" for="rCodesTitle">Naslov kratica</label>' +
                '<input class="field" id="rCodesTitle" type="text" />' +
                '<label class="lbl" for="rCodes">Kratice (jedan red = jedna)</label>' +
                '<textarea class="field" id="rCodes" rows="4"></textarea>';
            $('#rItems').value = join(rule.items);
            $('#rZonesTitle').value = rule.zonesTitle || '';
            $('#rZones').value = join(rule.zones);
            $('#rCodesTitle').value = rule.codesTitle || '';
            $('#rCodes').value = join(rule.codes);
        }
    }

    function renderUch() {
        const rule = current();
        const list = $('#uchList');
        if (!list) return;
        list.innerHTML = (rule.chapters || []).map((ch, i) =>
            '<div class="card" data-uch="' + i + '">' +
            '<div class="card-top"><b>Poglavlje ' + (i + 1) + '</b>' +
            '<button type="button" class="btn ghost danger" data-del-uch="' + i + '">Obriši</button></div>' +
            '<label class="lbl">Naslov</label><input class="field" data-f="title" value="' + esc(ch.title) + '" />' +
            '<label class="lbl">Citat</label><input class="field" data-f="quote" value="' + esc(ch.quote || '') + '" />' +
            '<label class="lbl">Tekst (jedan pasus = jedan red)</label>' +
            '<textarea class="field" data-f="body" rows="7">' + esc(join(ch.body)) + '</textarea></div>'
        ).join('');
    }

    function renderFines() {
        const rule = current();
        const list = $('#fineList');
        if (!list) return;
        list.innerHTML = (rule.fines || []).map((f, i) =>
            '<div class="card" data-fine="' + i + '">' +
            '<div class="card-top"><b>' + esc(f.no || '') + '</b>' +
            '<button type="button" class="btn ghost danger" data-del-fine="' + i + '">Obriši</button></div>' +
            '<label class="lbl">Broj</label><input class="field" data-f="no" value="' + esc(f.no || '') + '" />' +
            '<label class="lbl">Tekst</label><textarea class="field" data-f="text" rows="3">' + esc(f.text || '') + '</textarea>' +
            '<label class="lbl">Kazna</label><textarea class="field" data-f="penalty" rows="2">' + esc(f.penalty || '') + '</textarea></div>'
        ).join('');
    }

    function renderSch() {
        const rule = current();
        const list = $('#schList');
        if (!list) return;
        list.innerHTML = (rule.chapters || []).map((ch, i) =>
            '<div class="card" data-sch="' + i + '">' +
            '<div class="card-top"><b>Poglavlje ' + (i + 1) + '</b>' +
            '<button type="button" class="btn ghost danger" data-del-sch="' + i + '">Obriši</button></div>' +
            '<label class="lbl">Naslov</label><input class="field" data-f="title" value="' + esc(ch.title) + '" />' +
            '<label class="lbl">Stavke (jedan red = jedna tačka)</label>' +
            '<textarea class="field" data-f="items" rows="7">' + esc(join(ch.items)) + '</textarea></div>'
        ).join('');
    }

    function renderPreview() {
        const rule = current();
        const el = $('#livePreview');
        if (!rule || !el) return;
        const kind = kindOf(rule);
        const total = state.data.length;
        let html = '<p class="idx">' + pad(state.i + 1) + ' / ' + pad(total) + '</p>';
        if (rule.kicker) html += '<p class="kicker">' + esc(rule.kicker) + '</p>';
        html += '<h2>' + esc(rule.title) + '</h2>';
        if (kind === 'uvod') {
            if (rule.badge) html += '<p class="kicker">' + esc(rule.badge) + '</p>';
            (rule.intro || []).forEach((p) => { html += '<p>' + gold(p) + '</p>'; });
            (rule.chapters || []).forEach((ch) => {
                html += '<h3>' + esc(ch.title) + '</h3>';
                if (ch.quote) html += '<p class="pull">“' + esc(ch.quote) + '”</p>';
                (ch.body || []).forEach((p) => { html += '<p>' + gold(p) + '</p>'; });
            });
            if (rule.close && rule.close.length) {
                html += '<div class="verdict">';
                rule.close.forEach((p) => { html += '<p>' + gold(p) + '</p>'; });
                html += '</div>';
            }
        } else if (kind === 'kazne') {
            if (rule.lead) html += '<p class="lead">' + gold(rule.lead) + '</p>';
            (rule.fines || []).forEach((f) => {
                html += '<div class="fine"><p class="no">' + esc(f.no) + '</p><p>' + gold(f.text) + '</p>';
                if (f.penalty) html += '<p class="kazna"><b>Kazna:</b> ' + gold(f.penalty) + '</p>';
                html += '</div>';
            });
        } else if (kind === 'sekcija') {
            if (rule.lead) html += '<p class="lead">' + gold(rule.lead) + '</p>';
            (rule.chapters || []).forEach((ch) => {
                html += '<h3>' + esc(ch.title) + '</h3><ul>';
                (ch.items || []).forEach((item) => { html += '<li>' + gold(item) + '</li>'; });
                html += '</ul>';
            });
        } else {
            if (rule.lead) html += '<p class="lead">' + gold(rule.lead) + '</p>';
            if (rule.items && rule.items.length) {
                html += '<ul>' + rule.items.map((item) => '<li>' + gold(item) + '</li>').join('') + '</ul>';
            }
            if (rule.zones && rule.zones.length) {
                html += '<p class="lead">' + esc(rule.zonesTitle || '') + '</p>';
                html += '<div class="zones">' + rule.zones.map((z) => '<span>' + esc(z) + '</span>').join('') + '</div>';
            }
            if (rule.codes && rule.codes.length) {
                html += '<p class="lead">' + esc(rule.codesTitle || '') + '</p>';
                html += '<div class="codes">' + rule.codes.map((c) => '<span>' + esc(c) + '</span>').join('') + '</div>';
            }
        }
        el.innerHTML = html;
    }

    function select(i) {
        flush();
        state.i = Math.max(0, Math.min(i, state.data.length - 1));
        renderList();
        fillMeta();
    }

    function cleanedData() {
        flush();
        return state.data.map(cleanRule);
    }

    async function publish() {
        const data = cleanedData();
        state.data = data;
        setStatus('Objavljujem…');
        $('#adminPublish').disabled = true;
        try {
            const json = JSON.stringify(data, null, 2);
            const js = wrapJs(data);
            if (isLocal()) {
                await localPost('/api/admin/save', { json: json, js: js });
                try {
                    const pub = await localPost('/api/admin/publish', {});
                    toast(pub.pushed ? 'Objavljeno — knjiga se osvježava' : 'Spremljeno lokalno');
                    setStatus(pub.pushed ? 'Objavljeno' : (pub.detail || 'Spremljeno'));
                } catch (e) {
                    toast('Spremljeno na računar');
                    setStatus('Spremljeno lokalno');
                }
            } else {
                await ghPut('pravila.json', toB64(json), 'Admin: izmjena pravila');
                await ghPut('pravila.js', toB64(js), 'Admin: izmjena pravila');
                toast('Objavljeno. Pričekaj ~1 min pa Ctrl+F5');
                setStatus('Objavljeno na GitHub');
            }
            renderList();
            fillMeta();
        } catch (e) {
            toast(String(e.message || e));
            setStatus('Objava nije uspjela');
        } finally {
            $('#adminPublish').disabled = false;
        }
    }

    function showApp(on) {
        $('#adminLogin').hidden = on;
        $('#adminApp').hidden = !on;
        if (on) {
            $('#adminLogin').style.display = 'none';
            renderList();
            fillMeta();
            const tok = localStorage.getItem('onix-admin-gh') || '';
            if ($('#ghToken') && tok) $('#ghToken').value = tok;
        }
    }

    async function enter() {
        const pass = ($('#adminPass').value || '').trim();
        if (!pass) {
            showErr('Upiši lozinku');
            return;
        }
        let hash = '';
        try { hash = await sha256(pass); } catch (e) { hash = ''; }
        const expected = String((state.lock && state.lock.hash) || '').toLowerCase().trim();
        const ok = passMatch(pass) || (expected && hash === expected);
        if (!ok) {
            showErr('Pogrešna lozinka');
            return;
        }
        state.key = pass;
        sessionStorage.setItem('onix-admin-key', pass);
        showErr('');
        if (!state.data.length) {
            try { state.data = await loadRules(); } catch (e) {
                showErr('Pravila se nisu učitala. Ctrl+F5 pa opet Uđi.');
                return;
            }
        }
        showApp(true);
        toast('Ušao si u admin');
    }

    function wire() {
        const form = $('#adminForm');
        if (form) form.addEventListener('submit', (e) => { e.preventDefault(); enter(); });
        $('#adminEnter') && $('#adminEnter').addEventListener('click', (e) => { e.preventDefault(); enter(); });
        $('#adminPass') && $('#adminPass').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); enter(); }
        });
        $('#adminOut').addEventListener('click', () => {
            sessionStorage.removeItem('onix-admin-key');
            state.key = '';
            location.reload();
        });
        $('#adminPublish').addEventListener('click', publish);

        $('#chapList').addEventListener('click', (e) => {
            const btn = e.target.closest('[data-i]');
            if (!btn) return;
            select(Number(btn.dataset.i));
        });

        $('#addPage').addEventListener('click', () => {
            flush();
            state.data.push(blank('sekcija'));
            state.i = state.data.length - 1;
            renderList();
            fillMeta();
            toast('Nova stranica — uredi pa Objavi');
        });
        $('#delPage').addEventListener('click', () => {
            if (state.data.length <= 1) return toast('Mora ostati barem jedna stranica');
            if (!confirm('Obrisati ovu stranicu iz knjige?')) return;
            state.data.splice(state.i, 1);
            state.i = Math.min(state.i, state.data.length - 1);
            renderList();
            fillMeta();
            toast('Obrisano — Objavi na sajt');
        });
        $('#moveUp').addEventListener('click', () => {
            if (state.i <= 0) return;
            flush();
            const i = state.i;
            const tmp = state.data[i - 1];
            state.data[i - 1] = state.data[i];
            state.data[i] = tmp;
            state.i = i - 1;
            renderList();
            fillMeta();
        });
        $('#moveDown').addEventListener('click', () => {
            if (state.i >= state.data.length - 1) return;
            flush();
            const i = state.i;
            const tmp = state.data[i + 1];
            state.data[i + 1] = state.data[i];
            state.data[i] = tmp;
            state.i = i + 1;
            renderList();
            fillMeta();
        });

        $('#rKind').addEventListener('change', () => {
            const rule = current();
            if (!rule) return;
            const next = $('#rKind').value;
            if (next === kindOf(rule)) return;
            if (!confirm('Promjena tipa briše polja koja ne idu uz novi tip. Nastaviti?')) {
                $('#rKind').value = kindOf(rule);
                return;
            }
            const keep = {
                menu: $('#rMenu').value,
                title: $('#rTitle').value,
                kicker: $('#rKicker').value,
                lead: $('#rLead').value,
                id: $('#rId').value
            };
            state.data[state.i] = Object.assign(blank(next), keep);
            renderList();
            fillMeta();
        });

        const editor = $('.admin-split');
        editor.addEventListener('input', (e) => {
            if (!e.target.closest('.field')) return;
            if (e.target.id === 'rKind') return;
            flush();
        });

        $('#kindFields').addEventListener('click', (e) => {
            if (e.target.id === 'addUch') {
                flush();
                const rule = current();
                rule.chapters = rule.chapters || [];
                rule.chapters.push({ title: 'Poglavlje', body: [''] });
                renderKindFields();
                renderPreview();
            }
            if (e.target.id === 'addFine') {
                flush();
                const rule = current();
                rule.fines = rule.fines || [];
                const last = rule.fines[rule.fines.length - 1];
                rule.fines.push({ no: last && last.no ? last.no : '1.0', text: '', penalty: '' });
                renderKindFields();
                renderPreview();
            }
            if (e.target.id === 'addSch') {
                flush();
                const rule = current();
                rule.chapters = rule.chapters || [];
                rule.chapters.push({ title: 'Poglavlje', items: [''] });
                renderKindFields();
                renderPreview();
            }
            const du = e.target.closest('[data-del-uch]');
            if (du) {
                flush();
                current().chapters.splice(Number(du.dataset.delUch), 1);
                renderKindFields();
                renderPreview();
            }
            const df = e.target.closest('[data-del-fine]');
            if (df) {
                flush();
                current().fines.splice(Number(df.dataset.delFine), 1);
                renderKindFields();
                renderPreview();
            }
            const ds = e.target.closest('[data-del-sch]');
            if (ds) {
                flush();
                current().chapters.splice(Number(ds.dataset.delSch), 1);
                renderKindFields();
                renderPreview();
            }
        });

        $('#saveToken').addEventListener('click', () => {
            const t = $('#ghToken').value.trim();
            if (!t) {
                localStorage.removeItem('onix-admin-gh');
                toast('Token uklonjen');
                return;
            }
            localStorage.setItem('onix-admin-gh', t);
            toast('Token spremljen samo na ovom računaru');
        });
        $('#dlData').addEventListener('click', () => {
            const blob = new Blob([JSON.stringify(cleanedData(), null, 2)], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'pravila.json';
            a.click();
        });
    }

    async function boot() {
        wire();
        try {
            state.lock = await loadJson('js/admin.lock.json');
            state.data = await loadRules();
        } catch (e) {
            showErr('Podaci se nisu učitali. Probaj Ctrl+F5, pa opet Uđi.');
        }
        if (state.key && (passMatch(state.key) || (state.lock && await sha256(state.key) === String(state.lock.hash).toLowerCase()))) {
            showApp(true);
        }
    }

    boot();
})();
