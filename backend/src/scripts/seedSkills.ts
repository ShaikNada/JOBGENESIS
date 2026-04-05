import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env from both current and parent to be safe
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://sohel:sohel123@cluster0.obtsqzz.mongodb.net/?appName=Cluster0';

const skillSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    category: { type: String, default: 'General' },
    level: { type: String, default: 'Mid' }
});

const Skill = mongoose.model('Skill', skillSchema);

const PROFESSIONAL_SKILLS = [
    // Frontend
    'React', 'Vue', 'Angular', 'Next.js', 'Tailwind CSS', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'SASS', 
    'Redux', 'Zustand', 'Context API', 'Webpack', 'Vite', 'Three.js', 'WebAssembly',
    // Backend
    'Node.js', 'Express', 'NestJS', 'GraphQL', 'REST API', 'Python', 'Django', 'Flask', 'FastAPI', 'Go', 
    'Java', 'Spring Boot', 'C#', '.NET', 'Ruby on Rails', 'PHP', 'Laravel',
    // Mobile
    'React Native', 'Flutter', 'Swift', 'Kotlin', 'Objective-C', 'Dart',
    // DevOps & Cloud
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'CI/CD', 'GitHub Actions', 'Jenkins', 'Terraform', 
    'Serverless', 'Microservices', 'Nginx', 'Prometheus', 'Grafana',
    // Databases
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Firebase', 'Elasticsearch', 'DynamoDB', 'Cassandra', 'SQLite',
    // AI/ML
    'OpenAI', 'LangChain', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'NLP', 'Computer Vision', 'LLMs', 'Gemini', 
    'Stable Diffusion', 'Pandas', 'NumPy',
    // Core Engineering
    'System Design', 'Scalability', 'Data Structures', 'Algorithms', 'Security', 'Cryptography', 'Testing', 
    'Unit Testing', 'Linux', 'Git', 'Agile', 'Scrum', 'Product Management', 'OAuth', 'JWT'
];

async function seedSkills() {
    try {
        console.log('🌱 Starting Skill Seeding...');
        await mongoose.connect(MONGO_URI);
        console.log('🔌 Connected to MongoDB');

        const existingCount = await Skill.countDocuments();
        console.log(`📊 Currently found ${existingCount} skills.`);

        const skillsToInsert = PROFESSIONAL_SKILLS.map(name => ({
            name,
            category: 'Tech',
            level: 'Mid'
        }));

        for (const skill of skillsToInsert) {
            try {
                await Skill.updateOne(
                    { name: skill.name },
                    { $setOnInsert: skill },
                    { upsert: true }
                );
            } catch (e) {}
        }

        const finalCount = await Skill.countDocuments();
        console.log(`✅ Seeding Complete! Total Skills now: ${finalCount}`);
        
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding Failed:', error);
        process.exit(1);
    }
}

seedSkills();
