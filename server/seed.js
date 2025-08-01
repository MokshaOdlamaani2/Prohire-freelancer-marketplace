const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const User = require("./models/User");

const MONGO_URI = process.env.Mongo_URI;

async function insertMissingFreelancers() {
  await mongoose.connect(MONGO_URI);

  const existing = await User.find({ role: "freelancer" });
  const remaining = 5 - existing.length;

  if (remaining <= 0) {
    console.log("✅ Already 5 freelancers exist.");
    return;
  }

  const extraFreelancers = [
    {
      name: "Michael Lee",
      email: "michael.lee@example.com",
      password: "hashedpassword",
      role: "freelancer",
      skills: ["DevOps", "AWS", "Docker"],
      hourlyRate: 40,
      profileBio: "DevOps engineer helping teams deploy faster and safer.",
      portfolioLinks: ["https://michaellee.dev"],
      title: "DevOps Engineer",
      bio: "Specialized in CI/CD pipelines and infrastructure automation.",
      experience: [{
        role: "DevOps Specialist",
        company: "CloudEra",
        duration: "4 years",
        description: "Implemented end-to-end deployment automation."
      }],
      portfolio: [{
        projectTitle: "CI/CD Pipeline",
        description: "Created Jenkins + Docker-based deployment flow.",
        externalLink: "https://github.com/michaellee/cicd"
      }]
    },
    {
      name: "Sophia Reyes",
      email: "sophia.reyes@example.com",
      password: "hashedpassword",
      role: "freelancer",
      skills: ["Content Writing", "SEO", "WordPress"],
      hourlyRate: 15,
      profileBio: "Experienced content writer and SEO specialist.",
      portfolioLinks: ["https://sophiablogs.com"],
      title: "Content Writer",
      bio: "Crafted compelling blog posts and optimized content for SEO.",
      experience: [{
        role: "Content Strategist",
        company: "BuzzWrite",
        duration: "3 years",
        description: "Managed content calendars and wrote articles."
      }],
      portfolio: [{
        projectTitle: "SEO Blog Series",
        description: "Blog series ranked top 3 in Google search.",
        externalLink: "https://buzzwrite.com/blogs"
      }]
    }
  ];

  await User.insertMany(extraFreelancers.slice(0, remaining));
  console.log(`✅ Inserted ${remaining} freelancers.`);

  await mongoose.disconnect();
}

insertMissingFreelancers().catch((err) => {
  console.error("❌ Error inserting freelancers:", err);
  mongoose.disconnect();
});
