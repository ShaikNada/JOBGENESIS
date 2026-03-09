import mongoose from 'mongoose';
import { Problem } from '../models/Problem.model';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/jobgenesis";

const PREMIUM_PROBLEMS = [
    {
        id: "stripe-payments",
        title: "Stripe-Style Payment Gateway",
        difficulty: "Hard",
        tags: ["Systems Design", "Idempotency", "Payments"],
        companies: ["Stripe", "PayPal", "Block"],
        description: "Design and implement a basic idempotency-aware payment processing function. Your function must handle duplicate requests safely using a request ID.",
        functionName: "processPayment",
        starterCode: {
            javascript: `// Implement an idempotent payment processor
function processPayment(requestId, amount, currency) {
  // Your logic here
}`,
            python: `def process_payment(request_id, amount, currency):\n    pass`
        },
        testCases: [
            { input: ["req_123", 100, "USD"], expected: { success: true, status: "processed" } },
            { input: ["req_123", 100, "USD"], expected: { success: true, status: "duplicate", note: "idempotent" } }
        ]
    },
    {
        id: "netflix-cdn",
        title: "Netflix Open Connect CDN Simulation",
        difficulty: "Hard",
        tags: ["Distributed Systems", "Caching", "Networking"],
        companies: ["Netflix", "Akamai", "Cloudflare"],
        description: "Build a simple Cache-Control logic for a CDN edge node. Given a request and a cache state, determine if it's a HIT or MISS and update TTL.",
        functionName: "edgeCacheLookup",
        starterCode: {
            javascript: `function edgeCacheLookup(assetId, cacheMap) {\n  // Implement LRU/TTL logic\n}`,
            python: `def edge_cache_lookup(asset_id, cache_map):\n    pass`
        },
        testCases: [
            { input: ["video_4k", {}], expected: { hit: false, action: "fetch_from_origin" } }
        ]
    },
    {
        id: "uber-matching",
        title: "Uber Rider-Driver Matching",
        difficulty: "Medium",
        tags: ["Algorithms", "Geospatial", "Optimization"],
        companies: ["Uber", "Lyft", "Grab"],
        description: "Given a list of available drivers and their coordinates, find the optimal driver for a rider based on distance and rating.",
        functionName: "matchRider",
        starterCode: {
            javascript: `function matchRider( riderCoord, availableDrivers) {\n  // Find the best driver\n}`,
        },
        testCases: [
            { input: [{ x: 0, y: 0 }, [{ id: "d1", coord: { x: 1, y: 1 }, rating: 4.8 }]], expected: "d1" }
        ]
    }
];

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to DB for seeding...");

        for (const p of PREMIUM_PROBLEMS) {
            await Problem.findOneAndUpdate({ id: p.id }, p, { upsert: true });
            console.log(`✅ Seeded/Updated: ${p.title}`);
        }

        console.log("Seeding complete.");
        process.exit(0);
    } catch (err) {
        console.error("Seeding failed:", err);
        process.exit(1);
    }
}

seed();
