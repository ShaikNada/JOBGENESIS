/**
 * Vanguard Phase 3: RAG Knowledge Base Stub
 * In a fully scaled enterprise environment, this module queries a Pinecone or ChromaDB Vector Store.
 * For the MVP, it acts as an in-memory document retriever to inject strictly-formatted engineering culture into Gemini.
 */

const companyKnowledge = {
    Google: `
  [CULTURE_DOC_001: GOOGLE_ENGINEERING_STANDARDS]
  We value "Googley-ness": doing the right thing, striving for excellence, and keeping an eye on the goals. Focus on extreme scale, distributed systems, MapReduce paradigms, and microsecond latencies. When evaluating a candidate, probe strongly on Big-O fundamentals, system availability across regions, and handling network partitions (CAP theorem). Never let sub-optimal Big-O slip.
  `,
    Meta: `
  [CULTURE_DOC_002: META_HACKER_WAY]
  "Move Fast and Break Things" has evolved into "Move Fast with Stable Infrastructure". We want builders who can push code daily but understand state management (React/Relay) at a massive scale. Probe the candidate on eventual consistency, graph databases, caching layers (Memcached), and handling viral traffic bursts.
  `,
    Stripe: `
  [CULTURE_DOC_003: STRIPE_API_TOLERANCE]
  At Stripe, 99.999% uptime is the bare minimum. Payments cannot be dropped. We require extreme API idempotency, ACID database transactions, database locking (pessimistic vs optimistic), and retry mechanics with exponential backoff. Probe the candidate intensely on exactly-once processing guarantees and database isolation levels.
  `
};

/**
 * Retrieves RAG context to augment the AI System Prompt.
 * @param company The company the candidate applied to
 * @returns Augmented context string
 */
export const retrieveCompanyContext = (company: string): string => {
    // If we have a specific context snippet for the target company, inject it.
    for (const [key, value] of Object.entries(companyKnowledge)) {
        if (company.toLowerCase().includes(key.toLowerCase())) {
            return `[SYSTEM RAG INJECTION - COMPANY: ${key}]\n${value}\n[END INJECTION]`;
        }
    }

    // Fallback generic but high-bar senior engineering context
    return `
  [SYSTEM RAG INJECTION - GENERIC_SENIOR_ENG]
  You are evaluating a candidate for a fast-paced technology company. Probe on pragmatic software engineering: Clean Code principles, SOLID design, CI/CD pipelines, and writing testable logic. Ensure they understand trade-offs between memory and CPU.
  [END INJECTION]
    `;
};
