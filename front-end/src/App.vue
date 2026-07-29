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
html, body, #app {
  min-height: 100%;
}
body {
  background: #f6f8fb;
}
#app > div.navbar {
  margin-bottom: 2em;
  border-radius: 0;
  background: #171c24;
}
.ui.container.app-content {
  width: calc(100% - 2rem) !important;
  max-width: 900px !important;
  min-height: 500px;
  margin-right: auto !important;
  margin-left: auto !important;
}

/* -- Toast -- */
.myFlash {
  width: 300px;
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
}
.myFlash .flash__message {
  padding: 12px 16px !important;
  margin-bottom: 8px !important;
  border-radius: 6px !important;
  font-size: 0.85rem !important;
  line-height: 1.4 !important;
  border: 1px solid !important;
}
.myFlash .flash__message.success {
  color: #1a6b31 !important;
  background: #eaf7ee !important;
  border-color: #b7dfc3 !important;
}
.myFlash .flash__message.error {
  color: #9a1a1a !important;
  background: #fdf0f0 !important;
  border-color: #f5c6c6 !important;
}
.myFlash .flash__message.info {
  color: #1a5c8a !important;
  background: #eaf3fb !important;
  border-color: #b8d8f0 !important;
}
.myFlash .flash__message.warning {
  color: #7a5d00 !important;
  background: #fef9ee !important;
  border-color: #f5e2a6 !important;
}
.myFlash .flash__close-button {
  top: 8px;
  right: 10px;
  color: inherit !important;
  opacity: 0.5;
  font-size: 0.85rem;
}
.myFlash .flash__close-button:hover {
  opacity: 0.8;
}

/* -- Shared page layout -- */
.workspace-page {
  padding-bottom: 2.5rem;
}
.workspace-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}
.workspace-header h1 {
  margin: 0.2rem 0 0.4rem;
  font-size: 1.8rem;
}
.workspace-header p {
  margin: 0;
  color: #687386;
}
.workspace-eyebrow {
  color: #2185d0;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.workspace-eyebrow .icon {
  margin-right: 0.4rem;
}
.workspace-header__actions {
  display: flex;
  flex: 0 0 auto;
  gap: 0.5rem;
}
.workspace-header__actions .ui.button {
  margin: 0;
}

/* -- Shared panel -- */
.workspace-panel {
  margin: 0 0 1.25rem !important;
  padding: 1.5rem !important;
  border: 1px solid #e5e9f0 !important;
  box-shadow: 0 4px 16px rgba(33, 48, 76, 0.05) !important;
}
.workspace-panel-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e9f0;
}
.workspace-panel-heading__title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.workspace-panel-heading h2 {
  margin: 0;
  font-size: 1.05rem;
}
.workspace-panel-heading p {
  margin: 0.2rem 0 0;
  color: #687386;
  font-size: 0.8rem;
}
.workspace-panel-icon {
  display: flex;
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  color: #2185d0;
  background: #eaf5fc;
}
.workspace-panel-icon.green { color: #21ba45; background: #edf9f0; }
.workspace-panel-icon.orange { color: #f2711c; background: #fff3ea; }
.workspace-panel-icon.violet { color: #6435c9; background: #f4f0fc; }
.workspace-panel-icon .icon { margin: 0 !important; font-size: 0.95rem; line-height: 1; }
.workspace-loader {
  margin: 3rem auto !important;
}

/* -- Form tweaks -- */
.ui.form .field > label {
  color: #30394a;
  font-size: 0.82rem;
  margin-bottom: 0.45rem;
}
.ui.form input, .ui.form select {
  border-color: #dfe4eb !important;
  border-radius: 6px !important;
}
.ui.form input:focus, .ui.form select:focus {
  border-color: #2185d0 !important;
}

input, select {
  width: 100% !important;
}
</style>
