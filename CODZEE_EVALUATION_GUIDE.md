# Codzee First-Round Evaluation Guide
**Candidate:** Parag Akabari (paragakabari.tech@gmail.com)  
**Project:** TaskFlow API (`taskflow-api`)

---

## 📌 Summary of Branches Created Locally

1. **`main`**: Complete base production-ready TypeScript/Express REST API with clean layered architecture, CRUD operations, and baseline test suite.
2. **`feat/rate-limiting-and-auth` (PR 1 - Feature & Security Middleware)**:
   - Sliding-window rate limiter tracking client IP with `X-RateLimit-*` headers and HTTP 429 response.
   - API Key authentication middleware.
   - Unit tests covering rate limits and authentication.
3. **`fix/security-and-input-validation` (PR 2 - Bug Fix & Security Hardening)**:
   - Constant-time comparison (`safeCompare`) using `crypto.timingSafeEqual` to prevent timing attacks.
   - ReDoS protection with `escapeRegex` in queries.
   - HTML/XSS input sanitization and payload validation schemas.
   - Security regression tests.
4. **`refactor/event-driven-cache-and-pagination` (PR 3 - Performance & Architecture)**:
   - In-memory LRU Cache Service with TTL.
   - Decoupled `TaskEventEmitter` for event-driven cache invalidation (`task:created`, `task:updated`, `task:deleted`).
   - Limit/offset pagination with rich metadata (`hasNextPage`, `totalPages`, etc.).
   - Cache and pagination tests.

---

## 🚀 Step-by-Step Instructions to Push and Submit

### Step 1: Create a Public Repository on GitHub
1. Log in to [GitHub](https://github.com/new).
2. Create a new repository:
   - **Repository name:** `taskflow-api` (or any name you prefer)
   - **Visibility:** **Public** (Crucial: Codzee requires public repo)
   - **Initialize with README:** Unchecked (do not check, we already have README)
3. Copy your repository URL, e.g.: `https://github.com/<your-github-username>/taskflow-api.git`

### Step 2: Push Branches to GitHub
Open your terminal in `/Users/karandudhat/Downloads/Codzee's First Round` and run:

```bash
# Add your remote URL (replace <your-github-username> with your GitHub username)
git remote add origin https://github.com/<your-github-username>/taskflow-api.git

# Push main branch
git push -u origin main

# Push the 3 PR branches
git push -u origin feat/rate-limiting-and-auth
git push -u origin fix/security-and-input-validation
git push -u origin refactor/event-driven-cache-and-pagination
```

---

### Step 3: Install Codzee on the Repository
1. Go to [www.codzee.io](https://www.codzee.io/)
2. Click **Sign in with GitHub**
3. Grant permissions and install the Codzee GitHub App on your `taskflow-api` repository.
4. Verify that Codzee shows the repository as connected/active.

---

### Step 4: Open 3 Pull Requests on GitHub
Go to your GitHub repository and open 3 Pull Requests targeting `main`:

#### PR 1:
- **Base:** `main`  ← **Compare:** `feat/rate-limiting-and-auth`
- **Title:** `feat: implement sliding-window rate limiting and API key authentication`
- **Description:**
  ```markdown
  ### Summary of Changes
  - Implemented sliding-window in-memory rate limiting middleware.
  - Added X-RateLimit headers (Limit, Remaining, Reset) and 429 Too Many Requests handling.
  - Added API key authentication middleware supporting Bearer/X-API-Key headers.
  - Added unit and integration tests for rate limiting and authentication.
  ```

#### PR 2:
- **Base:** `main`  ← **Compare:** `fix/security-and-input-validation`
- **Title:** `fix(security): sanitize inputs, escape regex to prevent ReDoS, and timing-safe comparison`
- **Description:**
  ```markdown
  ### Summary of Changes
  - Added constant-time string comparison (`crypto.timingSafeEqual`) to prevent timing attacks.
  - Added `escapeRegex` utility to prevent ReDoS vulnerabilities in search queries.
  - Added input validation & sanitization middleware to prevent XSS and prototype pollution.
  - Added security test suite.
  ```

#### PR 3:
- **Base:** `main`  ← **Compare:** `refactor/event-driven-cache-and-pagination`
- **Title:** `refactor(performance): implement LRU cache with TTL, event-driven invalidation, and pagination`
- **Description:**
  ```markdown
  ### Summary of Changes
  - Added in-memory LRU Cache Service with TTL and eviction.
  - Decoupled domain events (`task:created`, `task:updated`, `task:deleted`) using Node EventEmitter for automated cache invalidation.
  - Implemented offset/limit pagination with metadata (`page`, `limit`, `totalPages`, `hasNextPage`).
  - Added automated tests for cache hits/misses, invalidation, and pagination.
  ```

---

### Step 5: Observe Codzee's Automated Reviews
Wait a few moments for Codzee to analyze each PR. Check:
- Review summary comments
- In-line suggestions and code comments
- Accuracy in spotting security implications, type safety, performance, and testing

---

### Step 6: Submit the Google Form
Form Link: [Google Form](https://docs.google.com/forms/d/e/1FAIpQLSehcRciBA1GAa6NplMnMlMrF7yeySpe_QxdVEOAd7MUp28RYw/viewform)

Use the answers prepared in the evaluation feedback template below.
