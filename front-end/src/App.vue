<template>
  <div id="app">
    <div class="ui inverted segment navbar">
      <div class="ui center aligned container">
        <div class="ui large secondary inverted pointing menu compact">
          <router-link to="/dashboard" class="item">
            <i class="chart bar icon"></i> Dashboard
          </router-link>
          <router-link to="/words" exact class="item">
            <i class="book icon"></i> Words
          </router-link>
          <router-link to="/words/new" class="item">
            <i class="plus circle icon"></i> Add Word
          </router-link>
          <router-link to="/categories" class="item">
            <i class="tags icon"></i> Categories
          </router-link>
          <router-link to="/test" class="item">
            <i class="graduation cap icon"></i> Test
          </router-link>
          <router-link to="/about" class="item">
            <i class="user circle icon"></i> About Me
          </router-link>
        </div>
      </div>
    </div>

    <main class="ui container app-content">
      <flash-message class="myFlash"></flash-message>
      <router-view />
    </main>
  </div>
</template>

<script>
// ── Component gốc của ứng dụng ──────────────────────────────────────
// Chứa thanh navigation (navbar) + flash message + router-view
export default {
  // Khai báo tên định danh của component gốc
  name: 'app'
};
</script>

<style>
html {
  overflow-y: scroll;
}
html, body, #app {
  min-height: 100%;
}
body {
  background: #f4f5f8;
  color: #1e293b;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* Swiss Modular Obsidian Header */
#app > div.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  border-radius: 0;
  background: #0f172a;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 10px 15px -3px rgba(0, 0, 0, 0.08);
}

.navbar .ui.pointing.menu {
  border-bottom: none !important;
  margin: 0 !important;
}

.navbar .ui.pointing.menu .item {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  white-space: nowrap !important;
  font-weight: 600 !important;
  font-size: 0.98rem !important;
  letter-spacing: 0.01em !important;
  padding: 0.9em 1.3em !important;
  margin: 0 0.15em !important;
  color: #94a3b8 !important;
  border-bottom: 2px solid transparent !important;
  transition: all 0.15s ease !important;
}

.navbar .ui.pointing.menu .item i.icon {
  margin-right: 0.45rem !important;
  margin-left: 0 !important;
  font-size: 1rem !important;
  vertical-align: middle !important;
}

.navbar .ui.pointing.menu .item:hover {
  color: #f8fafc !important;
  border-bottom-color: rgba(255, 255, 255, 0.3) !important;
}

.navbar .ui.pointing.menu .item.active,
.navbar .ui.pointing.menu .router-link-active {
  color: #ffffff !important;
  border-bottom-color: #38bdf8 !important;
  background: rgba(255, 255, 255, 0.05) !important;
}

.ui.container.app-content {
  width: calc(100% - 2rem) !important;
  max-width: 920px !important;
  min-height: 520px;
  margin-right: auto !important;
  margin-left: auto !important;
  padding-top: 5.25rem !important;
}

/* ── Toast ────────────────────────────────────────────────────────── */
.myFlash {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 9999;

  display: flex;
  flex-direction: column;
  gap: 8px;

  width: min(350px, calc(100vw - 32px));
  pointer-events: none;
}

.myFlash .flash__message {
  position: relative !important;

  width: 100%;
  min-width: 0;
  margin: 0 !important;
  padding: 13px 42px 13px 16px !important;

  border: 1px solid #e5e7eb !important;
  border-radius: 8px !important;

  font-size: 0.86rem !important;
  font-weight: 500 !important;
  line-height: 1.45 !important;

  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.09) !important;

  animation: toastIn 0.25s ease-out;
  pointer-events: auto;
}

@keyframes toastIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Success */
.myFlash .flash__message.success {
  background: #eaf7ef !important;
  border-color: #a9d9bb !important;
  color: #276749 !important;
}

/* Error */
.myFlash .flash__message.error {
  background: #fdecec !important;
  border-color: #e8b4b4 !important;
  color: #9b2c2c !important;
}

/* Information */
.myFlash .flash__message.info {
  background: #edf4fd !important;
  border-color: #b8cdec !important;
  color: #2c5282 !important;
}

/* Warning */
.myFlash .flash__message.warning {
  background: #fff4dc !important;
  border-color: #e8cd91 !important;
  color: #8a5a13 !important;
}

/* Close button */
.myFlash .flash__close-button {
  position: absolute !important;
  top: 50% !important;
  right: 12px !important;

  width: 24px;
  height: 24px;
  padding: 0 !important;

  transform: translateY(-50%);

  color: currentColor !important;
  background: transparent !important;
  border: none !important;

  font-size: 0.8rem !important;
  line-height: 1 !important;
  opacity: 0.45;

  cursor: pointer;
  transition: opacity 0.15s ease;
}

.myFlash .flash__close-button:hover {
  opacity: 0.9;
}

/* Page Layout & Editorial Header */
.workspace-page {
  padding-top: 1.75rem;
  padding-bottom: 3.5rem;
}
.workspace-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid #e2e8f0;
}
.workspace-header h1 {
  margin: 0.3rem 0 0.2rem;
  font-size: 1.8rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.03em;
}
.workspace-header p {
  margin: 0;
  color: #64748b;
  font-size: 0.88rem;
  line-height: 1.5;
}
.workspace-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: #0f172a;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 0.25rem;
}
.workspace-eyebrow .icon {
  margin: 0 !important;
  font-size: 0.78rem;
  line-height: 1;
  color: #0284c7;
}

.workspace-header-actions {
  display: flex;
  flex: 0 0 auto;
  align-self: center;
  gap: 0.5rem;
}
.workspace-header-actions .ui.button {
  margin: 0;
}

/* Swiss Modular Panel Card */
.workspace-panel {
  margin: 0 0 1.75rem !important;
  padding: 1.6rem !important;
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 10px !important;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04), 0 6px 16px rgba(15, 23, 42, 0.02) !important;
}
.workspace-panel-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f1f5f9;
}
.workspace-panel-title {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.workspace-panel-heading h2 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.01em;
}
.workspace-panel-heading p {
  margin: 0.2rem 0 0;
  color: #64748b;
  font-size: 0.82rem;
  line-height: 1.4;
}
.workspace-panel-icon {
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  width: 36px;
  height: 36px;
  border-radius: 9px;
  background: #f1f5f9;
  color: #475569;
}
.workspace-panel-icon .icon {
  display: block;
  margin: 0 !important;
  font-size: 0.95rem;
  line-height: 1;
}
.workspace-panel-icon.green {
  background: #ecfdf5;
  color: #059669;
}
.workspace-panel-icon.blue {
  background: #eff6ff;
  color: #2563eb;
}
.workspace-panel-icon.yellow {
  background: #fffbeb;
  color: #d97706;
}

/* Crisp Action Controls */
.ui.button.primary {
  background: #0f172a !important;
  color: #ffffff !important;
  font-weight: 600 !important;
  border-radius: 7px !important;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.15) !important;
  transition: all 0.15s ease !important;
}
.ui.button.primary:hover {
  background: #1e293b !important;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.25) !important;
}

.ui.form .field > label {
  color: #0f172a;
  font-size: 0.82rem;
  font-weight: 600;
  margin-bottom: 0.45rem;
}
.ui.form input, .ui.form select {
  border-color: #cbd5e1 !important;
  border-radius: 7px !important;
  font-size: 0.9rem !important;
  transition: border-color 0.15s ease, box-shadow 0.15s ease !important;
}
.ui.form input:focus, .ui.form select:focus,
.ui.form textarea:focus,
.ui.input input:focus,
.ui.input textarea:focus {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12) !important;
  outline: none !important;
}

/* Search/icon inputs: icon đổi màu khi ô nhập đang focus */
.ui.icon.input > input:focus ~ i.icon {
  color: #3b82f6 !important;
  transition: color 0.15s ease;
}

/* Precise Optical Icon & Flag Alignment System
   Chỉ áp dụng cho icon là con TRỰC TIẾP nằm cạnh chữ,
   không đè lên icon trong chip / checkbox custom */
.workspace-eyebrow > i.icon,
.workspace-panel-title > i.icon,
.modal-title > i.icon,
.setup-section-title > i.icon {
  margin-right: 0.4rem !important;
  margin-left: 0 !important;
}

.ui.table th i.icon,
.ui.table th i.flag,
.ui.label i.icon,
.ui.label i.flag {
  display: inline-block !important;
  vertical-align: -0.08em !important;
  margin-right: 0.35rem !important;
  margin-left: 0 !important;
}

.ui.action.input {
  display: flex !important;
  width: 100% !important;
}
.ui.action.input > input {
  width: auto !important;
  flex: 1 1 auto !important;
}
input, select {
  box-sizing: border-box;
}

/* ── Chữ và icon căn giữa tuyệt đối trên mọi nút ─────────────────── */
.ui.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  border-radius: 8px;
}
.ui.button > i.icon {
  margin: 0 !important;
  line-height: 1;
}

/* Cỡ chữ nút đồng nhất toàn ứng dụng */
.ui.button:not(.mini):not(.tiny) {
  font-size: 0.875rem;
}

/* Nút hành động trong bảng: khung trung tính đồng nhất, chỉ lên màu khi hover */
.library-row-actions .ui.basic.button {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  color: #64748b;
  box-shadow: none !important;
}
.library-row-actions .ui.basic.button:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #334155;
}
.library-row-actions .ui.basic.primary.button:hover {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #2563eb;
}
.library-row-actions .ui.basic.negative.button:hover {
  background: #fef2f2;
  border-color: #fecaca;
  color: #dc2626;
}

/* ── Error / warning / success messages (dùng chung mọi trang) ───── */
.ui.negative.message {
  margin: 0 0 1.25rem;
  padding: 0.8rem 1rem;
  background: #fef2f2;
  border: 1px solid #fee2e2;
  border-radius: 8px;
  box-shadow: none;
  color: #b91c1c;
  font-size: 0.85rem;
  font-weight: 500;
  line-height: 1.5;
  animation: messageSlideIn 0.18s ease-out;
}
.ui.negative.message::before {
  content: none;
}
.ui.negative.message p {
  margin: 0;
}

.ui.warning.message {
  border-radius: 8px;
  border: 1px solid #fde68a;
  background: #fffbeb;
  color: #92400e;
  box-shadow: none;
  font-size: 0.85rem;
}

.ui.success.message {
  border-radius: 8px;
  border: 1px solid #bbf7d0;
  background: #f0fdf4;
  color: #166534;
  box-shadow: none;
  font-size: 0.85rem;
}

@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

/* ── Alignment & spacing polish ───────────────────────────────────── */
.ui.label {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}
.ui.label i.icon,
.ui.label i.flag {
  margin: 0 !important;
}

/* Khoảng cách nhất quán giữa các panel và heading trang */
.workspace-page {
  padding-top: 1.25rem;
}
.workspace-header {
  margin-bottom: 1.75rem;
}

/* Ô checkbox alignment trong form */
.ui.checkbox input[type='checkbox'],
.ui.checkbox input[type='checkbox'] + label,
.ui.checkbox input[type='checkbox'] ~ label {
  font-size: 0.875rem;
}
</style>
