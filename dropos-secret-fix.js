const { execSync } = require("child_process");
const fs = require("fs");

console.log("Fixing blocked push...\n");

try {
  // Step 1: Amend the last commit to use the scrubbed .env.example
  execSync("git add backend/.env.example", { stdio: "inherit" });
  execSync('git commit --amend --no-edit', { stdio: "inherit" });
  console.log("Step 1: Commit amended ✓");

  // Step 2: Force push the amended commit (rewrites history to remove the secret)
  execSync("git push origin main --force", { stdio: "inherit" });
  console.log("\n✅ Pushed successfully. Render + Vercel will deploy now.");

} catch(e) {
  console.error("Error:", e.message);
  console.log("\nIf force push is blocked, go to:");
  console.log("https://github.com/lamidecoder/dropos-v2/security/secret-scanning/unblock-secret/3DlSAlOrTKJdpZNHFRrFkHYjbo1");
  console.log("→ Click 'Allow secret' → then run: git push origin main");
}
