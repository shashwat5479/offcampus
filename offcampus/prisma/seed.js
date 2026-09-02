/* eslint-disable */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();
const NOW = Date.now();
const H = 3600000;
const ago = (h) => new Date(NOW - h * H);
const PASSWORD = "password123"; // demo password for every seeded account

const COLLEGES = [
  { code: "NIET", name: "Noida Institute of Engineering & Technology", city: "Greater Noida" },
  { code: "KIET", name: "KIET Group of Institutions", city: "Ghaziabad" },
  { code: "GLB", name: "GL Bajaj Institute of Technology", city: "Greater Noida" },
  { code: "ABES", name: "ABES Engineering College", city: "Ghaziabad" },
  { code: "AKGEC", name: "Ajay Kumar Garg Engineering College", city: "Ghaziabad" },
  { code: "GCET", name: "Galgotias College of Engineering", city: "Greater Noida" },
  { code: "IPEC", name: "Inderprastha Engineering College", city: "Ghaziabad" },
  { code: "JSS", name: "JSS Academy of Technical Education", city: "Noida" },
];

const COMMUNITIES = [
  { slug: "niet-coding", college: "NIET", type: "CODING", name: "Coding", description: "DSA, CP, dev — build together." },
  { slug: "niet-placements", college: "NIET", type: "PLACEMENTS", name: "Placements", description: "Drives, CTCs, prep, referrals." },
  { slug: "niet-general", college: "NIET", type: "GENERAL", name: "General", description: "Campus chatter, anything goes." },
  { slug: "niet-memes", college: "NIET", type: "MEMES", name: "Memes", description: "Certified NIET humour." },
  { slug: "niet-confessions", college: "NIET", type: "CONFESSIONS", name: "Confessions", description: "Say it out loud." },
  { slug: "niet-notes", college: "NIET", type: "NOTES", name: "Notes", description: "PDFs, handwritten notes, PYQs." },
  { slug: "niet-buysell", college: "NIET", type: "MARKETPLACE", name: "Buy & Sell", description: "Cycles, books, hostel stuff." },
  { slug: "niet-cse2", college: "NIET", type: "SECTION", name: "CSE · 2nd Year", description: "Your batch's corner." },
  { slug: "kiet-coding", college: "KIET", type: "CODING", name: "Coding", description: "KIET builders & competitive coders." },
  { slug: "kiet-placements", college: "KIET", type: "PLACEMENTS", name: "Placements", description: "KIET placement season." },
  { slug: "kiet-general", college: "KIET", type: "GENERAL", name: "General", description: "KIET general discussion." },
  { slug: "gcet-memes", college: "GCET", type: "MEMES", name: "Memes", description: "Galgotias meme dump." },
];

const USERS = [
  { username: "you", name: "You", college: "NIET", branch: "CSE", year: 2 },
  { username: "aarav", name: "Aarav Sharma", college: "NIET", branch: "CSE", year: 2 },
  { username: "priya", name: "Priya Verma", college: "NIET", branch: "CSE", year: 3 },
  { username: "rohan", name: "Rohan Gupta", college: "NIET", branch: "IT", year: 2 },
  { username: "ananya", name: "Ananya Singh", college: "NIET", branch: "ECE", year: 2 },
  { username: "kabir", name: "Kabir Yadav", college: "NIET", branch: "CSE", year: 3 },
  { username: "ishita", name: "Ishita Rao", college: "NIET", branch: "ME", year: 4 },
  { username: "dev", name: "Dev Malhotra", college: "KIET", branch: "CSE", year: 2 },
  { username: "sara", name: "Sara Khan", college: "KIET", branch: "IT", year: 3 },
  { username: "manav", name: "Manav Jain", college: "KIET", branch: "CSE", year: 2 },
  { username: "neha", name: "Neha Bansal", college: "GCET", branch: "CSE", year: 1 },
];

// community slug -> member usernames
const MEMBERS = {
  "niet-coding": ["you", "aarav", "priya", "rohan"],
  "niet-general": ["you", "aarav", "ananya", "kabir"],
  "niet-memes": ["you", "priya"],
  "niet-cse2": ["you", "aarav"],
  "niet-placements": ["priya", "rohan", "ishita"],
  "niet-confessions": ["aarav", "rohan"],
  "niet-notes": ["ananya", "kabir"],
  "niet-buysell": ["ishita", "aarav"],
  "kiet-coding": ["dev", "sara"],
  "kiet-placements": ["dev", "manav"],
  "kiet-general": ["sara", "manav", "neha"],
  "gcet-memes": ["neha"],
};

// follower -> followees
const FOLLOWS = {
  you: ["aarav", "priya"],
  aarav: ["priya", "rohan", "you"],
  priya: ["aarav", "rohan", "ananya"],
  rohan: ["priya", "kabir"],
  ananya: ["priya", "ishita"],
  kabir: ["rohan"],
  dev: ["sara"],
  sara: ["dev", "manav"],
  manav: ["sara"],
};

const POSTS = [
  { key: "p1", author: "aarav", community: "niet-coding", type: "CODE", title: "Clean sliding-window template I use for every DSA problem", body: "for (l=0,r=0; r<n; r++){ /* expand */ while(bad){ /* shrink */ l++ } best=max(best,r-l+1) }", tags: ["dsa", "cp"], score: 142, ageH: 5 },
  { key: "p2", author: "priya", community: "niet-placements", type: "TEXT", title: "TCS NQT 2026 experience + section-wise cutoffs", body: "Cleared it last week. Numerical was the filter, verbal was free marks. AMA about the prep timeline.", tags: ["placement", "interview"], score: 210, ageH: 9 },
  { key: "p3", author: "rohan", community: "niet-coding", type: "LINK", title: "Built a URL shortener in Next.js — brutal feedback welcome", body: "Redis for the hot cache, Postgres for source of truth. Repo linked.", linkUrl: "https://github.com/rohan/shrink", tags: ["webdev", "react", "project"], score: 88, ageH: 3 },
  { key: "p4", author: "ananya", community: "niet-general", type: "TEXT", title: "Are library hours actually extended during end-sems?", body: "Heard it's open till 2am in exam week. Can anyone confirm?", tags: ["exams"], score: 34, ageH: 2 },
  { key: "p5", author: "priya", community: "niet-memes", type: "TEXT", title: "When the prof says 'this will definitely be in the exam'", body: "", tags: ["memes"], score: 320, ageH: 14 },
  { key: "p6", author: "aarav", community: "niet-confessions", type: "TEXT", title: "Confession: I genuinely enjoy 8am labs", body: "The empty campus, the quiet, one chai before class. Fight me.", tags: ["confession"], score: 12, ageH: 1 },
  { key: "p7", author: "kabir", community: "niet-notes", type: "PDF", title: "Complete DBMS handwritten notes (Unit 1–5)", body: "Normalization + transactions explained properly. GATE-friendly.", tags: ["notes", "gate"], score: 176, ageH: 20 },
  { key: "p8", author: "ishita", community: "niet-buysell", type: "TEXT", title: "Selling a barely-used hybrid cycle — ₹2200", body: "1 year old, new tyres, reason: graduating. DM to check.", tags: ["sell", "buy"], score: 20, ageH: 4 },
  { key: "p9", author: "rohan", community: "niet-coding", type: "TEXT", title: "Roadmap: how I'd land an SDE internship by 3rd year", body: "Month-by-month plan — DSA base, 2 real projects, resume, then apply in bulk.", tags: ["internship", "dsa", "webdev"], score: 265, ageH: 30 },
  { key: "p10", author: "priya", community: "niet-placements", type: "TEXT", title: "Amazon SDE-1 interview questions megathread", body: "Dropping every question asked on campus this year. Add yours in comments.", tags: ["placement", "interview", "dsa"], score: 190, ageH: 26 },
  { key: "p11", author: "ananya", community: "niet-general", type: "TEXT", title: "Fest dates leaked?? 🎉", body: "Someone from the cultural committee hinted March 2nd week. Anyone else hear this?", tags: ["event"], score: 58, ageH: 6 },
  { key: "p12", author: "aarav", community: "niet-cse2", type: "TEXT", title: "Section A vs B — which has the better faculty this sem?", body: "Trying to plan a section swap. Honest reviews only.", tags: [], score: 15, ageH: 7 },
  { key: "p13", author: "dev", community: "kiet-coding", type: "TEXT", title: "CP contest this weekend — forming teams of 3", body: "Div 2 focused. Comment your handle + rating.", tags: ["cp", "hackathon"], score: 47, ageH: 5 },
  { key: "p14", author: "kabir", community: "niet-general", type: "TEXT", title: "Lost: black hostel keys near Block C", body: "Keychain has a small blue tag. Please DM if found 🙏", tags: ["hostel"], score: 8, ageH: 1 },
  { key: "p15", author: "priya", community: "niet-coding", type: "TEXT", title: "React or Next.js for a genuine first project?", body: "Want to actually deploy something, not just learn syntax. What did you start with?", tags: ["react", "webdev"], score: 63, ageH: 8 },
  { key: "p16", author: "ishita", community: "niet-memes", type: "TEXT", title: "Attendance shortage starter pack", body: "", tags: ["memes"], score: 145, ageH: 12 },
];

const COMMENTS = [
  { key: "c1", post: "p3", author: "aarav", parent: null, body: "Redirect flow is clean. Add rate limiting before you share it publicly though.", score: 14, ageH: 2 },
  { key: "c2", post: "p3", author: "priya", parent: "c1", body: "+1, and hash the slug so it isn't enumerable.", score: 8, ageH: 1 },
  { key: "c3", post: "p3", author: "ananya", parent: null, body: "What are you using for the DB? Curious about the read path.", score: 3, ageH: 1 },
  { key: "c4", post: "p9", author: "priya", parent: null, body: "Bookmarking this. The month-by-month framing is exactly what juniors need.", score: 21, ageH: 10 },
  { key: "c5", post: "p9", author: "kabir", parent: "c4", body: "Same. The 'ship 2 real projects' point is underrated.", score: 6, ageH: 8 },
];

// demo user 'you' has upvoted these (seeds tag affinity for the For You feed)
const MY_UPVOTES = ["p1", "p15"];

async function main() {
  console.log("Clearing existing data…");
  await prisma.commentVote.deleteMany();
  await prisma.postVote.deleteMany();
  await prisma.postTag.deleteMany();
  await prisma.comment.deleteMany({ where: { parentId: { not: null } } });
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.user.deleteMany();
  await prisma.community.deleteMany();
  await prisma.college.deleteMany();

  console.log("Seeding colleges…");
  const collegeId = {};
  for (const c of COLLEGES) {
    const row = await prisma.college.create({ data: { code: c.code, name: c.name, city: c.city } });
    collegeId[c.code] = row.id;
  }

  console.log("Seeding communities…");
  const communityId = {};
  for (const c of COMMUNITIES) {
    const row = await prisma.community.create({
      data: { slug: c.slug, collegeId: collegeId[c.college], type: c.type, name: c.name, description: c.description },
    });
    communityId[c.slug] = row.id;
  }

  console.log("Seeding users…");
  const hash = bcrypt.hashSync(PASSWORD, 10);
  const userId = {};
  for (const u of USERS) {
    const row = await prisma.user.create({
      data: {
        username: u.username,
        email: `${u.username}@${u.college.toLowerCase()}.offcampus`,
        name: u.name,
        passwordHash: hash,
        branch: u.branch,
        year: u.year,
        collegeId: collegeId[u.college],
      },
    });
    userId[u.username] = row.id;
  }

  console.log("Seeding memberships…");
  for (const [slug, members] of Object.entries(MEMBERS)) {
    for (const uname of members) {
      await prisma.membership.create({
        data: { communityId: communityId[slug], userId: userId[uname], role: uname === "you" ? "MEMBER" : "MEMBER" },
      });
    }
  }

  console.log("Seeding posts…");
  const postId = {};
  for (const p of POSTS) {
    const row = await prisma.post.create({
      data: {
        authorId: userId[p.author],
        communityId: communityId[p.community],
        type: p.type,
        title: p.title,
        body: p.body || null,
        linkUrl: p.linkUrl || null,
        score: p.score,
        createdAt: ago(p.ageH),
      },
    });
    postId[p.key] = row.id;
    for (const tag of p.tags) {
      await prisma.postTag.create({ data: { postId: row.id, tag } });
    }
  }

  console.log("Seeding comments…");
  const commentId = {};
  for (const c of COMMENTS) {
    const row = await prisma.comment.create({
      data: {
        postId: postId[c.post],
        authorId: userId[c.author],
        parentId: c.parent ? commentId[c.parent] : null,
        body: c.body,
        score: c.score,
        createdAt: ago(c.ageH),
      },
    });
    commentId[c.key] = row.id;
  }

  console.log("Seeding follows…");
  for (const [follower, followees] of Object.entries(FOLLOWS)) {
    for (const followee of followees) {
      await prisma.follow.create({
        data: { followerId: userId[follower], followingId: userId[followee] },
      });
    }
  }

  console.log("Seeding demo votes…");
  for (const key of MY_UPVOTES) {
    await prisma.postVote.create({ data: { userId: userId["you"], postId: postId[key], value: 1 } });
  }

  console.log("\nDone. Log in with any username + password:");
  console.log("  email:    you@niet.offcampus");
  console.log("  password: password123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
