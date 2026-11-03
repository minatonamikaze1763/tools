const API = 'https://server.nextdimensioncustoms.in', KEY = 'ndc_tools_panel_session';
const $ = id => document.getElementById(id);
const definitions = [
    {
        "id": "merge",
        "title": "Merge PDFs",
        "text": "Combine PDFs in your chosen file order.",
        "icon": "\u25a4",
        "category": "pdf",
        "accept": ".pdf",
        "single": false,
        "hint": "Choose two or more PDFs and arrange their order."
    },
    {
        "id": "extract",
        "title": "Extract PDF pages",
        "text": "Save only the pages you need in a new PDF.",
        "icon": "\u25a4",
        "category": "pdf",
        "accept": ".pdf",
        "single": true,
        "hint": "Choose one PDF. Encrypted PDFs must be unlocked before use."
    },
    {
        "id": "pdfcompress",
        "title": "Compress PDF",
        "text": "Reduce scanned PDF size with quality controls.",
        "icon": "\u25a4",
        "category": "pdf",
        "accept": ".pdf",
        "single": true,
        "hint": "Choose one PDF. Encrypted PDFs must be unlocked before use."
    },
    {
        "id": "pdfsplit",
        "title": "Split PDF",
        "text": "Save every page as a separate PDF.",
        "icon": "\u25a4",
        "category": "pdf",
        "accept": ".pdf",
        "single": true,
        "hint": "Choose one PDF. Encrypted PDFs must be unlocked before use."
    },
    {
        "id": "pdfrotate",
        "title": "Rotate PDF pages",
        "text": "Turn all or selected pages by 90, 180 or 270 degrees.",
        "icon": "\u25a4",
        "category": "pdf",
        "accept": ".pdf",
        "single": true,
        "hint": "Choose one PDF. Encrypted PDFs must be unlocked before use."
    },
    {
        "id": "pdfremove",
        "title": "Remove PDF pages",
        "text": "Delete selected pages and keep the rest.",
        "icon": "\u25a4",
        "category": "pdf",
        "accept": ".pdf",
        "single": true,
        "hint": "Choose one PDF. Encrypted PDFs must be unlocked before use."
    },
    {
        "id": "pdfreorder",
        "title": "Reorder PDF pages",
        "text": "Set a new page order without losing a page.",
        "icon": "\u25a4",
        "category": "pdf",
        "accept": ".pdf",
        "single": true,
        "hint": "Choose one PDF. Encrypted PDFs must be unlocked before use."
    },
    {
        "id": "pdfwatermark",
        "title": "Watermark PDF",
        "text": "Add a subtle text watermark to every page.",
        "icon": "\u25a4",
        "category": "pdf",
        "accept": ".pdf",
        "single": true,
        "hint": "Choose one PDF. Encrypted PDFs must be unlocked before use."
    },
    {
        "id": "pdfnumbers",
        "title": "Number PDF pages",
        "text": "Add sequential page numbers to your document.",
        "icon": "\u25a4",
        "category": "pdf",
        "accept": ".pdf",
        "single": true,
        "hint": "Choose one PDF. Encrypted PDFs must be unlocked before use."
    },
    {
        "id": "pdfimages",
        "title": "PDF to images",
        "text": "Export every page as a PNG, JPG or WEBP image.",
        "icon": "\u25a4",
        "category": "pdf",
        "accept": ".pdf",
        "single": true,
        "hint": "Choose one PDF. Encrypted PDFs must be unlocked before use."
    },
    {
        "id": "imagespdf",
        "title": "Images to PDF",
        "text": "Combine photos and scans into one A4 PDF.",
        "icon": "\u25a7",
        "category": "image",
        "accept": "image/jpeg,image/png,image/webp",
        "single": false,
        "hint": "Select JPG, PNG or WEBP images. Use the arrows to change file order."
    },
    {
        "id": "imagecompress",
        "title": "Compress images",
        "text": "Reduce image dimensions and JPEG file size.",
        "icon": "\u25a7",
        "category": "image",
        "accept": "image/jpeg,image/png,image/webp",
        "single": false,
        "hint": "Select JPG, PNG or WEBP images. Use the arrows to change file order."
    },
    {
        "id": "imageresize",
        "title": "Resize images",
        "text": "Set pixel dimensions with optional aspect-ratio lock.",
        "icon": "\u25a7",
        "category": "image",
        "accept": "image/jpeg,image/png,image/webp",
        "single": false,
        "hint": "Select JPG, PNG or WEBP images. Use the arrows to change file order."
    },
    {
        "id": "imageconvert",
        "title": "Convert images",
        "text": "Convert between JPG, PNG and WEBP formats.",
        "icon": "\u25a7",
        "category": "image",
        "accept": "image/jpeg,image/png,image/webp",
        "single": false,
        "hint": "Select JPG, PNG or WEBP images. Use the arrows to change file order."
    },
    {
        "id": "imagerotate",
        "title": "Rotate images",
        "text": "Rotate photos and scans in right-angle steps.",
        "icon": "\u25a7",
        "category": "image",
        "accept": "image/jpeg,image/png,image/webp",
        "single": false,
        "hint": "Select JPG, PNG or WEBP images. Use the arrows to change file order."
    },
    {
        "id": "imagecrop",
        "title": "Crop images",
        "text": "Keep a precise rectangular area using pixel coordinates.",
        "icon": "\u25a7",
        "category": "image",
        "accept": "image/jpeg,image/png,image/webp",
        "single": false,
        "hint": "Select JPG, PNG or WEBP images. Use the arrows to change file order."
    }
];
let token = sessionStorage.getItem(KEY) || '', engine = null, active = null, selected = [], busy = false, cancelled = false, urls = [];
function status(text) { $('authStatus').textContent = text; }
async function request(path, options = {}) { const r = await fetch(API + path, { ...options, headers: { ...(token ? { Authorization: 'Bearer ' + token } : {}), ...options.headers } }); if (!r.ok) { let data; try { data = await r.json(); } catch { } const e = Error(data?.error || 'Service unavailable. Please try again.'); e.status = r.status; throw e; } return r; }
function lock() { engine = null; token = ''; sessionStorage.removeItem(KEY); $('loginForm').hidden = false; $('logout').hidden = true; $('membership').textContent = '16 tools. One workspace.'; }
async function verify() { const data = await (await request('/api/tools/access')).json(); $('membership').textContent = `${data.planName} bonus · ${data.maxDevices} device login${data.maxDevices === 1 ? '' : 's'}`; $('loginForm').hidden = true; $('logout').hidden = false; $('access').querySelector('h2').textContent = 'Your bonus toolkit is unlocked.'; $('access').querySelector('p').textContent = 'Choose a tool below. Your active subscription is checked before each operation.'; return data; }
$('loginForm').addEventListener('submit', async e => { e.preventDefault(); $('loginButton').disabled = true; status('Checking your membership…'); try { const r = await request('/api/tools/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: $('username').value.trim(), password: $('password').value }) }); const data = await r.json(); token = data.token; if (!token) throw Error('No session returned. Please contact support.'); await verify(); sessionStorage.setItem(KEY, token); $('password').value = ''; } catch (e) { lock(); status(e.message); } finally { $('loginButton').disabled = false; } });
$('logout').onclick = async () => { cancelled = true; try { if (token) await request('/api/tools/auth/logout', { method: 'POST' }); } catch { } lock(); $('access').querySelector('h2').textContent = 'One account. More possibilities.'; $('access').querySelector('p').textContent = 'Sign in with your Customer Admin Panel credentials to unlock the toolkit.'; status('Signed out of this tools workspace.'); $('editor').hidden = true; clearDownloads(); };
for (const [i, d] of definitions.entries()) { const b = document.createElement('button'); b.type = 'button'; b.className = 'tool'; b.dataset.category = d.category; b.dataset.search = (d.title + ' ' + d.text).toLowerCase(); b.innerHTML = `<span class="icon" aria-hidden="true">${d.icon}</span><span class="num">${String(i + 1).padStart(2, '0')}</span><h3>${d.title}</h3><p>${d.text}</p><span class="link">OPEN TOOL ↗</span>`; b.onclick = () => openTool(d); $('tools').append(b); }
function clearDownloads() { urls.forEach(URL.revokeObjectURL); urls = []; $('downloads').replaceChildren(); }
function list() { const root = $('fileList'); root.replaceChildren(); selected.forEach((f, i) => { const li = document.createElement('li'); const text = document.createElement('span'); text.textContent = f.name + ' · ' + format(f.size) + ' '; li.append(text); if (f.type.startsWith('image/')) createImageBitmap(f).then(bitmap => { text.textContent = f.name + ' · ' + format(f.size) + ' · ' + bitmap.width + ' × ' + bitmap.height + ' px '; bitmap.close(); }).catch(() => { }); for (const [label, delta] of [['↑', -1], ['↓', 1], ['Remove', 0]]) { const b = document.createElement('button'); b.type = 'button'; b.textContent = label; b.disabled = busy || (delta < 0 && i === 0) || (delta > 0 && i === selected.length - 1); b.setAttribute('aria-label', label === 'Remove' ? 'Remove ' + f.name : label === '↑' ? 'Move ' + f.name + ' up' : 'Move ' + f.name + ' down'); b.onclick = () => { if (delta) [selected[i], selected[i + delta]] = [selected[i + delta], selected[i]]; else selected.splice(i, 1); list(); }; li.append(b); } root.append(li); }); }
function format(n) { return n < 1024 * 1024 ? (n / 1024).toFixed(1) + ' KB' : (n / 1024 / 1024).toFixed(2) + ' MB'; }
async function openTool(d) {
    if (busy) return; if (!token) { status('Sign in to unlock ' + d.title + '.'); $('access').scrollIntoView({ behavior: 'smooth' }); $('username').focus(); return; } try { await verify(); } catch (e) { lock(); status(e.message); return; } active = d; selected = []; clearDownloads(); $('files').value = ''; $('files').accept = d.accept; $('files').multiple = !d.single; $('toolTitle').textContent = d.title; $('toolDescription').textContent = d.text; $('fileHint').textContent = d.hint; $('processStatus').textContent = ''; $('options').replaceChildren();
    const field = (label, id, value = '', type = 'text', extra = '') => `<label>${label}<input id="${id}" type="${type}" value="${value}" ${extra}></label>`;
    const formatControl = '<label>Output format<select id="format"><option value="image/png">PNG · preserves transparency</option><option value="image/jpeg">JPG · white background</option><option value="image/webp">WEBP</option></select></label>';
    const qualityControl = '<label>Quality (JPG / WEBP)<select id="quality"><option value="0.9">High · 90%</option><option value="0.7" selected>Balanced · 70%</option><option value="0.5">Small · 50%</option></select></label>';
    const dimensionControl = '<label>Maximum dimension<select id="dimension"><option value="2200">2200 pixels</option><option value="1600" selected>1600 pixels</option><option value="1200">1200 pixels</option></select></label>';
    const rotationControl = '<label>Clockwise rotation<select id="angle"><option value="90">90°</option><option value="180">180°</option><option value="270">270°</option></select></label>';
    let controls = '';
    if (['extract', 'pdfremove', 'pdfreorder', 'pdfrotate'].includes(d.id)) controls += field(d.id === 'pdfremove' ? 'Pages to remove' : d.id === 'pdfreorder' ? 'New order (every page exactly once)' : d.id === 'pdfrotate' ? 'Pages to rotate (blank = all)' : 'Pages to extract', 'pages', d.id === 'pdfrotate' ? '' : '1', 'text', 'placeholder="e.g. 1, 3-5, 8"');
    if (['imagecompress', 'pdfcompress', 'pdfimages'].includes(d.id)) controls += qualityControl + dimensionControl;
    if (['imageconvert', 'imageresize', 'imagerotate', 'imagecrop', 'pdfimages'].includes(d.id)) controls += formatControl;
    if (['imageconvert', 'imageresize', 'imagerotate', 'imagecrop'].includes(d.id)) controls += qualityControl;
    if (['pdfrotate', 'imagerotate'].includes(d.id)) controls += rotationControl;
    if (d.id === 'imageresize') controls += field('Output width (pixels)', 'width', '1200', 'number', 'min="1" max="8000" required') + field('Output height (when unlocked)', 'height', '800', 'number', 'min="1" max="8000" required') + '<label class="check-option"><input type="checkbox" id="keepAspect" checked> Keep original aspect ratio (width controls size)</label>';
    if (d.id === 'imagecrop') controls += field('Left X (pixels)', 'cropX', '0', 'number', 'min="0" required') + field('Top Y (pixels)', 'cropY', '0', 'number', 'min="0" required') + field('Crop width (pixels)', 'width', '400', 'number', 'min="1" required') + field('Crop height (pixels)', 'height', '400', 'number', 'min="1" required');
    if (d.id === 'pdfwatermark') controls += field('Watermark text (English letters / numbers)', 'text', 'CONFIDENTIAL', 'text', 'maxlength="120" required');
    if (d.id === 'pdfnumbers') controls += field('Start numbering at', 'start', '1', 'number', 'min="1" max="999999" required');
    $('options').innerHTML = controls;
    $('toolNote').textContent = d.id === 'pdfcompress' ? 'Compression creates image-only PDF pages. Searchable text, links, forms, tags and digital signatures are not preserved. Keep the original; a smaller size is not guaranteed.' : d.id === 'imagecrop' ? 'Coordinates start at the top-left of the original image. The same crop applies to every selected image; it must fit inside each image.' : d.id === 'pdfreorder' ? 'Example: 3, 1, 2 for a three-page PDF. Enter every page exactly once.' : d.id === 'pdfsplit' || d.id === 'pdfimages' ? 'Download each output separately, or use Download all as ZIP.' : d.category === 'pdf' ? 'Keep the original: modifying a PDF can invalidate digital signatures. Encrypted files must be unlocked first.' : 'Your originals stay unchanged. JPG uses a white background; PNG and WEBP preserve transparency. Size reduction varies.';

    list(); $('editor').hidden = false; $('editor').scrollIntoView({ behavior: 'smooth' });
}
function acceptFiles(files) { if (busy || !active) return; selected = [...files]; $('processStatus').textContent = ''; if (active.single && selected.length !== 1) { selected = []; $('processStatus').textContent = 'Please select one PDF.'; } list(); }
$('files').onchange = e => acceptFiles(e.target.files); $('drop').ondragover = e => e.preventDefault(); $('drop').ondrop = e => { e.preventDefault(); acceptFiles(e.dataTransfer.files); }; $('closeEditor').onclick = () => { if (!busy) { $('editor').hidden = true; clearDownloads(); } }; $('cancel').onclick = () => { cancelled = true; $('processStatus').textContent = 'Cancelling after the current step…'; };
$('run').onclick = async () => { if (busy) return; if (!selected.length) { $('processStatus').textContent = 'Choose files first.'; return; } for (const input of $('options').querySelectorAll('input')) if (!input.reportValidity()) return; busy = true; cancelled = false; $('run').disabled = true; $('files').disabled = true; $('cancel').hidden = false; list(); clearDownloads(); try { await verify(); if (!engine) { const r = await request('/api/tools/engine.js'); const url = URL.createObjectURL(new Blob([await r.text()], { type: 'text/javascript' })); try { engine = await import(url); } finally { URL.revokeObjectURL(url); } } const results = await engine.process(active.id, selected, { pages: $('pages')?.value, text: $('text')?.value, start: Number($('start')?.value || 1), angle: Number($('angle')?.value || 90), width: Number($('width')?.value || 0), height: Number($('height')?.value || 0), cropX: Number($('cropX')?.value || 0), cropY: Number($('cropY')?.value || 0), keepAspect: $('keepAspect')?.checked !== false, format: $('format')?.value || 'image/png', quality: Number($('quality')?.value || .7), dimension: Number($('dimension')?.value || 1600), onProgress: t => $('processStatus').textContent = t, cancelled: () => cancelled }); if (cancelled) throw Error('Processing cancelled. Your originals are unchanged.'); for (const result of results) { const a = document.createElement('a'); a.href = URL.createObjectURL(result.blob); urls.push(a.href); a.download = result.name; a.textContent = 'Download ' + result.name + ' · ' + format(result.blob.size); $('downloads').append(a); } if (results.length > 1) { const button = document.createElement('button'); button.textContent = 'Download all as ZIP'; button.className = 'primary'; const archiveName = active.id + '-results.zip'; button.onclick = async () => { button.disabled = true; try { const zip = new JSZip(); for (const [i, result] of results.entries()) zip.file(String(i + 1).padStart(3, '0') + '-' + result.name, await result.blob.arrayBuffer()); const blob = await zip.generateAsync({ type: 'blob', compression: 'STORE' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); urls.push(a.href); a.download = archiveName; a.textContent = 'Download prepared ZIP · ' + format(blob.size); $('downloads').prepend(a); } catch (e) { $('processStatus').textContent = 'ZIP creation failed: ' + e.message; } finally { button.disabled = false; } }; $('downloads').prepend(button); } $('processStatus').textContent = 'Done. ' + results.length + ' file(s) ready below.'; } catch (e) { $('processStatus').textContent = e.message || 'Unable to process this file. Try a smaller or unencrypted file.'; if ([401, 403].includes(e.status)) { lock(); status(e.message); } } finally { busy = false; $('run').disabled = false; $('files').disabled = false; $('cancel').hidden = true; list(); } };
if (token) verify().catch(e => { lock(); status(e.message); });

let category = 'all';
function filterTools() { const query = $('toolSearch').value.trim().toLowerCase(); let count = 0; document.querySelectorAll('.tool').forEach(card => { card.hidden = !((category === 'all' || card.dataset.category === category) && card.dataset.search.includes(query)); if (!card.hidden) count++; }); $('filterStatus').textContent = count + ' tool' + (count === 1 ? '' : 's') + ' available'; }
$('toolSearch').addEventListener('input', filterTools);
document.querySelectorAll('[data-filter]').forEach(button => button.onclick = () => { category = button.dataset.filter; document.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b === button))); filterTools(); });
