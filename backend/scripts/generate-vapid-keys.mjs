#!/usr/bin/env node
// scripts/generate-vapid-keys.mjs
// Run once: node scripts/generate-vapid-keys.mjs
// Then copy the output into your .env file

import webpush from "web-push";

const keys = webpush.generateVAPIDKeys();
console.log("\n✅ VAPID Keys generated — add these to your .env file:\n");
console.log(`VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log("\nRemember: keep VAPID_PRIVATE_KEY secret!\n");
