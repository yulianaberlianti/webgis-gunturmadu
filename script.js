// ======================================================
// WEBGIS FASILITAS UMUM DESA GUNTURMADU
// KKN 84.408 UPN "Veteran" Yogyakarta
// ======================================================

// ─── DATA ─────────────────────────────────────────────
// Data fasum/jalan/batas sudah digabung langsung ke data.js
// (FASUM_GEOJSON, JALAN_GEOJSON, BATAS_GEOJSON) supaya web ini
// bisa langsung dibuka di HP maupun laptop — tanpa perlu server
// lokal, tanpa perlu internet untuk memuat data, dan tanpa
// perlu buka aplikasi/situs peta pihak ketiga apa pun.

const FOTO_DESA  = "img/desa-gunturmadu.jpg";
const CENTER     = [-7.334, 109.872];

// ─── KATEGORI CONFIG ──────────────────────────────────
const KAT = {
  "Keagamaan":         { warna: "#1565c0", emoji: "🕌", label: "Keagamaan" },
  "Pendidikan":        { warna: "#6a1b9a", emoji: "📚", label: "Pendidikan" },
  "Pemerintahan":      { warna: "#e65100", emoji: "🏛",  label: "Pemerintahan" },
  "Olahraga":          { warna: "#2e7d32", emoji: "⚽", label: "Olahraga" },
  "Sejarah dan Budaya":{ warna: "#6d4c41", emoji: "🏺", label: "Sejarah & Budaya" },
};
const katWarna = k => KAT[k]?.warna || "#607d8b";
const katEmoji = k => KAT[k]?.emoji || "📍";
const katLabel = k => KAT[k]?.label || k;

// ─── BASEMAP TILES ────────────────────────────────────
const TILES = {
  light: L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    { maxZoom: 20, attribution: "© Carto" }),
  dark: L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    { maxZoom: 20, attribution: "© Carto" }),
  osm: L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    { maxZoom: 19, attribution: "© OpenStreetMap" }),
  terrain: L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    { maxZoom: 20, attribution: "© Esri" }),
  topo: L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    { maxZoom: 17, attribution: "© OpenTopoMap" }),
  satellite: L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    { maxZoom: 20, attribution: "© Esri" }),
  hybrid: L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    { maxZoom: 20, attribution: "© Esri" }),
};

// Label overlay untuk hybrid/satellite
const LABELS = L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png",
  { maxZoom: 20, pane: "shadowPane" }
);

// ─── MAP INIT ─────────────────────────────────────────
const map = L.map("map", { center: CENTER, zoom: 14, zoomControl: false });
L.control.zoom({ position: "topright" }).addTo(map);
L.control.scale({ imperial: false, position: "bottomright" }).addTo(map);
TILES.light.addTo(map);

// ─── GANTI BASEMAP ────────────────────────────────────
document.querySelectorAll('input[name="basemap"]').forEach(radio => {
  radio.addEventListener("change", () => {
    Object.values(TILES).forEach(t => { if (map.hasLayer(t)) map.removeLayer(t); });
    if (map.hasLayer(LABELS)) map.removeLayer(LABELS);
    const val = radio.value;
    TILES[val].addTo(map);
    if (val === "hybrid" || val === "satellite") LABELS.addTo(map);
  });
});

// ─── MENU MOBILE ──────────────────────────────────────
const sidebar = document.getElementById("sidebar");
document.getElementById("menuToggle").addEventListener("click", () => {
  sidebar.classList.toggle("active");
});

// ─── PANEL LAYER ──────────────────────────────────────
const panelLayer = document.getElementById("layerToggle");
document.getElementById("btnLayerToggle").addEventListener("click", () => {
  panelLayer.classList.toggle("hidden");
});
// Tutup panel kalau klik di luar
document.addEventListener("click", e => {
  if (!panelLayer.contains(e.target) && e.target.id !== "btnLayerToggle") {
    panelLayer.classList.add("hidden");
  }
});

// ─── LAYER: JALAN ─────────────────────────────────────
let jalanLayer = null;
function loadJalan() {
  try {
    jalanLayer = L.geoJSON(JALAN_GEOJSON, {
      style: { color: "#e65100", weight: 2.5, dashArray: "6,3", opacity: .9 },
      onEachFeature: (f, l) => {
        const label = f.properties?.nama || f.properties?.NAMRJL || f.properties?.REMARK;
        if (label) l.bindTooltip(label);
      },
    }).addTo(map);
    document.getElementById("toggleJalan").addEventListener("change", e => {
      e.target.checked ? map.addLayer(jalanLayer) : map.removeLayer(jalanLayer);
    });
  } catch (err) { console.log("Layer jalan belum tersedia.", err); }
}

// ─── LAYER: BATAS DESA ────────────────────────────────
let batasLayer = null;
function loadBatas() {
  try {
    batasLayer = L.geoJSON(BATAS_GEOJSON, {
      style: { color: "#2e7d32", weight: 3, fillOpacity: 0.06, dashArray: "8 4" },
    }).addTo(map);
    map.fitBounds(batasLayer.getBounds().pad(0.08));
    document.getElementById("toggleBatas").addEventListener("change", e => {
      e.target.checked ? map.addLayer(batasLayer) : map.removeLayer(batasLayer);
    });
  } catch (err) { console.log("Layer batas belum tersedia.", err); }
}

// ─── CLUSTER GROUP ────────────────────────────────────
const clusterGroup = L.markerClusterGroup({
  showCoverageOnHover: false,
  maxClusterRadius: 45,
  iconCreateFunction(c) {
    return L.divIcon({
      html: `<div class="cluster-icon">${c.getChildCount()}</div>`,
      className: "",
      iconSize: [42, 42],
    });
  },
});
map.addLayer(clusterGroup);

// ─── MARKER ICON ──────────────────────────────────────
function makeIcon(kategori) {
  const w = katWarna(kategori);
  const e = katEmoji(kategori);
  return L.divIcon({
    className: "",
    html: `<div style="
      background:${w};width:38px;height:38px;
      border-radius:50% 50% 50% 0;transform:rotate(-45deg);
      border:3px solid #fff;display:flex;justify-content:center;
      align-items:center;box-shadow:0 3px 10px rgba(0,0,0,.35);">
      <span style="transform:rotate(45deg);font-size:17px;">${e}</span>
    </div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -40],
  });
}

// ─── ROUTING ──────────────────────────────────────────
let routingControl = null;
let userLatLng     = null;
let currentTarget  = null;

function clearRoute() {
  if (routingControl) { map.removeControl(routingControl); routingControl = null; }
  document.getElementById("rutePanel").classList.add("hidden");
}

function buatRute(targetLatLng, namaFasum) {
  if (!userLatLng) { alert("Aktifkan Lokasi Saya terlebih dahulu."); return; }
  clearRoute();
  currentTarget = { latlng: targetLatLng, nama: namaFasum };

  routingControl = L.Routing.control({
    waypoints: [userLatLng, targetLatLng],
    routeWhileDragging: false,
    show: false,
    createMarker: () => null,
    lineOptions: { styles: [{ color: "#2e7d32", weight: 6, opacity: 0.85 }] },
  })
  .on("routesfound", e => {
    const r     = e.routes[0];
    const km    = (r.summary.totalDistance / 1000).toFixed(2);
    const menit = Math.ceil(r.summary.totalTime / 60);
    document.getElementById("ruteTujuan").innerHTML = namaFasum;
    document.getElementById("ruteInfo").innerHTML =
      `Jarak <b>${km} km</b> &nbsp;·&nbsp; Perkiraan waktu <b>±${menit} menit</b>`;
    document.getElementById("rutePanel").classList.remove("hidden");
  })
  .addTo(map);
}

document.getElementById("ruteClose").addEventListener("click", clearRoute);

// ─── LOKASI SAYA ──────────────────────────────────────
let userMarker = null;

document.getElementById("btnLokasi").addEventListener("click", () => {
  if (!navigator.geolocation) { alert("Browser tidak mendukung GPS."); return; }
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude: lat, longitude: lng } = pos.coords;
    userLatLng = L.latLng(lat, lng);

    if (userMarker) map.removeLayer(userMarker);
    userMarker = L.marker(userLatLng, {
      icon: L.divIcon({ className: "", html: `<div class="user-pulse"></div>`, iconSize: [20, 20] }),
    })
    .addTo(map)
    .bindPopup("<b>📍 Posisi Saya</b>")
    .openPopup();

    map.flyTo(userLatLng, 16);
    document.getElementById("btnLokasi").innerHTML = "✅ Lokasi Ditemukan";
    if (currentTarget) buatRute(currentTarget.latlng, currentTarget.nama);
  }, () => {
    alert("Lokasi tidak dapat diakses. Aktifkan izin GPS di browser.");
  });
});

// ─── SHARE & COPY ─────────────────────────────────────
// Berbagi & salin tetap berupa teks biasa (nama + koordinat),
// tidak diarahkan ke Google Maps atau aplikasi peta pihak ketiga.
function shareLocation(nama, lat, lng) {
  const teks = `📍 ${nama} – Desa Gunturmadu\nKoordinat: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  if (navigator.share) {
    navigator.share({ title: nama, text: teks });
  } else {
    navigator.clipboard.writeText(teks);
    alert("✅ Info lokasi berhasil disalin ke clipboard.");
  }
}

function copyCoordinate(lat, lng) {
  navigator.clipboard.writeText(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
  alert("✅ Koordinat berhasil disalin.");
}

// ─── LIGHTBOX ─────────────────────────────────────────
function bukaLightbox(src, caption) {
  const lb    = document.getElementById("lightbox");
  const img   = document.getElementById("lightboxImg");
  const cap   = document.getElementById("lightboxCaption");
  img.src     = src;
  cap.textContent = caption || "";
  lb.classList.remove("hidden");
}

function tutupLightbox() {
  document.getElementById("lightbox").classList.add("hidden");
  document.getElementById("lightboxImg").src = "";
}

document.getElementById("lightboxClose").addEventListener("click", tutupLightbox);
document.getElementById("lightboxBg").addEventListener("click", tutupLightbox);
document.addEventListener("keydown", e => { if (e.key === "Escape") tutupLightbox(); });

// ─── ESCAPE HTML ──────────────────────────────────────
function esc(str) {
  if (!str || str === "-") return "-";
  return String(str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ─── POPUP DETAIL ─────────────────────────────────────
let _activeProp   = null;
let _activeLatLng = null;

function tampilPopup(p, latlng) {
  _activeProp   = p;
  _activeLatLng = latlng;

  const warna = katWarna(p.kategori);
  const emoji = katEmoji(p.kategori);
  const foto  = p.foto || null;

  // ── Foto
  const fotoWrap = document.getElementById("popupFoto");
  if (foto) {
    fotoWrap.className = "popup-foto-wrap";
    fotoWrap.innerHTML = `<img src="${esc(foto)}" alt="${esc(p.nama)}"
      onerror="this.parentElement.className='popup-foto-wrap empty';this.parentElement.innerHTML='📷 Foto belum tersedia'"
      onclick="bukaLightbox('${esc(foto)}','${esc(p.nama)}')" />`;
  } else {
    fotoWrap.className = "popup-foto-wrap empty";
    fotoWrap.innerHTML = "📷 Foto belum tersedia";
  }

  // ── Status
  const statusHtml = p.status === "Terverifikasi"
    ? `<span style="color:#2e7d32">✅ Terverifikasi</span>`
    : `<span style="color:#e65100">⏳ ${esc(p.status)}</span>`;

  // ── Jarak (hanya jika lokasi aktif)
  const jarakRow = userLatLng
    ? `<tr><td>Jarak</td><td><b>${(userLatLng.distanceTo(latlng)/1000).toFixed(2)} km</b></td></tr>`
    : "";

  // ── Render
  document.getElementById("popupContent").innerHTML = `
    <div class="popup-kategori" style="background:${warna}18;color:${warna};border:1.5px solid ${warna}44;">
      ${emoji} ${esc(p.kategori)}
    </div>
    <h2 class="popup-title">${esc(p.nama)}</h2>
    <p class="popup-desc">${esc(p.deskripsi) !== "-" ? esc(p.deskripsi) : "Fasilitas umum Desa Gunturmadu."}</p>
    <table class="popup-table">
      <tr><td>Status</td><td>${statusHtml}</td></tr>
      <tr><td>Sumber</td><td>${esc(p.sumber)}</td></tr>
      ${jarakRow}
      <tr><td>Koordinat</td><td>${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}</td></tr>
    </table>
    <div class="popup-update">🗓 Diperbarui: ${esc(p.update) !== "-" ? esc(p.update) : "Juli 2026"}</div>
  `;

  // ── Tombol aksi
  document.getElementById("btnRute").onclick  = () => buatRute(latlng, p.nama);
  document.getElementById("btnShare").onclick = () => shareLocation(p.nama, latlng.lat, latlng.lng);
  document.getElementById("btnCopy").onclick  = () => copyCoordinate(latlng.lat, latlng.lng);

  document.getElementById("detailPopup").classList.remove("hidden");
}

document.getElementById("popupClose").addEventListener("click", () => {
  document.getElementById("detailPopup").classList.add("hidden");
});

// ─── RENDER MARKERS ───────────────────────────────────
function renderMarkers(features) {
  clusterGroup.clearLayers();
  features.forEach(f => {
    const p   = f.properties;
    const lat = f.geometry.coordinates[1];
    const lng = f.geometry.coordinates[0];
    const ll  = L.latLng(lat, lng);

    const marker = L.marker(ll, { icon: makeIcon(p.kategori) });

    marker.bindTooltip(
      `<b>${esc(p.nama)}</b><br>${katEmoji(p.kategori)} ${p.kategori}`,
      { direction: "top", offset: [0, -35] }
    );

    marker.on("click", () => {
      marker.setZIndexOffset(1000);
      setTimeout(() => marker.setZIndexOffset(0), 1400);
      map.flyTo(ll, 18, { duration: 1.2 });
      tampilPopup(p, ll);
      if (window.innerWidth <= 768) sidebar.classList.remove("active");
    });

    clusterGroup.addLayer(marker);
  });
}

// ─── RENDER LIST ──────────────────────────────────────
function renderList(features) {
  const ul = document.getElementById("fasumList");
  ul.innerHTML = "";

  if (features.length === 0) {
    ul.innerHTML = `<li style="padding:20px;text-align:center;color:#8a9e8c;font-size:12px">
      Tidak ada fasilitas ditemukan</li>`;
    return;
  }

  features.forEach(f => {
    const p   = f.properties;
    const ll  = L.latLng(f.geometry.coordinates[1], f.geometry.coordinates[0]);
    const thumbHtml = p.foto
      ? `<img src="${esc(p.foto)}" alt="${esc(p.nama)}"
          onerror="this.parentElement.classList.add('empty');this.remove()">`
      : "📷";

    const alamatRow = p.alamat ? `<div class="item-alamat">📍 ${esc(p.alamat)}</div>` : "";
    const jamRow    = p.jam    ? `<div class="item-jam">🕐 ${esc(p.jam)}</div>` : "";

    const li = document.createElement("li");
    li.className = "fasum-item";
    li.innerHTML = `
      <div class="item-thumb${p.foto ? "" : " empty"}">
        ${thumbHtml}
      </div>
      <div class="item-body">
        <div class="item-name">${esc(p.nama)}</div>
        <div class="item-kategori">${katEmoji(p.kategori)} ${katLabel(p.kategori)}</div>
        ${alamatRow}
        ${jamRow}
      </div>`;

    li.onclick = () => {
      clusterGroup.eachLayer(layer => {
        if (layer.getLatLng && layer.getLatLng().equals(ll)) {
          layer.setZIndexOffset(1000);
          setTimeout(() => layer.setZIndexOffset(0), 1400);
        }
      });
      map.flyTo(ll, 18, { duration: 1.2 });
      tampilPopup(p, ll);
      if (window.innerWidth <= 768) sidebar.classList.remove("active");
    };

    ul.appendChild(li);
  });
}

// ─── FILTER + SEARCH ──────────────────────────────────
let allFeatures = [];
let activeKat   = "Semua";

function getFiltered() {
  const q = document.getElementById("searchInput").value.toLowerCase().trim();
  return allFeatures.filter(f => {
    const katOk  = activeKat === "Semua" || f.properties.kategori === activeKat;
    const nameOk = !q || f.properties.nama.toLowerCase().includes(q)
                      || (f.properties.alamat || "").toLowerCase().includes(q);
    return katOk && nameOk;
  });
}

function applyFilter() {
  const data = getFiltered();
  renderMarkers(data);
  renderList(data);
  document.getElementById("listCount").innerHTML = data.length;
}

document.getElementById("searchInput").addEventListener("input", applyFilter);

function buildFilterButtons(features) {
  const kats = ["Semua", ...new Set(features.map(f => f.properties.kategori))];
  const el   = document.getElementById("filterButtons");
  el.innerHTML = "";

  kats.forEach(k => {
    const btn = document.createElement("button");
    btn.className = "filter-btn" + (k === "Semua" ? " active" : "");
    btn.dataset.kat = k;
    btn.innerHTML = (k === "Semua" ? "🗺 Semua" : `${katEmoji(k)} ${katLabel(k)}`);
    if (k !== "Semua") btn.style.color = katWarna(k);

    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach(b => {
        b.classList.remove("active");
        b.style.background = "";
        b.style.color = b.dataset.kat !== "Semua" ? katWarna(b.dataset.kat) : "";
      });
      btn.classList.add("active");
      if (k !== "Semua") { btn.style.background = katWarna(k); btn.style.color = "#fff"; }
      activeKat = k;
      applyFilter();
    });

    el.appendChild(btn);
  });
}

function buildStats(features) {
  const counts = {};
  features.forEach(f => {
    const k = f.properties.kategori;
    counts[k] = (counts[k] || 0) + 1;
  });

  const grid = document.getElementById("statsGrid");
  grid.innerHTML = "";

  Object.entries(counts).sort((a, b) => b[1] - a[1]).forEach(([k, n]) => {
    const c = document.createElement("div");
    c.className = "stat-card";
    c.style.borderColor = katWarna(k);
    c.innerHTML = `
      <div class="stat-num" style="color:${katWarna(k)}">${n}</div>
      <div class="stat-lbl">${katEmoji(k)} ${k}</div>`;
    c.title = `Klik untuk filter: ${k}`;
    c.addEventListener("click", () => {
      document.querySelector(`.filter-btn[data-kat="${k}"]`)?.click();
    });
    grid.appendChild(c);
  });
}

// ─── FOTO DESA ────────────────────────────────────────
function setupFotoDesa() {
  const img = document.getElementById("fotoDesa");
  if (!img) return;
  img.src = FOTO_DESA;
  img.onerror = () => { img.style.display = "none"; };
}

// ─── MAIN ─────────────────────────────────────────────
function init() {
  setupFotoDesa();
  loadJalan();
  loadBatas();

  try {
    allFeatures = FASUM_GEOJSON.features;

    document.getElementById("totalBadge").innerHTML = `${allFeatures.length} Fasilitas`;
    document.getElementById("listCount").innerHTML  = allFeatures.length;

    buildFilterButtons(allFeatures);
    buildStats(allFeatures);
    applyFilter();

    // Fit ke marker jika batas belum load
    setTimeout(() => {
      if (!batasLayer && allFeatures.length > 0) {
        const coords = allFeatures.map(f => [
          f.geometry.coordinates[1], f.geometry.coordinates[0]
        ]);
        map.fitBounds(L.latLngBounds(coords).pad(0.15));
      }
    }, 1200);

  } catch (err) {
    console.error(err);
    alert("⚠️ Data fasilitas gagal dimuat. Periksa isi file data.js.");
  }
}

init();