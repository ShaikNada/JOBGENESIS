import natural from 'natural';

/**
 * Vanguard Intelligence: Strategic Scoring Engine
 * 
 * Replaces hackathon-era randomizations with robust, data-driven 
 * semantic and skill-based calculations.
 */

const tokenizer = new natural.WordTokenizer();

/**
 * Calculates a match score (0-100) based on weighted factors:
 * 1. Semantic Similarity (TF-IDF)
 * 2. Keyword/Skill Overlap
 * 3. Market Demand adjustments
 */
export const calculateNeuralMatchScore = (
    sourceText: string, 
    targetText: string, 
    sourceSkills: string[] = [], 
    targetSkills: string[] = []
): number => {
    if (!sourceText || !targetText) return 0;

    // 1. Semantic Component (TF-IDF Similarity)
    const tfidf = new natural.TfIdf();
    tfidf.addDocument(sourceText.toLowerCase());
    tfidf.addDocument(targetText.toLowerCase());

    const targetTokens = tokenizer.tokenize(targetText.toLowerCase()) || [];
    const stopWords = new Set(['the', 'and', 'a', 'to', 'of', 'in', 'is', 'that', 'it', 'on', 'you', 'for', 'with', 'are', 'have', 'be', 'this']);
    const meaningfulTokens = [...new Set(targetTokens.filter(t => !stopWords.has(t) && t.length > 2))];

    if (meaningfulTokens.length === 0) return 0;

    let semanticScore = 0;
    meaningfulTokens.forEach(term => {
        tfidf.tfidfs(term, (i, measure) => {
            if (i === 0) semanticScore += measure; // Interest of source in target
        });
    });

    // Normalize semantic score (0-100)
    // Heuristic: Avg TF-IDF measure of 0.8+ per token is a very strong match
    const normalizedSemantic = Math.min((semanticScore / (meaningfulTokens.length * 0.8)) * 100, 100);

    // 2. Skill Overlap Component (0-100)
    let skillScore = 0;
    if (targetSkills.length > 0) {
        const sourceSet = new Set(sourceSkills.map(s => s.toLowerCase()));
        const matches = targetSkills.filter(s => sourceSet.has(s.toLowerCase()));
        skillScore = (matches.length / targetSkills.length) * 100;
    } else {
        // Fallback to searching targetSkills in sourceText
        const matches = targetSkills.filter(s => sourceText.toLowerCase().includes(s.toLowerCase()));
        skillScore = targetSkills.length > 0 ? (matches.length / targetSkills.length) * 100 : normalizedSemantic;
    }

    // 3. Strategic Weighting
    // 50% Semantic (Context/Experience) + 50% Skill Alignment
    const finalScore = Math.round((normalizedSemantic * 0.5) + (skillScore * 0.5));

    // Intelligence Floor: Ensure we don't return purely demoralizing 0s if there's *any* overlap
    return finalScore > 0 ? Math.max(finalScore, 5) : 0;
};
