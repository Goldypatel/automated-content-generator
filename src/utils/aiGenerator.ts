import { type SocialPost, type ContentPillar } from '../data/mockPosts';
import { type ContentGoal } from './cohortLogic';

export interface BrandProfile {
    name: string;
    category: string;
    audience: string;
    usp: string;
}

export interface GeneratedContent {
    coreMessage: string;
    hook: string;
}

const templates: Record<ContentPillar, (brand: BrandProfile) => GeneratedContent> = {
    'Education': (brand) => ({
        coreMessage: `5 ways ${brand.name} helps ${brand.audience} master ${brand.category}.`,
        hook: `Stop struggling with ${brand.category}. Here is the fix.`
    }),
    'Promotional': (brand) => ({
        coreMessage: `Unlock ${brand.usp} with ${brand.name} today.`,
        hook: `Ready to level up your ${brand.category}?`
    }),
    'Personal': (brand) => ({
        coreMessage: `Why I built ${brand.name} for ${brand.audience}.`,
        hook: `I almost quit ${brand.category} until I realized this.`
    }),
    'Inspiration': (brand) => ({
        coreMessage: `${brand.category} is about more than just numbers.`,
        hook: `The biggest lie in ${brand.category} is...`
    })
};

export const generateContentIdea = (
    brand: BrandProfile,
    _goal: ContentGoal,
    post: SocialPost
): GeneratedContent => {
    try {
        const generator = templates[post.pillar] || templates['Education'];
        // Simulation of a JSON response string from an AI
        const mockJsonResponse = JSON.stringify(generator(brand));

        const parsed = JSON.parse(mockJsonResponse) as GeneratedContent;

        return {
            coreMessage: parsed.coreMessage || "Post idea unavailable",
            hook: parsed.hook || "Please regenerate"
        };
    } catch (error) {
        return {
            coreMessage: "Post idea unavailable",
            hook: "Please regenerate"
        };
    }
};
