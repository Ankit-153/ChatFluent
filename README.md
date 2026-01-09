# 🗣️ ChatFluent

<div align="center">

![ChatFluent Banner](https://img.shields.io/badge/ChatFluent-Language%20Learning%20Chat%20App-blue?style=for-the-badge)

**A modern language learning platform that combines real-time chat with vocabulary building tools**

[![React](https://img.shields.io/badge/React-19.1-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=flat-square&logo=mongodb)](https://mongodb.com/)
[![Stream](https://img.shields.io/badge/Stream-Chat%20%26%20Video-005FFF?style=flat-square)](https://getstream.io/)

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Usage](#-usage) • [API](#-api-endpoints)

</div>

---

## 📖 About

ChatFluent is a full-stack language learning application that helps users practice languages through real-time chat with friends, build vocabulary notebooks, and collaborate on shared word lists. The app features AI-powered word translation and supports video/voice calls for immersive language practice.

## ✨ Features

### 🔐 Authentication & User Management
- User registration and login with JWT authentication
- Profile onboarding with native language and learning language selection
- Profile picture upload via URL
- Secure cookie-based sessions

### 💬 Real-Time Chat
- One-on-one messaging with friends
- Real-time message delivery using Stream Chat
- Message history and persistence
- Online/offline status indicators

### 📞 Video & Voice Calls
- High-quality video calls with friends
- Voice call support
- Powered by Stream Video SDK

### 👥 Friends System
- Send and receive friend requests
- Accept/reject friend requests
- View friend list and recommendations
- Notifications for friend activities

### 📚 Vocabulary Notebook
- Personal vocabulary notebook for saving words
- Add words with translations, examples, and language tags
- **AI-Powered Auto-Fill**: Enter a word and let AI generate translation, example sentence, and detect language
- Search through your vocabulary (server-side with MongoDB text index)
- Sort by date added or alphabetically (A-Z, Z-A)
- Server-side pagination for performance
- Edit and delete words
- Export vocabulary to **CSV** or **PDF**

### 🤝 Shared Lists (Collaborative Learning)
- Create shared vocabulary lists
- Invite friends as collaborators
- Collaborators can add words to shared lists
- Track who contributed each word
- Share individual words from your notebook to shared lists
- **AI-Powered Auto-Fill** for shared lists too

### 🎨 Themes
- Multiple theme options powered by DaisyUI
- Persistent theme selection
- Beautiful, responsive UI

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19** | UI Framework |
| **Vite** | Build tool & dev server |
| **TanStack Query** | Server state management |
| **Zustand** | Client state management |
| **React Router 7** | Routing |
| **Tailwind CSS** | Styling |
| **DaisyUI** | UI Components |
| **Lucide React** | Icons |
| **Stream Chat React** | Chat UI components |
| **Stream Video React SDK** | Video call UI |
| **Axios** | HTTP client |
| **React Hot Toast** | Notifications |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime |
| **Express.js** | Web framework |
| **MongoDB** | Database |
| **Mongoose** | ODM |
| **JWT** | Authentication |
| **bcryptjs** | Password hashing |
| **Stream Chat** | Real-time messaging |
| **Google Generative AI** | AI-powered translations |

### External Services
| Service | Purpose |
|---------|---------|
| **MongoDB Atlas** | Cloud database |
| **Stream** | Chat & Video infrastructure |
| **Google Gemini AI** | Word translation & examples |

## 📁 Project Structure

```
ChatFluent/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── ai.controller.js        # AI word generation
│   │   │   ├── auth.controller.js      # Authentication
│   │   │   ├── chat.controller.js      # Chat/Stream tokens
│   │   │   ├── sharedList.controller.js # Shared lists
│   │   │   ├── user.controller.js      # User & friends
│   │   │   └── vocabulary.controller.js # Vocabulary CRUD
│   │   ├── lib/
│   │   │   ├── db.js                   # MongoDB connection
│   │   │   └── stream.js               # Stream client
│   │   ├── middleware/
│   │   │   └── auth.middleware.js      # JWT verification
│   │   ├── models/
│   │   │   ├── FriendRequest.js
│   │   │   ├── SharedList.js
│   │   │   ├── User.js
│   │   │   └── Vocabulary.js
│   │   ├── routes/
│   │   │   ├── ai.routes.js
│   │   │   ├── auth.routes.js
│   │   │   ├── chat.routes.js
│   │   │   ├── sharedList.routes.js
│   │   │   ├── user.routes.js
│   │   │   └── vocabulary.routes.js
│   │   └── server.js
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CallButton.jsx
│   │   │   ├── ChatLoader.jsx
│   │   │   ├── FriendCard.jsx
│   │   │   ├── Layout.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── NoFriendsFound.jsx
│   │   │   ├── NoNotificationsFound.jsx
│   │   │   ├── PageLoader.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── ThemeSelector.jsx
│   │   ├── constants/
│   │   │   └── index.js                # Theme options
│   │   ├── hooks/
│   │   │   ├── useAuthUser.js
│   │   │   ├── useLogin.js
│   │   │   ├── useLogout.jsx
│   │   │   └── useSignUp.js
│   │   ├── lib/
│   │   │   ├── api.js                  # API functions
│   │   │   ├── axios.js                # Axios instance
│   │   │   └── utils.js
│   │   ├── pages/
│   │   │   ├── CallPage.jsx
│   │   │   ├── ChatPage.jsx
│   │   │   ├── Friends.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── NotificationsPage.jsx
│   │   │   ├── OnBoardingPage.jsx
│   │   │   ├── SharedListsPage.jsx
│   │   │   ├── SignUpPage.jsx
│   │   │   └── VocabularyPage.jsx
│   │   ├── store/
│   │   │   └── useThemeStore.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── package.json
└── README.md
```

## 🚀 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB)
- Stream account (for chat & video)
- Google AI API key (for Gemini)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/ChatFluent.git
cd ChatFluent
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
# Server
PORT=3000

# MongoDB
MONGO_URI=your_mongodb_connection_string

# JWT
JWT_SECRET_KEY=your_super_secret_jwt_key

# Stream Chat & Video
STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory (if needed):
```env
VITE_STREAM_API_KEY=your_stream_api_key
```

### 4. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The app will be available at:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

## 📱 Usage

### Getting Started
1. **Sign Up**: Create a new account with email and password
2. **Onboarding**: Set up your profile with:
   - Full name
   - Profile picture URL
   - Native language
   - Language you're learning
3. **Add Friends**: Browse recommended users and send friend requests
4. **Start Chatting**: Once friends accept, start conversations!

### Vocabulary Notebook
1. Navigate to **Notebook** in the sidebar
2. Click **Add New Word**
3. Enter a word (e.g., "Bonjour")
4. Click **✨ AI Fill** to auto-generate:
   - Translation (e.g., "Hello")
   - Example sentence (e.g., "Bonjour, comment ça va?")
   - Language (e.g., "French")
5. Save the word to your notebook
6. Use search, sort, and pagination to manage your vocabulary
7. Export to CSV or PDF anytime

### Shared Lists
1. Navigate to **Shared Lists** in the sidebar
2. Create a new list with a name and description
3. Share with friends by clicking the share icon
4. Collaborators can add words using the same AI-powered features
5. Track contributions from all collaborators

### Video Calls
1. Open a chat with a friend
2. Click the video call button
3. Allow camera/microphone permissions
4. Enjoy real-time video practice!

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/onboarding` | Complete profile setup |

### Users & Friends
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get recommended users |
| GET | `/api/users/friends` | Get friend list |
| POST | `/api/users/friend-request/:id` | Send friend request |
| GET | `/api/users/friend-requests` | Get incoming requests |
| PUT | `/api/users/friend-request/:id/accept` | Accept request |
| GET | `/api/users/outgoing-friend-requests` | Get sent requests |

### Vocabulary
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vocabulary` | Get vocabulary (paginated) |
| POST | `/api/vocabulary` | Add new word |
| PUT | `/api/vocabulary/:id` | Update word |
| DELETE | `/api/vocabulary/:id` | Delete word |
| GET | `/api/vocabulary/export` | Export all vocabulary |

### Shared Lists
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/shared-lists` | Create new list |
| GET | `/api/shared-lists/my-lists` | Get owned lists |
| GET | `/api/shared-lists/shared-with-me` | Get collaborated lists |
| GET | `/api/shared-lists/:id` | Get list details |
| DELETE | `/api/shared-lists/:id` | Delete list |
| POST | `/api/shared-lists/:id/collaborator` | Add collaborator |
| DELETE | `/api/shared-lists/:id/collaborator/:friendId` | Remove collaborator |
| POST | `/api/shared-lists/:id/word` | Add word to list |
| DELETE | `/api/shared-lists/:id/word/:wordId` | Remove word |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/word-details` | Generate word translation, example, language |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chat/token` | Get Stream chat token |

## 🎨 Available Themes

ChatFluent supports multiple themes via DaisyUI:
- Light
- Dark
- Cupcake
- Bumblebee
- Emerald
- Corporate
- Synthwave
- Retro
- Cyberpunk
- Valentine
- Halloween
- Garden
- Forest
- Aqua
- Lofi
- Pastel
- Fantasy
- Wireframe
- Black
- Luxury
- Dracula
- CMYK
- Autumn
- Business
- Acid
- Lemonade
- Night
- Coffee
- Winter
- Dim
- Nord
- Sunset

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## 👨‍💻 Author

**Ankit Gautam**

---

<div align="center">

Made with ❤️ for language learners everywhere

⭐ Star this repo if you find it helpful!

</div>
