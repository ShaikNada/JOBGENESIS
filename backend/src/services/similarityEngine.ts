import natural from 'natural';

const TfIdf = natural.TfIdf;

export const calculateSemanticSimilarity = (resumeText: string, jobDescriptionText: string): number => {
    // 1. Normalize deeply
    const normalize = (text: string) => text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
    const resNorm = normalize(resumeText);
    const jobNorm = normalize(jobDescriptionText);

    // 2. Initialize TF-IDF
    const tfidf = new TfIdf();
    tfidf.addDocument(resNorm); // Document 0: Resume
    tfidf.addDocument(jobNorm); // Document 1: Job

    // 3. Extract key terms from Job Description (what to match against)
    const tokenizer = new natural.WordTokenizer();
    const jobTokens = tokenizer.tokenize(jobNorm) || [];

    // Remove common stop words for better signaling
    const stopWords = new Set(['the', 'and', 'a', 'to', 'of', 'in', 'i', 'is', 'that', 'it', 'on', 'you', 'this', 'for', 'but', 'with', 'are', 'have', 'be']);
    const meaningfulTokens = [...new Set(jobTokens.filter(t => !stopWords.has(t) && t.length > 2))];

    if (meaningfulTokens.length === 0) return 0;

    // 4. Calculate Document 0 (Resume) score against Job Description terms
    let totalScore = 0;

    // We measure how important each job token is IN the resume
    meaningfulTokens.forEach(term => {
        tfidf.tfidfs(term, function (i, measure) {
            if (i === 0) { // If it's the resume document
                totalScore += measure;
            }
        });
    });

    // 5. Normalize to 0-100 scale (Cosine Similarity approximation for TF-IDF)
    // A perfect match would have high TF-IDF for every term.
    // This is a naive heuristic specifically for the hackathon criteria.
    const maxPossibleScore = meaningfulTokens.length * 1.5; // Heuristic max weight
    const rawPercentage = (totalScore / maxPossibleScore) * 100;

    // Cap at 100
    const finalScore = Math.min(Math.round(rawPercentage), 100);

    // Boost slightly if they have at least some match (prevents demoralizing 0s)
    return finalScore > 0 ? Math.max(finalScore, 15) : 0;
};
