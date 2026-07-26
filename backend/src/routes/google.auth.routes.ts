// Google OAuth 2.0 — /api/auth/google + /api/auth/google/callback
import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { signAccessToken, signRefreshToken, setRefreshCookie } from "../config/jwt";
import { sanitizeUser } from "../utils/helpers";

const router = Router();

const GOOGLE_CLIENT_ID     = process.env.GOOGLE_CLIENT_ID     || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const FRONTEND_URL         = process.env.FRONTEND_URL         || "https://droposhq.com";
const BACKEND_URL          = process.env.BACKEND_URL          || "https://dropos-v2.onrender.com";

// Step 1 — redirect user to Google consent screen
router.get("/google", (req: Request, res: Response) => {
  if (!GOOGLE_CLIENT_ID) {
    // Not configured — redirect back with error
    return res.redirect(`${FRONTEND_URL}/auth/login?error=google_not_configured`);
  }

  const params = new URLSearchParams({
    client_id:     GOOGLE_CLIENT_ID,
    redirect_uri:  `${BACKEND_URL}/api/auth/google/callback`,
    response_type: "code",
    scope:         "openid email profile",
    access_type:   "offline",
    prompt:        "select_account",
  });

  return res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

// Step 2 — Google redirects back with a code
router.get("/google/callback", async (req: Request, res: Response) => {
  const { code, error } = req.query as { code?: string; error?: string };

  if (error || !code) {
    return res.redirect(`${FRONTEND_URL}/auth/login?error=google_denied`);
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id:     GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri:  `${BACKEND_URL}/api/auth/google/callback`,
        grant_type:    "authorization_code",
      }),
    });

    const tokenData: any = await tokenRes.json();
    if (!tokenData.access_token) throw new Error("No access token from Google");

    // Fetch user profile
    const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile: any = await profileRes.json();

    if (!profile.email) throw new Error("No email from Google");

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email: profile.email } });

    if (!user) {
      // Create new user from Google profile
      user = await prisma.user.create({
        data: {
          email:          profile.email,
          name:           profile.name || profile.email.split("@")[0],
          avatar:         profile.picture || null,
          emailVerified:  true,                     // Google-verified
          password:       "",                        // no password for OAuth users
          authProvider:   "google",
          googleId:       profile.id,
        } as any,
      });
    } else if (!(user as any).googleId) {
      // Link Google to existing email account
      await prisma.user.update({
        where: { id: user.id },
        data: { googleId: profile.id, emailVerified: true, avatar: (user as any).avatar || profile.picture } as any,
      });
    }

    // Issue JWT (same as normal login)
    const payload = { userId: user.id, email: user.email, role: (user as any).role || "USER" };
    const accessToken  = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    setRefreshCookie(res as any, refreshToken);

    // Redirect to frontend with token in URL fragment (picked up by auth store)
    return res.redirect(`${FRONTEND_URL}/auth/callback?token=${accessToken}&provider=google`);

  } catch (err: any) {
    console.error("[Google OAuth] Error:", err.message);
    return res.redirect(`${FRONTEND_URL}/auth/login?error=google_failed`);
  }
});

export default router;
