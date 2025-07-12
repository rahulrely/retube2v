# Retube 🎥

A full-stack video management platform built with Node.js, MongoDB, and Express.js — featuring **custom Google OAuth**, **YouTube Data API integration**, **Cloudinary video uploads**, and **role-based access**.

## 🔗 Live Demo

🌐 [retube.vercel.app](https://retube.vercel.app)

---

## ✨ Features

- 🔐 **OAuth Authentication**
  - Google Sign-in with custom OAuth flow
- 🎥 **YouTube Integration**
  - Uses YouTube Data API (upload scope) for seamless video publishing
- ☁️ **Cloudinary Integration**
  - Store and stream videos securely
- 🧑‍🤝‍🧑 **Role-Based Access**
  - Invite-only registration and user roles
- 🔒 **Secure Auth**
  - JWT token-based authentication system
- ⚙️ **API-Driven Backend**
  - RESTful APIs for frontend consumption
- 📦 **Modular Structure**
  - Easy to scale and maintain

---

## 📁 Project Structure

```bash
retube2v/
├── controllers/        # Request handlers (auth, user, video)
├── middlewares/        # Authentication and error handling
├── models/             # MongoDB schemas
├── routes/             # API routes
├── utils/              # Reusable utility functions
├── config/             # OAuth and DB configs
├── uploads/            # Cloudinary upload utilities
├── app.js              # Express app setup
├── server.js           # Entry point
└── .env                # Environment variables
```

---

## 🧠 Tech Stack

- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **OAuth**: Google OAuth2 (YouTube upload scope)
- **Cloud**: Cloudinary (video uploads)
- **Auth**: JWT (Access & Refresh Tokens)
- **Frontend**: Next.js (separate repo)

---

## 🛠️ Setup Instructions

```bash
# Clone the repo
git clone https://github.com/rahulrely/retube2v.git
cd retube2v

# Install dependencies
npm install

# Set up your .env file
cp .env.sample .env

# Run the server
npm start
```

---

## 🔐 Environment Variables

Rename `.env.sample` to `.env` and provide the following keys:

```env
PORT = 
CORS_ORIGIN = 
DOMAIN = 
FRONTEND_SUCCESS_URL = 
FRONTEND_SEC_SUCCESS_URL =
FRONTEND_ERROR_URL = 

ACCESS_TOKEN_SECRET =
ACCESS_TOKEN_EXPIRY = 

REFRESH_TOKEN_SECRET = 
REFRESH_TOKEN_EXPIRY =

TEMP_TOKEN_SECRET = 
TEMP_TOKEN_EXPIRY = 


MONGO_URI = 

CLOUDINARY_NAME =
CLOUDINARY_URL =
CLOUDINARY_KEY = 
CLOUDINARY_SECRET = 

GOOGLE_CLIENT_ID = 
GOOGLE_CLIENT_SECRET =
GOOGLE_REDIRECT_URL = 
GOOGLE_CLIENT_URL_UPLOAD = 


RESEND_API_KEY =

EXPRESS_SESSION_SECRET = 
```

---

## 📌 To-Do

- [✓] Google OAuth with YouTube upload scope
- [✓] Cloudinary video integration
- [✓] Role-based access control
- [ ] Video analytics dashboard
- [ ] Admin panel for content moderation
- [ ] Add support for AWS S3 / Azure Blob / Google Cloud Storage

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Pull requests are welcome! If you have suggestions or ideas, feel free to open an issue or fork the project.

---

## 🧑‍💻 Author

- **Rahul Singh** — [GitHub](https://github.com/rahulrely) | [LinkedIn](https://linkedin.com/in/rahulrely)
