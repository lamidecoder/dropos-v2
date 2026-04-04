const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const p = new PrismaClient();
p.waitlistEntry.deleteMany({}).then(r => {
  console.log('Deleted:', r.count, 'entries ✅');
  p.$disconnect();
}).catch(e => {
  console.error('Error:', e.message);
  p.$disconnect();
});
