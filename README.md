# COMP1842 – Web Programming 2 Coursework Submission

## Student & Course Information
- **Student Name**: Mạc Xuân Hòa
- **Student ID**: 001361516
- **Module**: COMP1842 – Web Programming 2
- **Institution**: University of Greenwich

---

## 📖 Project Overview
This repository contains a full-stack **MEVN** (MongoDB, Express, Vue.js, Node.js) web application designed for multilingual vocabulary learning and dictionary management across **German (DE)**, **English (EN)**, and **French (FR)**.

The application allows learners to build a dictionary, categorize vocabulary entries, bookmark favourites, listen to native pronunciations using the Web Speech API, track learning analytics on a dashboard, and complete interactive vocabulary quizzes with instant error review.

---

## ✨ Key Features

1. **Multilingual Vocabulary Library**:
   - Live search across German, English, and French terms.
   - Filtering by topic category and favourite status.
   - Sorting by newest or oldest added entries.
   - Client-side pagination and quick search resetting.

2. **Category Management**:
   - Create new categories dynamically.
   - Inline category renaming with keyboard shortcuts (`Enter` to save, `Esc` to cancel).
   - Referential integrity protection (prevents deletion of categories linked to existing vocabulary entries).

3. **Interactive Vocabulary Quizzes**:
   - Practice translating between supported languages.
   - Real-time score calculation and progress tracking.
   - Detailed result breakdown with one-click option to retake missed questions.
   - Persistent quiz history stored in browser `localStorage`.

4. **Speech Synthesis (Audio Pronunciation)**:
   - Instant native Web Speech API audio pronunciation for German (`de-DE`), English (`en-US`), and French (`fr-FR`).
   - Active visual playback feedback.

5. **Learning Dashboard**:
   - Overview metrics: Total words, favourites count, category count, and average quiz accuracy.
   - Recent quiz attempts table with option to retake past sessions.

---

## 🛠️ Technology Stack

- **Frontend**: Vue.js 2 (Options API), Vue Router, Semantic UI CSS, Axios, Vue Flash Message, Web Speech API.
- **Backend**: Node.js, Express.js, Mongoose ODM.
- **Database**: MongoDB.

---

## 🚀 Installation & Setup Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v14.x or higher)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) installed and running locally on port `27017`.

---

### 1. Server Setup (Backend API)
```bash
# Navigate to the server folder
cd server

# Install dependencies
npm install

# Start the Node/Express backend (runs on http://localhost:3000)
npm start
```

### 2. Frontend Setup
```bash
# Navigate to the front-end folder
cd ../front-end

# Install dependencies
npm install

# Start the Vue development server (runs on http://localhost:8080)
npm run serve
```

Once both servers are running, open your web browser and navigate to:
`http://localhost:8080`

---

## 📡 REST API Documentation

Base URL: `http://localhost:3000`

### Words API (`/words`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/words` | Retrieve all words populated with category data |
| `GET` | `/words/:id` | Retrieve a single word by ID |
| `POST` | `/words` | Create a new word entry |
| `PUT` | `/words/:id` | Update an existing word entry |
| `DELETE` | `/words/:id` | Delete a word by ID |

### Categories API (`/categories`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/categories` | Retrieve all categories |
| `POST` | `/categories` | Create a new category |
| `PUT` | `/categories/:id` | Update a category name |
| `DELETE` | `/categories/:id` | Delete a category by ID |

---

## 🧪 Production Build Verification

To verify that the frontend builds without compilation errors:
```bash
cd front-end
npm run build
```
The output bundle will be generated in `front-end/dist/`.
