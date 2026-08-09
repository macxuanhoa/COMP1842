<template>
  <div class="workspace-page about-page">
    <div class="about-frame">
    <!-- Hero: danh tính + code card -->
    <section class="about-hero">
      <div class="about-hero-grid">
        <div class="about-hero-left">
          <div class="about-id-row">
            <div class="about-avatar"><span>MH</span></div>
            <div>
              <div class="about-hero-eyebrow">Student Profile · COMP1842</div>
              <h1>Mạc Xuân Hòa</h1>
              <p class="about-hero-role">Aspiring full-stack web developer</p>
            </div>
          </div>

          <p class="about-hero-bio">
            Hello, my name is Mạc Xuân Hòa. I am a student at the University of Greenwich studying
            COMP1842 – Web Programming 2. I am interested in web development and enjoy creating
            applications that solve practical problems.
          </p>

          <div class="about-fact-row">
            <span class="about-fact"><i class="id card outline icon"></i> 001361516</span>
            <span class="about-fact"><i class="university icon"></i> University of Greenwich</span>
          </div>

          <div class="about-lang-row">
            <span class="about-lang-label">Project languages</span>
            <span class="about-lang"><i class="germany flag"></i> German</span>
            <span class="about-lang"><i class="united kingdom flag"></i> English</span>
            <span class="about-lang"><i class="france flag"></i> French</span>
          </div>
        </div>

        <!-- Code card giả lập editor -->
        <div class="about-code-card" aria-hidden="true">
          <div class="code-card-bar">
            <span class="code-dot code-dot-red"></span>
            <span class="code-dot code-dot-yellow"></span>
            <span class="code-dot code-dot-green"></span>
            <span class="code-card-name">about-me.js</span>
          </div>
          <pre class="code-card-body"><span class="c-kw">const</span> <span class="c-var">student</span> <span class="c-pun">=</span> {
  name<span class="c-pun">:</span> <span class="c-str">'Mạc Xuân Hòa'</span><span class="c-pun">,</span>
  id<span class="c-pun">:</span> <span class="c-str">'001361516'</span><span class="c-pun">,</span>
  module<span class="c-pun">:</span> <span class="c-str">'COMP1842'</span><span class="c-pun">,</span>
  stack<span class="c-pun">:</span> [<span class="c-str">'Vue'</span><span class="c-pun">,</span> <span class="c-str">'Express'</span><span class="c-pun">,</span> <span class="c-str">'MongoDB'</span>]<span class="c-pun">,</span>
  languages<span class="c-pun">:</span> [<span class="c-str">'de'</span><span class="c-pun">,</span> <span class="c-str">'en'</span><span class="c-pun">,</span> <span class="c-str">'fr'</span>]<span class="c-pun">,</span>
  goal<span class="c-pun">:</span> <span class="c-str">'Full-stack developer'</span>
}<span class="c-pun">;</span></pre>
        </div>
      </div>

      <div class="about-hero-actions">
        <a :href="githubUrl" target="_blank" rel="noopener" class="about-github-button">
          <i class="github icon"></i>
          <span class="about-github-button-text">
            <strong>View on GitHub</strong>
            <small>github.com/macxuanhoa</small>
          </span>
        </a>
        <router-link to="/words" class="ui basic primary button icon labeled">
          <i class="book open icon"></i> Explore The Vocabulary App
        </router-link>
      </div>
    </section>

    <!-- GitHub spotlight -->
    <section class="about-github-panel">
      <div class="about-github-panel-left">
        <span class="about-github-panel-icon"><i class="github icon"></i></span>
        <div>
          <h2>Follow my work on GitHub</h2>
          <p>Source code, coursework projects, and experiments — all published on my profile.</p>
        </div>
      </div>
      <a :href="githubUrl" target="_blank" rel="noopener" class="about-github-cta">
        <i class="github icon"></i> github.com/macxuanhoa
      </a>
    </section>

    <!-- Project context -->
    <section class="ui segment workspace-panel">
      <div class="workspace-panel-heading">
        <div class="workspace-panel-title">
          <div>
            <h2>About The Project</h2>
            <p>Written from the source code that is currently in the project.</p>
          </div>
        </div>
        <span class="workspace-panel-icon"><i class="info circle icon"></i></span>
      </div>

      <p class="about-copy">
        This application was developed as part of the COMP1842 Web Programming 2 coursework. The
        project is a multilingual vocabulary learning application that lets users store German,
        English, and French words, organise them into categories, mark favourite words, and review
        their progress through quiz sessions and dashboard summaries.
      </p>
      <p class="about-copy">
        The main goal of the application is to help users manage a personal vocabulary library and
        practise translations in a structured way. The main data handled by the system is word data
        with translations, category names, favourite status, and timestamps, while quiz history and
        retake selections are stored in the browser for follow-up practice.
      </p>
    </section>

    <!-- Tech stack theo tầng -->
    <section class="ui segment workspace-panel">
      <div class="workspace-panel-heading">
        <div class="workspace-panel-title">
          <div>
            <h2>Technology Stack</h2>
            <p>Only technologies confirmed in the current source code are listed here.</p>
          </div>
        </div>
        <span class="workspace-panel-icon"><i class="layers icon"></i></span>
      </div>

      <div class="stack-grid">
        <div v-for="group in stackGroups" :key="group.title" class="stack-col">
          <div class="stack-col-head" :class="'stack-head-' + group.accent">
            <span class="stack-dot"></span>
            {{ group.title }}
          </div>
          <div class="stack-pills">
            <span
              v-for="tech in group.items"
              :key="tech.name"
              class="stack-pill"
              :title="tech.description"
            >
              <img v-if="tech.icon" :src="tech.icon" :alt="tech.name" class="stack-pill-img" />
              <span v-else class="stack-pill-badge" :style="{ background: tech.color }">{{ tech.initial }}</span>
              {{ tech.name }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- Core functionality -->
    <section class="ui segment workspace-panel">
      <div class="workspace-panel-heading">
        <div class="workspace-panel-title">
          <div>
            <h2>Core Functionality</h2>
            <p>CRUD features found in routes, views, components, and controllers.</p>
          </div>
        </div>
        <span class="workspace-panel-icon"><i class="tasks icon"></i></span>
      </div>

      <div class="about-list-grid">
        <div class="about-list-card">
          <h3><i class="book icon text-blue"></i> Word Management</h3>
          <ul>
            <li v-for="feature in coreWordFeatures" :key="feature">{{ feature }}</li>
          </ul>
        </div>
        <div class="about-list-card">
          <h3><i class="tags icon text-blue"></i> Category Management</h3>
          <ul>
            <li v-for="feature in coreCategoryFeatures" :key="feature">{{ feature }}</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Additional features -->
    <section class="ui segment workspace-panel">
      <div class="workspace-panel-heading">
        <div class="workspace-panel-title">
          <div>
            <h2>Additional Functionality</h2>
            <p>Features implemented beyond basic CRUD operations.</p>
          </div>
        </div>
        <span class="workspace-panel-icon"><i class="plus square outline icon"></i></span>
      </div>

      <div class="about-grid">
        <article v-for="feature in additionalFeatures" :key="feature.title" class="about-card">
          <h3><i :class="feature.icon + ' icon text-blue'"></i> {{ feature.title }}</h3>
          <p>{{ feature.description }}</p>
        </article>
      </div>
    </section>

    <!-- Learnings & goals -->
    <div class="about-footer-grid">
      <section class="ui segment workspace-panel">
        <div class="workspace-panel-heading">
          <div class="workspace-panel-title">
            <div>
              <h2>What I Learned</h2>
              <p>Reflection based on real architecture.</p>
            </div>
          </div>
          <span class="workspace-panel-icon"><i class="lightbulb icon"></i></span>
        </div>

        <p class="about-copy">
          Through this project, I learned how to build a full-stack JavaScript application with a Vue
          frontend, an Express backend, and MongoDB for data storage. I also practised routing,
          reusable components, REST API communication with Axios, CRUD operations, form validation,
          error handling, and storing extra browser-side data for quiz history and retake sessions.
        </p>
      </section>

      <section class="ui segment workspace-panel">
        <div class="workspace-panel-heading">
          <div class="workspace-panel-title">
            <div>
              <h2>Future Goal</h2>
              <p>A short goal for continued learning.</p>
            </div>
          </div>
          <span class="workspace-panel-icon"><i class="flag checkered icon"></i></span>
        </div>

        <p class="about-copy">
          My goal is to continue improving my frontend and backend development skills and become a
          professional full-stack web developer.
        </p>
      </section>
    </div>

    <!-- Footer signature -->
    <footer class="about-footer">
      <span>Designed &amp; built by Mạc Xuân Hòa</span>
      <a :href="githubUrl" target="_blank" rel="noopener">
        <i class="github icon"></i> macxuanhoa
      </a>
    </footer>
    </div>
  </div>
</template>

<script>
// ── Trang About Me ───────────────────────────────────────────────────
// Portfolio sinh viên: hero + code card, stack theo tầng, tính năng dự án
export default {
  // Tên của component
  name: 'about-me',
  // Khởi tạo các danh sách dữ liệu tĩnh cho trang giới thiệu
  data() {
    return {
      // Liên kết GitHub cá nhân
      githubUrl: 'https://github.com/macxuanhoa',
      // Công nghệ nhóm theo tầng kiến trúc (tooltip giữ mô tả chi tiết)
      stackGroups: [
        {
          title: 'Frontend',
          accent: 'blue',
          items: [
            { name: 'Vue.js 2', initial: 'V', color: '#42b883', icon: require('../assets/tech/vue.svg'), description: 'Builds the frontend user interface and page structure.' },
            { name: 'Vue Router', initial: 'R', color: '#35495e', icon: null, description: 'Handles page navigation with history mode routes.' },
            { name: 'Axios', initial: 'A', color: '#5a29e4', icon: require('../assets/tech/axios.svg'), description: 'Sends HTTP requests from the frontend to the backend API.' },
            { name: 'Semantic UI CSS', initial: 'S', color: '#00b5ad', icon: require('../assets/tech/semanticui.svg'), description: 'Provides the base styling for menus, forms, tables, buttons, and layout.' },
            { name: 'Vue Flash Message', initial: 'F', color: '#f59e0b', icon: null, description: 'Shows success and error toast messages in the frontend.' }
          ]
        },
        {
          title: 'Backend',
          accent: 'green',
          items: [
            { name: 'Node.js', initial: 'N', color: '#339933', icon: require('../assets/tech/node.svg'), description: 'Runs the backend JavaScript application.' },
            { name: 'Express.js', initial: 'E', color: '#475569', icon: require('../assets/tech/express.svg'), description: 'Handles backend routes and API requests for words and categories.' }
          ]
        },
        {
          title: 'Database',
          accent: 'amber',
          items: [
            { name: 'MongoDB', initial: 'M', color: '#47a248', icon: require('../assets/tech/mongodb.svg'), description: 'Stores the main application data for words and categories.' },
            { name: 'Mongoose', initial: 'G', color: '#b91c1c', icon: require('../assets/tech/mongoose.svg'), description: 'Defines schemas and communicates with MongoDB collections.' }
          ]
        }
      ],
      // Danh sách các tính năng cốt lõi về quản lý từ vựng (CRUD Word)
      coreWordFeatures: [
        'Create a new vocabulary word with German, English, and French translations.',
        'View the vocabulary library.',
        'View word details on a dedicated page.',
        'Edit an existing word.',
        'Delete a word.'
      ],
      // Danh sách các tính năng cốt lõi về quản lý danh mục (CRUD Category)
      coreCategoryFeatures: [
        'Create a new category.',
        'View the category list.',
        'Rename an existing category.',
        'Delete an unused category.'
      ],
      // Danh sách các tính năng bổ sung nâng cao được phát triển trong dự án
      additionalFeatures: [
        { icon: 'search', title: 'Search, Filter, and Sort', description: 'Users can search words, filter by category or favourite status, and sort by newest or oldest.' },
        { icon: 'star outline', title: 'Favourite Words', description: 'Words can be marked as favourites from the list page and the detail page.' },
        { icon: 'chart bar', title: 'Dashboard Summary', description: 'The dashboard shows total words, favourite count, category count, and recent quiz attempts.' },
        { icon: 'graduation cap', title: 'Vocabulary Quiz', description: 'Users can start quiz sessions with selected question and answer languages and different word sets.' },
        { icon: 'history', title: 'Quiz History and Retake', description: 'Quiz results are stored in localStorage, and retake word selections are passed through URL query parameters.' },
        { icon: 'volume up', title: 'Speech Playback', description: 'The word details page uses browser speech synthesis to pronounce saved words.' },
        { icon: 'plus circle', title: 'Inline Category Creation', description: 'Users can select an existing category or create a new one directly within the word form.' },
        { icon: 'refresh', title: 'Category Name Sync', description: 'Categories use ObjectId references — renaming a category instantly updates all linked words via populate.' },
        { icon: 'check circle', title: 'Validation and Error Feedback', description: 'The project validates user input and shows success or error feedback through flash messages.' }
      ]
    };
  }
};
</script>

<style scoped>
.about-page {
  padding-bottom: 2.5rem;
}

/* Viền gradient bao quanh toàn trang */
.about-frame {
  padding: 1.25rem;
  border: 2px solid transparent;
  border-radius: 18px;
  background:
    linear-gradient(#f8fafc, #f8fafc) padding-box,
    linear-gradient(135deg, #a7c4e8 0%, #9ccdb4 50%, #e6c98c 100%) border-box;
}

/* ── Hero ─────────────────────────────────────────────────────────── */
.about-hero {
  margin-bottom: 1.25rem;
  padding: 1.75rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
}

.about-hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
  gap: 1.75rem;
  align-items: center;
}

.about-id-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.about-avatar {
  display: flex;
  flex: 0 0 auto;
  width: 64px;
  height: 64px;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: #eef2f9;
  border: 1px solid #ccd8ea;
}

.about-avatar span {
  color: #4c6fae;
  font-size: 1.25rem;
  font-weight: 800;
}

.about-hero-eyebrow {
  color: #4c6fae;
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: 0.25rem;
}

.about-hero-left h1 {
  margin: 0;
  color: #0f172a;
  font-size: 1.55rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.about-hero-role {
  margin: 0.15rem 0 0;
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 500;
}

.about-hero-bio {
  margin: 1.1rem 0 0;
  color: #475569;
  font-size: 0.85rem;
  line-height: 1.7;
}

.about-fact-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.about-fact {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.35rem 0.8rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  color: #475569;
  font-size: 0.75rem;
  font-weight: 500;
}

.about-fact .icon {
  display: block;
  margin: 0 !important;
  color: #4c6fae;
  font-size: 0.8rem;
  line-height: 1;
}

/* Dải ngôn ngữ với flag đúng màu */
.about-lang-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.9rem;
  margin-top: 0.9rem;
}

.about-lang-label {
  color: #94a3b8;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.about-lang {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: #334155;
  font-size: 0.8rem;
  font-weight: 600;
}

.about-lang .flag {
  margin: 0 !important;
}

/* ── Code card giả lập editor ─────────────────────────────────────── */
.about-code-card {
  overflow: hidden;
  background: #0f172a;
  border-radius: 10px;
  border: 1px solid #1e293b;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.18);
}

.code-card-bar {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.65rem 0.9rem;
  background: #1e293b;
}

.code-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.code-dot-red { background: #ef4444; }
.code-dot-yellow { background: #f59e0b; }
.code-dot-green { background: #22c55e; }

.code-card-name {
  margin-left: 0.5rem;
  color: #94a3b8;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 0.72rem;
}

.code-card-body {
  margin: 0;
  padding: 1rem 1.1rem 1.15rem;
  color: #e2e8f0;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 0.78rem;
  line-height: 1.75;
  white-space: pre;
  overflow-x: auto;
}

.c-kw { color: #7dd3fc; }
.c-var { color: #fbbf24; }
.c-str { color: #86efac; }
.c-pun { color: #64748b; }

/* ── Hero actions ─────────────────────────────────────────────────── */
.about-hero-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid #f1f5f9;
}

.about-github-button {
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.65rem 1.1rem;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  color: #0f172a;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.about-github-button:hover {
  color: #0f172a;
  border-color: #94a3b8;
  box-shadow: 0 3px 8px rgba(15, 23, 42, 0.08);
}

.about-github-button > .github.icon {
  margin: 0 !important;
  font-size: 1.4rem;
  line-height: 1;
}

.about-github-button-text {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}

.about-github-button-text strong {
  font-size: 0.85rem;
  font-weight: 700;
}

.about-github-button-text small {
  color: #64748b;
  font-size: 0.7rem;
  font-weight: 500;
}

/* ── GitHub spotlight ─────────────────────────────────────────────── */
.about-github-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;
  margin-bottom: 1.25rem;
  padding: 1.25rem 1.5rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
}

.about-github-panel-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 0;
}

.about-github-panel-icon {
  display: inline-flex;
  flex: 0 0 auto;
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #eef2f9;
  color: #4c6fae;
}

.about-github-panel-icon .icon {
  display: block;
  margin: 0 !important;
  font-size: 1.3rem;
  line-height: 1;
}

.about-github-panel-left h2 {
  margin: 0 0 0.15rem;
  color: #0f172a;
  font-size: 0.95rem;
  font-weight: 700;
}

.about-github-panel-left p {
  margin: 0;
  color: #64748b;
  font-size: 0.8rem;
}

.about-github-cta {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.1rem;
  background: #3f66b0;
  border-radius: 8px;
  color: #ffffff;
  font-size: 0.82rem;
  font-weight: 600;
  transition: background 0.15s ease;
}

.about-github-cta:hover {
  background: #34569c;
  color: #ffffff;
}

.about-github-cta .icon {
  display: block;
  margin: 0 !important;
  font-size: 1rem;
  line-height: 1;
}

/* ── Stack theo tầng ──────────────────────────────────────────────── */
.stack-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.stack-col {
  padding: 1rem 1.1rem;
  background: #f8fafc;
  border: 1px solid #eef2f7;
  border-radius: 10px;
}

.stack-col-head {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-bottom: 0.75rem;
  color: #0f172a;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.stack-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.stack-head-blue .stack-dot { background: #4c6fae; }
.stack-head-green .stack-dot { background: #58a184; }
.stack-head-amber .stack-dot { background: #c99a4b; }

.stack-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.stack-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.3rem 0.75rem 0.3rem 0.4rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  color: #334155;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: default;
}

/* Badge màu thương hiệu của từng công nghệ */
.stack-pill-img {
  flex: 0 0 auto;
  width: 16px;
  height: 16px;
}

.stack-pill-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 18px;
  height: 18px;
  border-radius: 5px;
  color: #ffffff;
  font-size: 0.62rem;
  font-weight: 800;
}

/* ── Panels content ───────────────────────────────────────────────── */
.about-copy {
  margin: 0;
  color: #475569;
  line-height: 1.65;
  font-size: 0.875rem;
}
.about-copy + .about-copy {
  margin-top: 0.75rem;
}

.about-grid,
.about-list-grid,
.about-footer-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
}

.about-card,
.about-list-card {
  padding: 1rem 1.15rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #ffffff;
}

.about-card h3,
.about-list-card h3 {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin: 0 0 0.45rem;
  color: #0f172a;
  font-size: 0.875rem;
  font-weight: 700;
}

.about-card h3 .icon,
.about-list-card h3 .icon {
  display: block;
  margin: 0 !important;
  font-size: 0.85rem;
  line-height: 1;
}

.about-card p,
.about-list-card li {
  color: #475569;
  font-size: 0.8rem;
  line-height: 1.55;
}

.about-list-card ul {
  margin: 0;
  padding-left: 1.1rem;
}

.about-list-card li + li {
  margin-top: 0.4rem;
}

.about-list-card li::marker {
  color: #4c6fae;
}

.text-blue { color: #4c6fae; }

/* ── Footer signature ─────────────────────────────────────────────── */
.about-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.1rem;
  border-top: 1px solid #e2e8f0;
  color: #94a3b8;
  font-size: 0.78rem;
}

.about-footer a {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: #475569;
  font-weight: 600;
  transition: color 0.15s ease;
}

.about-footer a:hover {
  color: #0f172a;
}

.about-footer a .icon {
  display: block;
  margin: 0 !important;
  font-size: 1rem;
  line-height: 1;
}

@media (max-width: 900px) {
  .about-hero-grid,
  .stack-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767px) {
  .about-github-panel {
    flex-direction: column;
    align-items: flex-start;
  }
  .about-grid,
  .about-list-grid,
  .about-footer-grid {
    grid-template-columns: 1fr;
  }
}
</style>
