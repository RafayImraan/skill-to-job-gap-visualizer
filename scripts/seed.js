const { randomBytes, scryptSync } = require("node:crypto");
const { PrismaClient, SkillCategory } = require("@prisma/client");

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

const skills = [
  { name: "React", category: SkillCategory.FRONTEND, description: "Component-driven frontend development." },
  { name: "Next.js", category: SkillCategory.FRONTEND, description: "Full-stack React framework with routing and SSR." },
  { name: "Node API", category: SkillCategory.BACKEND, description: "Backend APIs and service development." },
  { name: "TypeScript", category: SkillCategory.FRONTEND, description: "Type-safe JavaScript for production apps." },
  { name: "Testing", category: SkillCategory.TESTING, description: "Unit, integration, and end-to-end quality signals." },
  { name: "Docker", category: SkillCategory.DEVOPS, description: "Portable containers for development and deployment." },
  { name: "AWS", category: SkillCategory.CLOUD, description: "Cloud deployment and infrastructure fluency." },
  { name: "SQL", category: SkillCategory.BACKEND, description: "Relational data modeling and querying." },
  { name: "System Design", category: SkillCategory.DSA, description: "Architecture, scaling, and systems tradeoffs." },
];

const roadmap = [
  { dayNumber: 1, title: "JavaScript Deep Dive", description: "Refresh closures, async flows, and event-loop fundamentals.", isUnlocked: true, isCompleted: true, xpReward: 120 },
  { dayNumber: 7, title: "Build Weather App", description: "Ship a polished dashboard with API caching and responsive states.", isUnlocked: true, isCompleted: true, xpReward: 180 },
  { dayNumber: 14, title: "API + Auth", description: "Add protected routes, session state, and role-aware navigation.", isUnlocked: true, isCompleted: true, xpReward: 210 },
  { dayNumber: 21, title: "Deploy SaaS", description: "Deploy on Vercel with env vars, analytics, and a monitored pipeline.", isUnlocked: true, isCompleted: false, xpReward: 260 },
  { dayNumber: 30, title: "GitHub Polish", description: "Improve README depth, issue templates, labels, and CI checks.", isUnlocked: false, isCompleted: false, xpReward: 150 },
];

async function main() {
  for (const skill of skills) {
    await prisma.skill.upsert({
      where: { name: skill.name },
      update: skill,
      create: skill,
    });
  }

  const user = await prisma.user.upsert({
    where: { email: "ayesha@example.com" },
    update: {
      name: "Ayesha Khan",
      role: "Frontend / Product Engineer",
      passwordHash: hashPassword("demo12345"),
      resumeText:
        "Built and maintained a student dashboard used by campus clubs. Improved the frontend experience and deployment setup.",
      githubUsername: "ayeshakhan",
      linkedinUrl: "https://linkedin.com/in/ayesha-khan",
    },
    create: {
      name: "Ayesha Khan",
      email: "ayesha@example.com",
      role: "Frontend / Product Engineer",
      passwordHash: hashPassword("demo12345"),
      resumeText:
        "Built and maintained a student dashboard used by campus clubs. Improved the frontend experience and deployment setup.",
      githubUsername: "ayeshakhan",
      linkedinUrl: "https://linkedin.com/in/ayesha-khan",
    },
  });

  const ownedSkills = ["React", "Next.js", "Node API"];

  for (const [index, skillName] of ownedSkills.entries()) {
    const skill = await prisma.skill.findUnique({ where: { name: skillName } });
    if (!skill) continue;

    await prisma.userSkill.upsert({
      where: {
        userId_skillId: {
          userId: user.id,
          skillId: skill.id,
        },
      },
      update: {
        proficiencyLevel: 6 + index,
      },
      create: {
        userId: user.id,
        skillId: skill.id,
        proficiencyLevel: 6 + index,
      },
    });
  }

  const projects = [
    {
      title: "SkillSync Dashboard",
      description: "Analytics-rich student dashboard with roadmap and recruiter-facing profile surfaces.",
      complexityLevel: 8,
      repoUrl: "https://github.com/ayeshakhan/skillsync-dashboard",
      liveUrl: "https://skillsync.example.com",
      readmeScore: 88,
    },
    {
      title: "Campus Blog",
      description: "UI quality is clean, but there is no backend depth or production deployment yet.",
      complexityLevel: 4,
      repoUrl: "https://github.com/ayeshakhan/campus-blog",
      liveUrl: null,
      readmeScore: 54,
    },
    {
      title: "Issue Tracker API",
      description: "Strong backend fundamentals with room for tests, docs, and public demo credibility.",
      complexityLevel: 7,
      repoUrl: "https://github.com/ayeshakhan/issue-tracker-api",
      liveUrl: "https://staging.example.com",
      readmeScore: 76,
    },
  ];

  for (const project of projects) {
    await prisma.project.upsert({
      where: {
        id: `${user.id}-${project.title.toLowerCase().replace(/\s+/g, "-")}`,
      },
      update: project,
      create: {
        id: `${user.id}-${project.title.toLowerCase().replace(/\s+/g, "-")}`,
        userId: user.id,
        ...project,
      },
    });
  }

  for (const milestone of roadmap) {
    await prisma.roadmapMilestone.upsert({
      where: {
        id: `${user.id}-day-${milestone.dayNumber}`,
      },
      update: milestone,
      create: {
        id: `${user.id}-day-${milestone.dayNumber}`,
        userId: user.id,
        ...milestone,
      },
    });
  }

  await prisma.jobRole.upsert({
    where: { id: "frontend-engineer-role" },
    update: {
      title: "Frontend Engineer",
      description: "Product-minded frontend role with strong UI and delivery expectations.",
      keywords: ["React", "TypeScript", "Testing", "REST API", "CI/CD"],
      marketDemandScore: 86,
    },
    create: {
      id: "frontend-engineer-role",
      title: "Frontend Engineer",
      description: "Product-minded frontend role with strong UI and delivery expectations.",
      keywords: ["React", "TypeScript", "Testing", "REST API", "CI/CD"],
      marketDemandScore: 86,
    },
  });

  console.log("Database seeded successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
