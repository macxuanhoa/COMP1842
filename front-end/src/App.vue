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
export default {
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
  font-weight: 600 !important;
  font-size: 0.98rem !important;
  letter-spacing: 0.01em !important;
  padding: 0.9em 1.3em !important;
  margin: 0 0.15em !important;
  color: #94a3b8 !important;
  border-bottom: 2px solid transparent !important;
  transition: all 0.15s ease !important;
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

/* Swiss Obsidian Bespoke Floating Toast */
.myFlash {
  width: 350px;
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
}
.myFlash .flash-message {
  padding: 14px 40px 14px 18px !important;
  margin-bottom: 10px !important;
  border-radius: 8px !important;
  font-size: 0.88rem !important;
  font-weight: 500 !important;
  line-height: 1.45 !important;
  background: #0f172a !important;
  color: #f8fafc !important;
  border: 1px solid #1e293b !important;
  box-shadow: 0 12px 30px -4px rgba(15, 23, 42, 0.35), 0 4px 10px -2px rgba(0, 0, 0, 0.2) !important;
  position: relative !important;
}
.myFlash .flash-message.success {
  border-left: 4px solid #10b981 !important;
}
.myFlash .flash-message.error {
  border-left: 4px solid #ef4444 !important;
}
.myFlash .flash-message.info {
  border-left: 4px solid #3b82f6 !important;
}
.myFlash .flash-message.warning {
  border-left: 4px solid #f59e0b !important;
}
.myFlash .flash-close-button {
  top: 12px;
  right: 14px;
  color: #94a3b8 !important;
  opacity: 0.8;
  font-size: 0.85rem;
  transition: color 0.15s ease !important;
}
.myFlash .flash-close-button:hover {
  color: #ffffff !important;
  opacity: 1;
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
  color: #64748b;
  flex: 0 0 auto;
}
.workspace-panel-icon .icon {
  margin: 0 !important;
  font-size: 1.1rem;
  line-height: 1;
}

.workspace-loader {
  margin: 3rem auto !important;
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
.ui.form input:focus, .ui.form select:focus {
  border-color: #0284c7 !important;
  box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.12) !important;
}

/* Precise Icon & Flag Alignment */
.ui.form .field > label .icon,
.ui.form .field > label .flag,
.ui.table th .icon,
.ui.table th .flag {
  display: inline-block !important;
  vertical-align: -0.1em !important;
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
</style>
