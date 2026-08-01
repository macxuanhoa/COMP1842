<template>
  <div class="workspace-page workspace-page-narrow not-found-page">
    <section class="ui segment workspace-panel not-found-panel">
      <span class="not-found-icon" aria-hidden="true">
        <i class="compass outline icon"></i>
      </span>
      <span class="not-found-code">404</span>
      <h1>Page not found</h1>
      <p>The page you are looking for does not exist or may have been moved.</p>
      <div class="not-found-actions">
        <router-link to="/dashboard" class="ui primary button icon labeled">
          <i class="home icon"></i> Return to Dashboard
        </router-link>
        <router-link to="/words" class="ui basic primary button icon labeled">
          <i class="book open icon"></i> Open Library
        </router-link>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'not-found'
};
</script>

<style scoped>
.not-found-panel {
  padding-top: 3rem !important;
  padding-bottom: 3rem !important;
  text-align: center;
}

.not-found-icon {
  display: inline-flex;
  width: 58px;
  height: 58px;
  align-items: center;
  justify-content: center;
  border-radius: 17px;
  color: #2185d0;
  background: #eaf5fc;
  font-size: 1.45rem;
}

.not-found-icon .icon {
  margin: 0 !important;
}

.not-found-code {
  display: block;
  margin-top: 1.25rem;
  color: #2185d0;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.not-found-panel h1 {
  margin: 0.45rem 0 0.6rem;
  color: #172033;
  font-size: 2rem;
  letter-spacing: -0.03em;
}

.not-found-panel p {
  max-width: 420px;
  margin: 0 auto;
  color: #687386;
  font-size: 1rem;
  line-height: 1.6;
}

.not-found-actions {
  display: flex;
  justify-content: center;
  gap: 0.65rem;
  margin-top: 1.5rem;
}

.not-found-actions .ui.button {
  margin: 0;
}
</style>
