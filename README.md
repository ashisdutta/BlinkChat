# 📍 BlinkChat - Location-Based Real-Time Chat

**BlinkChat** is a hyper-local, ephemeral messaging platform. It allows users to discover and join chat rooms based on their physical location (latitude/longitude). To keep conversations fresh and privacy-focused, all messages are ephemeral and automatically expire after 2 hours.

🔗 **Live Demo:** [https://blinkchat.eradev.xyz](https://blinkchat.eradev.xyz)

---

## 📸 Sneak Peek

**Landing page**

<img width="1880" height="860" alt="Screenshot 2026-04-06 212353" src="https://github.com/user-attachments/assets/b997ff55-0df1-44a0-b7a1-3bae4518fff7" />

**Create Room**


<img width="1340" height="815" alt="Screenshot 2026-04-06 212635" src="https://github.com/user-attachments/assets/0636a4ba-100e-49ca-99be-e7886baa439d" />



**Nearby Room**


<img width="1233" height="802" alt="Screenshot 2026-04-06 212744" src="https://github.com/user-attachments/assets/cd571e49-e4c2-43ad-aade-31ad65a3dd46" />

---

## 🛠 What I Have Used (Tech Stack)

### **Frontend**
* **Next.js 14:** React framework for SSR and optimized performance.
* **Tailwind CSS & Shadcn UI:** For responsive, mobile-first styling and accessible UI components.
* **Axios:** For API requests with secure HttpOnly cookie handling.

### **Backend**
* **Node.js & Express:** Core server runtime and API framework.
* **Socket.io:** For real-time, bi-directional event-based communication.
* **Prisma ORM:** Type-safe database interactions.

### **Database & Caching**
* **PostgreSQL:** Primary relational database (storing users, rooms, and active messages).
* **Redis:** Used as an in-memory cache to instantly serve the latest 50 messages per room, and as a message queue for high-throughput chat events.

### **Infrastructure & Deployment**
* **Docker:** Containerized PostgreSQL and backend environment.
* **AWS EC2:** Hosting the Node.js API, WebSockets, and Database layer.
* **Vercel:** Hosting the Next.js frontend with global edge caching.

---

## 🚀 Key Engineering Features

1. **Geo-Fencing:** Custom spatial logic to calculate the distance between a user's location and available chat rooms.
2. **Custom TTL Service:** A Node.js background process that runs every 10 minutes to auto-delete messages older than 2 hours directly from PostgreSQL.
3. **Cursor-Based Pagination:** Enables seamless infinite scrolling of chat history without performance lag.
4. **Optimized Read/Writes:** Chat messages are optimistically rendered via WebSockets, queued in Redis, and asynchronously flushed to PostgreSQL to handle high server loads.

---

## 📐 System Architecture

Below is the high-level architecture of BlinkChat, demonstrating how traffic flows from the client, through our edge caching, down to the AWS EC2 instance, and how Redis handles real-time message brokering before persisting to PostgreSQL.
<img width="721" height="369" alt="BlinkChat" src="https://github.com/user-attachments/assets/d6596ed8-6181-440d-9d05-14830296eaf8" />


---

## 🔌 Core WebSocket Events

BlinkChat uses a custom event-driven architecture via Socket.io. Here are the primary events:

* `join_room`: Client emits this with a `roomId` to subscribe to a specific geo-fenced room.
* `send_message`: Client emits this to push a new message to the Redis queue.
* `receive_message`: Server broadcasts this to all clients in a specific room when a new message is processed.
* `room_updated`: Triggers UI refreshes for room participant counts and latest message previews.

---

## ⚙️ How to Setup (Local Development)

Follow these steps to run the BlinkChat application on your local machine.

### **Prerequisites**
Make sure you have the following installed:
* [Node.js](https://nodejs.org/) (v18 or higher)
* [Docker](https://www.docker.com/) & Docker Compose
* Git

### **1. Clone the Repository**
```bash
git clone [https://github.com/your-username/blinkchat.git](https://github.com/your-username/blinkchat.git)
cd blinkchat
```
### **2. Set Up Environment Variables**
Create server/.env
PORT=4000
 **Update with your local Postgres credentials if not using docker-compose default**
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/blinkchat"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your_super_secret_jwt_string"
CLIENT_URL="http://localhost:3000"

### **3 Start Infrastructure (PostgreSQL & Redis)**

```bash
docker-compose up -d
```

### **4 Start the Server**
**Open a terminal instance and navigate to the backend folder:**
```bash
cd server
npm install
npx prisma db push  # Or `npx prisma migrate dev`

npm run dev
```
