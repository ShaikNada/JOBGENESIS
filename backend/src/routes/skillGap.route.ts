import express from 'express';
import { analyzeSkillGap } from '../controllers/skillGap.controller';
import { protect } from '../middleware/auth.middleware';
import { Skill } from '../models/Skill.model';

const router = express.Router();

// One-time seed endpoint (call once to populate the Skill DB)
router.get('/seed', async (req, res) => {
    try {
        const count = await Skill.countDocuments();
        if (count > 0) return res.json({ message: `Already seeded with ${count} skills.` });

        const skills = [
            { name: "react", category: "Frontend", demandScore: 9, relatedSkills: ["javascript", "typescript"], learningResources: [{ title: "React Official Docs", url: "https://react.dev/learn", type: "course" }] },
            { name: "vue", category: "Frontend", demandScore: 7, relatedSkills: ["javascript", "nuxt"], learningResources: [{ title: "Vue.js Guide", url: "https://vuejs.org/guide/introduction.html", type: "documentation" }] },
            { name: "typescript", category: "Language", demandScore: 10, relatedSkills: ["javascript", "react", "node.js"], learningResources: [{ title: "TypeScript Handbook", url: "https://www.typescriptlang.org/docs/handbook/intro.html", type: "documentation" }] },
            { name: "javascript", category: "Language", demandScore: 10, relatedSkills: ["typescript", "react", "node.js"], learningResources: [{ title: "MDN Web Docs", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript", type: "documentation" }] },
            { name: "html", category: "Frontend", demandScore: 8, relatedSkills: ["css", "javascript"], learningResources: [{ title: "HTML Basics", url: "https://developer.mozilla.org/en-US/docs/Learn/HTML", type: "documentation" }] },
            { name: "css", category: "Frontend", demandScore: 8, relatedSkills: ["html", "tailwind"], learningResources: [{ title: "CSS Basics", url: "https://developer.mozilla.org/en-US/docs/Learn/CSS", type: "documentation" }] },
            { name: "tailwind", category: "Frontend", demandScore: 8, relatedSkills: ["css", "react"], learningResources: [{ title: "Tailwind CSS Docs", url: "https://tailwindcss.com/docs", type: "documentation" }] },
            { name: "node.js", category: "Backend", demandScore: 9, relatedSkills: ["javascript", "typescript", "express"], learningResources: [{ title: "Node.js Guide", url: "https://nodejs.org/en/docs/guides/", type: "documentation" }] },
            { name: "python", category: "Language", demandScore: 10, relatedSkills: ["django", "flask", "machine learning"], learningResources: [{ title: "Python Tutorial", url: "https://docs.python.org/3/tutorial/index.html", type: "documentation" }] },
            { name: "java", category: "Language", demandScore: 9, relatedSkills: ["spring boot", "android"], learningResources: [{ title: "Java Tutorials", url: "https://docs.oracle.com/javase/tutorial/", type: "documentation" }] },
            { name: "go", category: "Language", demandScore: 8, relatedSkills: ["docker", "kubernetes", "microservices"], learningResources: [{ title: "A Tour of Go", url: "https://go.dev/tour/welcome/1", type: "course" }] },
            { name: "c++", category: "Language", demandScore: 7, relatedSkills: ["c", "system design"], learningResources: [{ title: "Learn C++", url: "https://www.learncpp.com/", type: "documentation" }] },
            { name: "sql", category: "Database", demandScore: 10, relatedSkills: ["postgresql", "mysql"], learningResources: [{ title: "SQL Tutorial", url: "https://www.w3schools.com/sql/", type: "course" }] },
            { name: "postgresql", category: "Database", demandScore: 9, relatedSkills: ["sql"], learningResources: [{ title: "PostgreSQL Tutorial", url: "https://www.postgresqltutorial.com/", type: "course" }] },
            { name: "mongodb", category: "Database", demandScore: 8, relatedSkills: ["nosql", "node.js"], learningResources: [{ title: "MongoDB University", url: "https://learn.mongodb.com/", type: "course" }] },
            { name: "redis", category: "Database", demandScore: 8, relatedSkills: ["caching", "system design"], learningResources: [{ title: "Redis University", url: "https://university.redis.com/", type: "course" }] },
            { name: "docker", category: "DevOps", demandScore: 9, relatedSkills: ["kubernetes", "ci/cd", "linux"], learningResources: [{ title: "Docker 101", url: "https://www.docker.com/101-tutorial/", type: "course" }] },
            { name: "kubernetes", category: "DevOps", demandScore: 9, relatedSkills: ["docker", "cloud", "microservices"], learningResources: [{ title: "Kubernetes Basics", url: "https://kubernetes.io/docs/tutorials/kubernetes-basics/", type: "documentation" }] },
            { name: "aws", category: "Cloud", demandScore: 10, relatedSkills: ["cloud", "system design", "serverless"], learningResources: [{ title: "AWS Skill Builder", url: "https://explore.skillbuilder.aws/", type: "certification" }] },
            { name: "gcp", category: "Cloud", demandScore: 8, relatedSkills: ["cloud", "kubernetes"], learningResources: [{ title: "Google Cloud Training", url: "https://cloud.google.com/training", type: "certification" }] },
            { name: "azure", category: "Cloud", demandScore: 8, relatedSkills: ["cloud", "microsoft"], learningResources: [{ title: "Microsoft Learn", url: "https://learn.microsoft.com/en-us/azure/", type: "certification" }] },
            { name: "linux", category: "DevOps", demandScore: 9, relatedSkills: ["bash", "docker"], learningResources: [{ title: "Linux Journey", url: "https://linuxjourney.com/", type: "course" }] },
            { name: "ci/cd", category: "DevOps", demandScore: 9, relatedSkills: ["github actions", "jenkins"], learningResources: [{ title: "CI/CD Guide", url: "https://www.redhat.com/en/topics/devops/what-is-ci-cd", type: "documentation" }] },
            { name: "git", category: "Tools", demandScore: 10, relatedSkills: ["github", "version control"], learningResources: [{ title: "Pro Git Book", url: "https://git-scm.com/book/en/v2", type: "book" }] },
            { name: "system design", category: "Architecture", demandScore: 10, relatedSkills: ["scalability", "microservices", "databases"], learningResources: [{ title: "System Design Primer", url: "https://github.com/donnemartin/system-design-primer", type: "project" }, { title: "ByteByteGo", url: "https://bytebytego.com/", type: "course" }] },
            { name: "microservices", category: "Architecture", demandScore: 9, relatedSkills: ["docker", "kubernetes"], learningResources: [{ title: "Microservices.io", url: "https://microservices.io/", type: "documentation" }] },
            { name: "rest api", category: "Architecture", demandScore: 10, relatedSkills: ["http", "json", "backend"], learningResources: [{ title: "RESTful API Design", url: "https://restfulapi.net/", type: "documentation" }] },
            { name: "graphql", category: "Architecture", demandScore: 7, relatedSkills: ["api", "react"], learningResources: [{ title: "How to GraphQL", url: "https://www.howtographql.com/", type: "course" }] },
            { name: "data structures", category: "Computer Science", demandScore: 9, relatedSkills: ["algorithms", "problem solving"], learningResources: [{ title: "LeetCode Explore", url: "https://leetcode.com/explore/", type: "project" }] },
            { name: "algorithms", category: "Computer Science", demandScore: 9, relatedSkills: ["data structures", "dynamic programming"], learningResources: [{ title: "Introduction to Algorithms", url: "https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/", type: "book" }] },
        ];

        await Skill.insertMany(skills);
        return res.json({ message: `✅ Successfully seeded ${skills.length} skills!` });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Seeding failed', error: String(err) });
    }
});

// Analyze skill gap (deterministic math engine)
router.post('/analyze', protect, analyzeSkillGap);

export default router;

