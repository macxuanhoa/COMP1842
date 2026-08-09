<template>
  <div class="workspace-page not-found-page">
    <section class="nf-card">
      <span class="nf-eyebrow">Error 404</span>

      <h1 class="nf-code">404</h1>

      <h2 class="nf-title">Page not found</h2>
      <p class="nf-copy">
        The page you are looking for doesn't exist, has been moved, or the address was typed
        incorrectly. Your vocabulary is safe — let's get you back on track.
      </p>

      <div class="nf-actions">
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
// ── Trang 404 ────────────────────────────────────────────────────────
// Hiển thị khi người dùng truy cập URL không tồn tại
export default {
  // Tên của component hiển thị giao diện báo lỗi không tìm thấy trang (404)
  name: 'not-found'
};
</script>

<style scoped>
.not-found-page {
  display: flex;
  justify-content: center;
  padding-top: 3rem !important;
  padding-bottom: 3rem;
}

.nf-card {
  width: 100%;
  max-width: 460px;
  padding: 3rem 2.5rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.05);
  text-align: center;
}

.nf-eyebrow {
  display: inline-block;
  padding: 0.3rem 0.85rem;
  background: #f1f5f9;
  border-radius: 999px;
  color: #64748b;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.nf-code {
  margin: 1.1rem 0 0.4rem;
  background: linear-gradient(180deg, #0f172a 35%, #64748b);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-size: 4.5rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1;
}

.nf-title {
  margin: 0 0 0.5rem;
  color: #0f172a;
  font-size: 1.15rem;
  font-weight: 700;
}

.nf-copy {
  margin: 0 auto;
  max-width: 360px;
  color: #64748b;
  font-size: 0.875rem;
  line-height: 1.6;
}

.nf-actions {
  display: flex;
  justify-content: center;
  gap: 0.6rem;
  margin-top: 1.75rem;
}

.nf-actions .ui.button {
  margin: 0;
  border-radius: 8px !important;
  font-weight: 600 !important;
}
</style>
