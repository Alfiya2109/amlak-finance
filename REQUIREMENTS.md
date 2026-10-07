# VerifyLetter — Amlak Finance PJSC
## System Requirements, Technology Stack & Technical Rationale

This document provides a comprehensive overview of the **VerifyLetter** application architecture, complete technology stack breakdown, detailed rationale for why each technology was chosen, system requirements, user role permissions, and core feature workflows.

---

## 🛠️ 1. Complete Technology Stack & Rationale ("Why Each Tech Was Chosen")

### **A. Frontend Stack (Client-Side)**

| Technology | Purpose in Project | Rationale & Why It Was Used |
| :--- | :--- | :--- |
| **ReactJS (v19)** | Single-Page Application (SPA) UI framework | Provides fast declarative component rendering, reactive state management (`useState`, `useEffect`, `useMemo`), and smooth page transitions without full browser reloads. |
| **Vite** | Next-generation frontend build tool | Chosen over legacy Create-React-App for lightning-fast Hot Module Replacement (HMR), instant cold server start, and optimized production bundling. |
| **Tailwind CSS** | Utility-first CSS framework | Enables rapid styling for an ultra-modern, zero-scroll corporate UI. Used for glassmorphism effects, dynamic color palettes (Emerald Green `#0d5c46` and Gold `#f59e0b`), and responsive grid layouts. |
| **Lucide React Icons** | Iconography library | Provides high-contrast, modern SVG vector icons for interactive UI buttons, status indicators, and security badges. |
| **Axios** | HTTP Client | Handles asynchronous REST API requests between React and NestJS backend. Configured with request interceptors to automatically attach JWT Bearer tokens. |
| **React Router DOM (v7)** | Client-side routing | Manages browser navigation between Dashboard (`/dashboard`), Upload (`/upload`), Create User (`/create-user`), and Public Verification (`/verify/:id`). |

---

### **B. Backend Stack (Server-Side)**

| Technology | Purpose in Project | Rationale & Why It Was Used |
| :--- | :--- | :--- |
| **NestJS (v11)** | Enterprise Node.js Server Framework | Selected for its scalable modular architecture (Modules, Controllers, Services), TypeScript support, dependency injection, and clean separation of concerns. |
| **Prisma ORM (v6)** | Next-generation ORM | Provides auto-generated type-safe database queries, declarative database schema modeling (`schema.prisma`), and seamless database migration handling. |
| **SQLite / PostgreSQL** | Relational Database | Used for local instant development (SQLite `dev.db`) and production deployments (PostgreSQL) to store system users, 2FA TOTP secrets, and liability letter records. |
| **Passport.js & JWT (`@nestjs/jwt`)** | Authentication & Guard Protection | Implements stateless JWT Bearer token authentication. `@UseGuards(AuthGuard('jwt'))` protects sensitive API endpoints like uploading letters and accessing analytics. |
| **OTPLib (`otplib`)** | 2FA / TOTP Engine | Generates Time-based One-Time Password (TOTP) keys compatible with **Microsoft Authenticator** and Google Authenticator apps for 2-Factor Authentication. |
| **QRCode (`qrcode`)** | QR Code Generator | Dynamically generates Base64 DataURL QR codes for Microsoft Authenticator account registration and public letter verification links. |
| **pdf-lib (`pdf-lib`)** | In-Memory PDF Processing | manipulates uploaded PDF documents to stamp high-resolution verification QR codes on top-right corners without corrupting original document layout. |
| **bcrypt** | Password Hashing | Secures user passwords using salt rounds before saving to the database to protect against data breaches. |

---

## 👥 2. User Roles & Permission Matrix

| Feature / Screen | Admin Role | Staff User Role | Public (Unauthenticated) |
| :--- | :---: | :---: | :---: |
| **Login + 2FA (Microsoft Authenticator)** | ✅ | ✅ | ❌ |
| **System Dashboard & Real-Time Analytics** | ✅ | ✅ | ❌ |
| **Issued Letters Registry Table** | ✅ | ✅ | ❌ |
| **Download PDF & Copy Verification Link** | ✅ | ✅ | ❌ |
| **Upload Liability Letter & Embed QR** | ✅ | ✅ | ❌ |
| **Create New User Account** | ✅ | ❌ | ❌ |
| **Public Document Verification (`/verify/:id`)** | ✅ | ✅ | ✅ |

---

## 🔐 3. Core Feature Workflows

### **1. Microsoft Authenticator 2-Factor Authentication (2FA)**
* User logs in with Username and Password.
* Server verifies credentials and returns a 2FA prompt with a QR Code and TOTP secret.
* User scans QR Code using **Microsoft Authenticator** app on their mobile phone.
* Entering the live 6-digit TOTP code grants access and issues a signed JWT token.

### **2. Generate Verifiable Letter & PDF QR Embedding**
* User enters Bank Name, **12-character Alphanumeric Account Number** (`maxLength={12}` with uppercase formatting), Issue Date, Expiry Date, and attaches a PDF file.
* NestJS processes the file using `pdf-lib`, calculates current local host network IP (`http://192.168.0.113:5173/verify/<letterId>`), stamps the vector QR code onto the PDF header, and saves the record.

### **3. Public Document Verification (`/verify/:id`)**
* External party scans the QR code or opens the verification link.
* For security, the system prompts for the **12-character Account Number**.
* Upon successful match, the system reveals document authenticity (**Verified Active** or **Expired/Invalid**) along with official letter details.

### **4. System Dashboard & Analytics**
* Displays key metric cards: Total Letters, Active Letters, Expired Letters, and Authorized Issuers.
* Features multi-column sorting (by Issue Date, Letter ID, Bank Name, Account Number, Issuer, Status), status pill tabs (`All`, `Active`, `Expired`), global search, and issuer filter dropdown.

---

## 🔒 4. System Security & Input Validation Requirements

1. **Strict Password Complexity Policy:**
   * Minimum 8 characters long
   * At least 1 Uppercase Letter (`A-Z`)
   * At least 1 Lowercase Letter (`a-z`)
   * At least 1 Numeric Digit (`0-9`)
   * At least 1 Special Symbol (`@`, `#`, `$`, `%`, etc.)
   * Enforced on both Frontend UI (live checklist) and NestJS Backend (`BadRequestException`).

2. **Account Number Format:**
   * Strictly **12 Alphanumeric Characters** (`/^[A-Z0-9]{12}$/`).
   * Automatic uppercase conversion and input filtering (`replace(/[^a-zA-Z0-9]/g, '')`).

3. **Cross-Device Mobile Camera Support:**
   * Native Node `os.networkInterfaces()` IP detection engine automatically resolves host Wi-Fi IP address so mobile phone cameras can scan QR codes on the local Wi-Fi network.

---

## 📁 5. Project Directory Structure

```
15-Amlak-Finance/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Prisma Database Schema (User & Letter models)
│   │   ├── seed.ts             # Database Seed Script (admin2, staff1, demo letters)
│   │   └── dev.db              # SQLite Database
│   ├── src/
│   │   ├── auth/               # Auth Module (JWT, 2FA TOTP, Microsoft Authenticator)
│   │   ├── letters/            # Letters Module (PDF processing, QR embedding, stats)
│   │   ├── prisma/             # Prisma Service Provider
│   │   └── main.ts             # NestJS Application Entrypoint (Port 5000)
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/         # Shared UI Components (Sidebar Navbar)
    │   ├── context/            # AuthContext (JWT state management)
    │   ├── pages/              # App Pages (Login, Dashboard, Upload, CreateUser, VerifyPublic)
    │   ├── api.js              # Axios Client Instance (window.location.hostname binding)
    │   └── App.jsx             # React Routes Entrypoint
    ├── index.html
    └── package.json
```

---

## 🚀 6. Setup & Execution Commands

### **Backend Server:**
```bash
cd backend
npm install
npx prisma db push
npm run build
node dist/main.js
```
*Backend runs on `http://0.0.0.0:5000`*

### **Frontend App:**
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173` / `http://192.168.0.113:5173`*
