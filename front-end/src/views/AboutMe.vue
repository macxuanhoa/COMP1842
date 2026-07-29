<template>
  <div class="workspace-page about-page">
    <header class="workspace-header">
      <div>
        <div class="workspace-eyebrow">
          <i class="id badge icon"></i>
          Student profile
        </div>
        <h1>About Me</h1>
        <p>Student information and a code-based overview of this coursework project.</p>
      </div>
      <div class="workspace-header__actions">
        <router-link to="/dashboard" class="ui basic primary button">
          <i class="arrow left icon"></i>
          Back to Dashboard
        </router-link>
      </div>
    </header>

    <section class="ui segment workspace-panel">
      <div class="workspace-panel-heading">
        <div class="workspace-panel-heading__title">
          <span class="workspace-panel-icon green" aria-hidden="true">
            <i class="user circle icon"></i>
          </span>
          <div>
            <h2>Profile</h2>
            <p>Basic student information for COMP1842.</p>
          </div>
        </div>
      </div>

      <div class="about-profile">
        <div class="about-avatar" aria-hidden="true">
          <i class="graduation cap icon"></i>
        </div>

        <div class="about-profile__content">
          <h3>Mạc Xuân Hòa</h3>
          <p class="about-profile__intro">
            Hello, my name is Mạc Xuân Hòa. I am a student at the University of Greenwich studying
            COMP1842 – Web Programming 2. I am interested in web development and enjoy creating
            applications that solve practical problems.
          </p>

          <div class="ui relaxed list about-profile__list">
            <div class="item">
              <i class="id card outline icon"></i>
              <div class="content">
                <div class="header">Student ID</div>
                <div class="description">001361516</div>
              </div>
            </div>
            <div class="item">
              <i class="book icon"></i>
              <div class="content">
                <div class="header">Module</div>
                <div class="description">COMP1842 – Web Programming 2</div>
              </div>
            </div>
            <div class="item">
              <i class="university icon"></i>
              <div class="content">
                <div class="header">University</div>
                <div class="description">University of Greenwich</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="ui segment workspace-panel">
      <div class="workspace-panel-heading">
        <div class="workspace-panel-heading__title">
          <span class="workspace-panel-icon violet" aria-hidden="true">
            <i class="info circle icon"></i>
          </span>
          <div>
            <h2>About The Project</h2>
            <p>Written from the source code that is currently in the project.</p>
          </div>
        </div>
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

    <section class="ui segment workspace-panel">
      <div class="workspace-panel-heading">
        <div class="workspace-panel-heading__title">
          <span class="workspace-panel-icon orange" aria-hidden="true">
            <i class="code icon"></i>
          </span>
          <div>
            <h2>Technologies Used</h2>
            <p>Only technologies confirmed in the current source code are listed here.</p>
          </div>
        </div>
      </div>

      <div class="about-grid">
        <article v-for="tech in technologies" :key="tech.name" class="about-card">
          <h3>{{ tech.name }}</h3>
          <p>{{ tech.description }}</p>
        </article>
      </div>
    </section>

    <section class="ui segment workspace-panel">
      <div class="workspace-panel-heading">
        <div class="workspace-panel-heading__title">
          <span class="workspace-panel-icon" aria-hidden="true">
            <i class="tasks icon"></i>
          </span>
          <div>
            <h2>Core Functionality</h2>
            <p>CRUD features found in routes, views, components, and controllers.</p>
          </div>
        </div>
      </div>

      <div class="about-list-grid">
        <div class="about-list-card">
          <h3>Word Management</h3>
          <ul>
            <li v-for="item in coreWordFeatures" :key="item">{{ item }}</li>
          </ul>
        </div>
        <div class="about-list-card">
          <h3>Category Management</h3>
          <ul>
            <li v-for="item in coreCategoryFeatures" :key="item">{{ item }}</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="ui segment workspace-panel">
      <div class="workspace-panel-heading">
        <div class="workspace-panel-heading__title">
          <span class="workspace-panel-icon green" aria-hidden="true">
            <i class="plus square outline icon"></i>
          </span>
          <div>
            <h2>Additional Functionality</h2>
            <p>Features implemented beyond basic CRUD operations.</p>
          </div>
        </div>
      </div>

      <div class="about-grid">
        <article v-for="item in additionalFeatures" :key="item.title" class="about-card">
          <h3>{{ item.title }}</h3>
          <p>{{ item.description }}</p>
        </article>
      </div>
    </section>

    <section class="ui segment workspace-panel">
      <div class="workspace-panel-heading">
        <div class="workspace-panel-heading__title">
          <span class="workspace-panel-icon violet" aria-hidden="true">
            <i class="lightbulb icon"></i>
          </span>
          <div>
            <h2>What I Learned</h2>
            <p>Reflection based on the real project architecture.</p>
          </div>
        </div>
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
        <div class="workspace-panel-heading__title">
          <span class="workspace-panel-icon orange" aria-hidden="true">
            <i class="flag checkered icon"></i>
          </span>
          <div>
            <h2>Future Goal</h2>
            <p>A short goal for continued learning.</p>
          </div>
        </div>
      </div>

      <p class="about-copy">
        My goal is to continue improving my frontend and backend development skills and become a
        professional full-stack web developer.
      </p>
    </section>
  </div>
</template>

<script>
export default {
  name: 'about-me',
  data() {
    return {
      technologies: [
        {
          name: 'Vue.js 2',
          description: 'Builds the frontend user interface and page structure.'
        },
        {
          name: 'Vue Router',
          description: 'Handles page navigation with history mode routes.'
        },
        {
          name: 'Axios',
          description: 'Sends HTTP requests from the frontend to the backend API.'
        },
        {
          name: 'Semantic UI CSS',
          description: 'Provides the base styling for menus, forms, tables, buttons, and layout.'
        },
        {
          name: 'Vue Flash Message',
          description: 'Shows success and error toast messages in the frontend.'
        },
        {
          name: 'Node.js',
          description: 'Runs the backend JavaScript application.'
        },
        {
          name: 'Express.js',
          description: 'Handles backend routes and API requests for words and categories.'
        },
        {
          name: 'MongoDB',
          description: 'Stores the main application data for words and categories.'
        },
        {
          name: 'Mongoose',
          description: 'Defines schemas and communicates with MongoDB collections.'
        }
      ],
      coreWordFeatures: [
        'Create a new vocabulary word with German, English, and French translations.',
        'View the vocabulary library.',
        'View word details on a dedicated page.',
        'Edit an existing word.',
        'Delete a word.'
      ],
      coreCategoryFeatures: [
        'Create a new category.',
        'View the category list.',
        'Rename an existing category.',
        'Delete an unused category.'
      ],
      additionalFeatures: [
        {
          title: 'Search, Filter, and Sort',
          description: 'Users can search words, filter by category or favourite status, and sort by newest or oldest.'
        },
        {
          title: 'Favourite Words',
          description: 'Words can be marked as favourites from the list page and the detail page.'
        },
        {
          title: 'Dashboard Summary',
          description: 'The dashboard shows total words, favourite count, category count, and recent quiz attempts.'
        },
        {
          title: 'Vocabulary Quiz',
          description: 'Users can start quiz sessions with selected question and answer languages and different word sets.'
        },
        {
          title: 'Quiz History and Retake',
          description: 'Quiz results are stored in localStorage, and a retake word list is passed through sessionStorage.'
        },
        {
          title: 'Speech Playback',
          description: 'The word details page uses browser speech synthesis to pronounce saved words.'
        },
        {
          title: 'Protected General Category',
          description: 'The default General category is created automatically and cannot be edited or deleted.'
        },
        {
          title: 'Category Rename Sync',
          description: 'When a category name changes, linked words are updated in the backend as well.'
        },
        {
          title: 'Validation and Error Feedback',
          description: 'The project validates user input and shows success or error feedback through flash messages.'
        }
      ]
    };
  }
};
</script>

<style scoped>
.about-page {
  padding-bottom: 2.5rem;
}

.about-profile {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  gap: 1.5rem;
  align-items: start;
}

.about-avatar {
  display: flex;
  width: 120px;
  height: 120px;
  align-items: center;
  justify-content: center;
  border-radius: 28px;
  color: #2185d0;
  background: linear-gradient(135deg, #eaf5fc, #f5f9ff);
  box-shadow: inset 0 0 0 1px #d8e8f6;
}

.about-avatar .icon {
  margin: 0 !important;
  font-size: 3rem;
}

.about-profile__content h3 {
  margin: 0 0 0.65rem;
  font-size: 1.5rem;
  color: #172033;
}

.about-profile__intro,
.about-copy {
  margin: 0;
  color: #4e596d;
  line-height: 1.7;
}

.about-copy + .about-copy {
  margin-top: 1rem;
}

.about-profile__list {
  margin-top: 1.25rem;
}

.about-profile__list .item {
  padding: 0.25rem 0;
}

.about-profile__list .icon {
  color: #2185d0;
}

.about-grid,
.about-list-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.about-card,
.about-list-card {
  padding: 1rem 1.1rem;
  border: 1px solid #e5e9f0;
  border-radius: 12px;
  background: #fafbfc;
}

.about-card h3,
.about-list-card h3 {
  margin: 0 0 0.45rem;
  color: #172033;
  font-size: 1rem;
}

.about-card p,
.about-list-card li {
  color: #4e596d;
  line-height: 1.6;
}

.about-list-card ul {
  margin: 0;
  padding-left: 1.15rem;
}

.about-list-card li + li {
  margin-top: 0.45rem;
}

@media (max-width: 767px) {
  .about-profile,
  .about-grid,
  .about-list-grid {
    grid-template-columns: 1fr;
  }

  .about-avatar {
    width: 96px;
    height: 96px;
    border-radius: 24px;
  }
}
</style>
