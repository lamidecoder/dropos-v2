// ============================================================
// app.ts — Critical Additions
// Path: backend/src/app.ts (add these to your existing app.ts)
// ============================================================

/*
ADD THESE IMPORTS at top of app.ts:
*/
import cookieParser  from "cookie-parser";
import helmet        from "helmet";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import authRefreshRoutes from "./routes/auth.refresh.routes";
import { connectWithRetry } from "./lib/prisma";

/*
ADD THESE MIDDLEWARE (early in app.ts, before routes):
*/
// app.use(cookieParser());   // Parse httpOnly cookies
// app.use(helmet({          // Security headers
//   crossOriginEmbedderPolicy: false,
//   contentSecurityPolicy: false, // configure separately
// }));

/*
ADD THESE ROUTES (with other route registrations):
*/
// app.use("/api/auth", authRefreshRoutes);  // session refresh endpoints

/*
ADD THESE ERROR HANDLERS (MUST BE LAST in app.ts, after all routes):
*/
// app.use(notFoundHandler);   // 404 for unknown routes
// app.use(errorHandler);      // Global error handler

/*
REPLACE server startup with retry:
*/
// connectWithRetry()
//   .then(() => {
//     app.listen(PORT, () => console.log(`Server running on ${PORT}`));
//   })
//   .catch(err => {
//     console.error("Could not connect to database:", err);
//     process.exit(1);
//   });

/*
INSTALL required packages:
  npm install cookie-parser helmet
  npm install @types/cookie-parser --save-dev
*/

export const APP_TS_ADDITIONS = `
// === KAI BULLETPROOF ADDITIONS ===

import cookieParser         from "cookie-parser";
import helmet               from "helmet";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import authRefreshRoutes    from "./routes/auth.refresh.routes";
import { connectWithRetry } from "./lib/prisma";

// Early middleware (add near top, before routes)
app.use(cookieParser());
app.use(helmet({ crossOriginEmbedderPolicy: false, contentSecurityPolicy: false }));

// Auth session routes
app.use("/api/auth", authRefreshRoutes);

// === AFTER ALL OTHER ROUTES ===
app.use(notFoundHandler);
app.use(errorHandler);
`;
