# 🏗️ Karvanta - Indian Construction & Labour Marketplace

**Karvanta** is a production-ready MVP web application designed specifically for the Indian construction and unorganized labour market. It digitizes the traditional "Labour Chowk" by connecting homeowners, contractors (Thekedars), and skilled/daily-wage labourers (Karigars) on a single platform with built-in trust and verification.

---

## 🌟 Key Features

- **Multi-Role System:** Distinct experiences and features for 4 user types:
  - **Customers/Homeowners:** Can post jobs, search for verified contractors, and hire workers.
  - **Contractors (Thekedars):** Can build a professional profile, showcase their skills, and accept large projects.
  - **Workers (Karigars):** Can apply for daily-wage jobs in the live "Labour Chowk".
  - **Admins:** A secure moderation portal to approve/reject professional profiles, ensuring marketplace trust.
- **Digital Labour Chowk:** A real-time job board where customers post immediate requirements and workers can instantly apply.
- **Multilingual Support (i18n):** Native language support for Hindi, Marathi, Bengali, Gujarati, Punjabi, Odia, Tamil, Telugu, Kannada, Malayalam, and Assamese.
- **Real-Time Authentication:** Secure Email OTP (Magic Link) and Google OAuth integrations.
- **Admin Verification:** Professionals are marked as "Pending" until verified by an Admin, creating a secure, spam-free ecosystem.

---

## 🛠️ Technology Stack

This project is built using a modern, scalable, and lightweight tech stack:

### **Frontend**
- **Framework:** [React 18](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/) - For extremely fast HMR and optimized production builds.
- **Styling:** Vanilla CSS (`index.css`) utilizing modern CSS Variables for a robust design system without the bloat of large CSS frameworks.
- **Icons:** `lucide-react` for beautiful, consistent SVG icons.
- **Routing:** Built-in lightweight state-based routing (or `react-router-dom`).

### **Backend & Database (Supabase)**
- **Database:** PostgreSQL (Hosted via [Supabase](https://supabase.com/)).
- **Authentication:** Supabase Auth (Email Magic Links, OTP, Google OAuth).
- **Security:** Row Level Security (RLS) policies to ensure data privacy (e.g., users can only edit their own profiles).
- **Storage & APIs:** Direct database interactions via `@supabase/supabase-js`.

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- A [Supabase](https://supabase.com/) account for the database and authentication.

### 2. Clone the Repository
```bash
git clone https://github.com/ravitripathi6265/Project-Karvanta.git
cd Project-Karvanta
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Supabase Setup
1. Create a new project in your Supabase dashboard.
2. Go to the **SQL Editor** in Supabase and run the following files sequentially to set up your database tables and triggers:
   - Run the contents of `supabase_schema.sql` (Sets up profiles, roles, and auth triggers).
   - Run the contents of `jobs_schema.sql` (Sets up the labour posts and job applicants tables).
3. Go to **Authentication -> Providers** in Supabase and ensure **Email** login is enabled. (You can also enable Google OAuth here).

### 5. Environment Variables
Create a `.env` file in the root directory of the project and add your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 6. Run the Development Server
```bash
npm run dev
```
The app will be available at `http://localhost:5173`.

---

## 📁 Project Structure

```text
├── src/
│   ├── assets/           # Images and static assets
│   ├── components/       # Reusable React components (Navbar, Modals, Cards)
│   ├── context/          # React Context (AuthContext, ToastContext)
│   ├── i18n/             # Internationalization dictionaries and context
│   ├── lib/              # Utility libraries (Supabase client setup)
│   ├── pages/            # Top-level route components (Home, Dashboard, Admin)
│   ├── App.jsx           # Main application wrapper
│   └── index.css         # Global CSS variables and styling
├── jobs_schema.sql       # SQL file to generate job-related tables
├── supabase_schema.sql   # SQL file to generate auth & profile tables
└── package.json          # Project dependencies and scripts
```

---

## 🛡️ Role-Based Access Control (RBAC)
- **Admin Setup:** To make a user an Admin, you must manually update their `role` column to `'admin'` inside the `profiles` table in your Supabase dashboard. Once updated, they will gain access to the Admin Moderation Dashboard.

---

## 📝 License
This project is proprietary and intended for startup MVP usage.
