
# School Bulletin Board

A Next.js application built with the Pages Router, styled with Tailwind CSS v4, and backed by a MySQL database using Prisma 7. The application replicates a realistic school notice board with paper-note skews and pins, support for scheduling announcements, and full CRUD capabilities with server-side validation.

---

## 1. How to Run the Project Locally

### Prerequisites
- Node.js (v18.x or newer)
- A running MySQL or MariaDB database instance

### Setup Steps

1. **Install Dependencies**
   Install all package dependencies:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   Copy the example environment file to `.env`:
   ```bash
   cp .env.example .env
   ```
   Open the `.env` file and replace the `DATABASE_URL` credentials placeholder with your active MySQL database credentials:
   ```env
   DATABASE_URL="mysql://username:password@localhost:3306/notice_board"
   ```

3. **Generate Prisma Client**
   Run the generator to create local Prisma client types:
   ```bash
   npx prisma generate
   ```

4. **Sync Schema to Database**
   Push the notice schema definition directly to your MySQL database to create the table and enums:
   ```bash
   npx prisma db push
   ```

5. **Run Development Server**
   Start the Next.js local development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

