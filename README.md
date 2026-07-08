
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

## 2. Future Improvements

With more time, I would improve **Notice Archiving & Engagement Analytics**:
- **Current Limitation:** Notices are currently either active or deleted. If an event passes, we have to delete the notice to keep the board clean, losing the announcement history.
- **Proposed Solution:** Implement an archiving status where notices are automatically archived once their publish date passes, filtering them out of the active board. We would also add a "read counter" or student confirmation clicks so staff can track how many students read each notice.

---

## 3. How AI was Used

The AI assistant, Antigravity, assisted in building this project in the following specific areas:
- **Framework Initialization & Routing:** Scaffolded the Next.js project ensuring the Pages Router structure was used exclusively with no modern `/app` directory conflicts, utilizing custom imports (`@/*` aliases) correctly.
- **Prisma 7 Compatibility Adaptation:** Successfully navigated Prisma 7's new decoupling rules (where database URLs are no longer allowed inside `schema.prisma` and must be defined in `prisma.config.ts`). Programmed the runtime `lib/prisma.js` singleton client to parse raw connection URLs via Node's `URL` utility into the required `@prisma/adapter-mariadb` driver adapter configuration.
- **bulletin board CSS Theming:** Authored the CSS-first Tailwind v4 styling system in `globals.css` containing corkboard radial-gradients, Crimson physical pin icons, and randomized paper skews (`paper-note-skew-left`/`paper-note-skew-right`) to give the notice cards a realistic and custom look on hover.
- **Sanitization & Security Review:** Structured the `lib/validateNotice.js` validation utility and integer URL parsers to ensure no raw, unsanitized inputs reach database queries, relying entirely on Prisma's built-in parameterization to avoid SQL injections.

