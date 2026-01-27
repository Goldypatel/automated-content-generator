import { type SocialPost, type ContentPillar } from '../data/mockPosts';
import { type CohortMix, mapPillarToCohortType } from './cohortLogic';

interface RebalanceResult {
    rebalancedPosts: SocialPost[];
    changes: string[];
}

// Helper to reverse map Cohort Type to a pillar (deterministic choice)
// education -> Education
// promotional -> Promotional
// personal -> Personal
// inspiration -> Inspiration
const mapCohortTypeToPillar = (type: keyof CohortMix): ContentPillar => {
    switch (type) {
        case 'education': return 'Education';
        case 'promotional': return 'Promotional';
        case 'personal': return 'Personal';
        case 'inspiration': return 'Inspiration';
    }
};

export const rebalanceCalendar = (
    currentPosts: SocialPost[],
    targetMix: CohortMix
): RebalanceResult => {
    const posts = JSON.parse(JSON.stringify(currentPosts)) as SocialPost[]; // Deep copy
    const total = posts.length;
    if (total === 0) return { rebalancedPosts: posts, changes: [] };

    const changes: string[] = [];

    // 1. Calculate target counts
    const targetCounts: Record<keyof CohortMix, number> = {
        education: Math.round(total * (targetMix.education / 100)),
        promotional: Math.round(total * (targetMix.promotional / 100)),
        personal: Math.round(total * (targetMix.personal / 100)),
        inspiration: Math.round(total * (targetMix.inspiration / 100)),
    };

    // Adjust for rounding errors (simple fix: add to education)
    const assignedTotal = Object.values(targetCounts).reduce((a, b) => a + b, 0);
    if (assignedTotal < total) {
        targetCounts.education += (total - assignedTotal);
    }

    // 2. Identify current counts and buckets
    const buckets: Record<keyof CohortMix, SocialPost[]> = {
        education: [],
        promotional: [],
        personal: [],
        inspiration: []
    };

    posts.forEach(post => {
        const key = mapPillarToCohortType(post.pillar);
        buckets[key].push(post);
    });

    // 3. Rebalance
    // Logic: Take excess from over-represented buckets and move to under-represented ones.

    const categories = Object.keys(targetCounts) as (keyof CohortMix)[];

    // Create a pool of "excess" posts
    let excessPosts: SocialPost[] = [];

    // First pass: Harvest excess
    categories.forEach(cat => {
        const currentCount = buckets[cat].length;
        const targetCount = targetCounts[cat];

        if (currentCount > targetCount) {
            const diff = currentCount - targetCount;
            // Take 'diff' posts from the end of the bucket array (arbitrary deterministic choice)
            const removed = buckets[cat].splice(currentCount - diff, diff);
            excessPosts = [...excessPosts, ...removed];
            // Log generic change (will refine later)
        }
    });

    // Second pass: Distribute excess to deficit
    categories.forEach(cat => {
        const currentCount = buckets[cat].length;
        const targetCount = targetCounts[cat];

        if (currentCount < targetCount) {
            const needed = targetCount - currentCount;
            const toAdd = excessPosts.splice(0, needed);

            toAdd.forEach(post => {
                const oldPillar = post.pillar;
                const newPillar = mapCohortTypeToPillar(cat);
                post.pillar = newPillar;
                post.cohort = cat === 'personal' ? 'Creators' : cat === 'promotional' ? 'Marketers' : 'Founders'; // Simplified cohort mapping for UI badge

                // Add to bucket
                buckets[cat].push(post);

                changes.push(`Changed post "${post.id}" from ${oldPillar} to ${newPillar}`);
            });
        }
    });

    // Flatten buckets back to array
    const rebalancedPosts = [
        ...buckets.education,
        ...buckets.promotional,
        ...buckets.personal,
        ...buckets.inspiration
    ].sort((a, b) => parseInt(a.id) - parseInt(b.id)); // Keep roughly original order if IDs are numeric

    return { rebalancedPosts, changes };
};
