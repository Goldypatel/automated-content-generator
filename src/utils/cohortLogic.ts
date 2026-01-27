import { type SocialPost, type ContentPillar } from '../data/mockPosts';

export type ContentGoal =
    | 'engagement'
    | 'followers-growth'
    | 'traffic'
    | 'lead-gen'
    | 'sales'
    | 'thought-leadership';

export interface CohortMix {
    education: number;
    promotional: number;
    personal: number;
    inspiration: number;
}

// Maps identifying semantic "Cohorts" to data "Pillars"
// Education -> Education
// Sales -> Promotional
// Community -> Personal
// Awareness -> Inspiration
export const mapPillarToCohortType = (pillar: ContentPillar): keyof CohortMix => {
    switch (pillar) {
        case 'Education': return 'education';
        case 'Promotional': return 'promotional';
        case 'Personal': return 'personal';
        case 'Inspiration': return 'inspiration';
        default: return 'education';
    }
};

export const getRecommendedMix = (goal: ContentGoal): CohortMix => {
    switch (goal) {
        case 'engagement':
            // High Community (Personal) and Awareness (Inspiration)
            return { education: 20, promotional: 10, personal: 40, inspiration: 30 };
        case 'followers-growth':
            // High Awareness (Inspiration) to reach new people
            return { education: 25, promotional: 10, personal: 25, inspiration: 40 };
        case 'traffic':
            // High Education to provide value and link out
            return { education: 50, promotional: 15, personal: 15, inspiration: 20 };
        case 'lead-gen':
            // Balanced between Education and Sales
            return { education: 40, promotional: 25, personal: 15, inspiration: 20 };
        case 'sales':
            // Maximum allowed Promotional (25%) + Education
            return { education: 45, promotional: 25, personal: 10, inspiration: 20 };
        case 'thought-leadership':
            // Very high Education and strong Awareness
            return { education: 60, promotional: 5, personal: 10, inspiration: 25 };
        default:
            return { education: 25, promotional: 25, personal: 25, inspiration: 25 };
    }
};

export const getCurrentMix = (posts: SocialPost[]): CohortMix => {
    const total = posts.length;
    if (total === 0) {
        return { education: 0, promotional: 0, personal: 0, inspiration: 0 };
    }

    const counts = posts.reduce((acc, post) => {
        const key = mapPillarToCohortType(post.pillar);
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {} as Record<keyof CohortMix, number>);

    return {
        education: Math.round(((counts.education || 0) / total) * 100),
        promotional: Math.round(((counts.promotional || 0) / total) * 100),
        personal: Math.round(((counts.personal || 0) / total) * 100),
        inspiration: Math.round(((counts.inspiration || 0) / total) * 100),
    };
};
