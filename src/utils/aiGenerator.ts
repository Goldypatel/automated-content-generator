import { type SocialPost, type ContentPillar } from '../data/mockPosts';
import { type ContentGoal } from './cohortLogic';
import { type PerformanceSignals } from './performanceAnalyzer';

export interface BrandProfile {
    name: string;
    category: string;
    audience: string;
    usp: string;
}

export interface GeneratedContent {
    coreMessage: string;
    postCommunication: string;
}

const templates: Record<ContentPillar, (brand: BrandProfile, signals?: PerformanceSignals) => GeneratedContent> = {
    'Education': (brand, signals) => ({
        coreMessage: `${brand.name} provides a systematic 5-step approach to mastering ${brand.category} for ${brand.audience}.`,
        postCommunication: `Stop struggling with inconsistent results in ${brand.category}.\n${signals?.insightSummary ? `Historical data shows this topic resonates well with your audience. ` : ''}Our team at ${brand.name} has spent years refining this framework.\nIn this post, we break down exactly how you can implement these 5 steps today.\nNo more guesswork, just data-driven strategies.\nReady to see the difference for yourself?\nSave this for your next planning session.`
    }),
    'Promotional': (brand, signals) => ({
        coreMessage: `Experience the power of ${brand.usp} and transform your ${brand.category} workflow with ${brand.name}.`,
        postCommunication: `Are you ready to take your ${brand.category} results to the next level?\n${brand.name} is designed specifically for ${brand.audience}${signals?.winningFormats.includes('Reel') ? ' which is why we created this high-impact reel' : ''}.\nJoin over 1,000+ professionals using our platform to scale.\nCheck the link in our bio for a special 20% discount this week.\nDon't let this opportunity pass you by.\nStart your trial today.`
    }),
    'Personal': (brand) => ({
        coreMessage: `The journey of building ${brand.name} was fueled by a desire to solve ${brand.category} challenges for ${brand.audience}.`,
        postCommunication: `I almost quit the ${brand.category} industry three years ago.\nI was tired of tools that didn't understand the real needs of ${brand.audience}.\nThat frustration is what led to the birth of ${brand.name}.\nBuilding this has been the most rewarding challenge of my life.\nIt's not just a business, it's a mission to empower you.\nThank you for being part of this journey.`
    }),
    'Inspiration': (brand) => ({
        coreMessage: `True success in ${brand.category} is defined by the impact you make on ${brand.audience}, not just the metrics.`,
        postCommunication: `People often ask me the secret to winning at ${brand.category}.\nIt isn't about the latest hack or short-term viral trend.\nIt's about showing up consistently for ${brand.audience}.\nThe biggest lie in our industry is that it happens overnight.\nKeep pushing, keep creating, and stay true to your vision.\nYour breakthrough is closer than you think.`
    })
};

export const generateContentIdea = (
    brand: BrandProfile,
    _goal: ContentGoal,
    post: SocialPost,
    signals?: PerformanceSignals
): GeneratedContent => {
    try {
        const generator = templates[post.pillar] || templates['Education'];
        const mockData = generator(brand, signals);

        return {
            coreMessage: mockData.coreMessage || "Post idea unavailable.",
            postCommunication: mockData.postCommunication || "Content generation in progress.\nPlease check back shortly.\nOur AI is currently processing your request."
        };
    } catch (error) {
        return {
            coreMessage: "Post idea unavailable.",
            postCommunication: "System error during generation.\nOur team has been notified.\nWe apologize for the inconvenience.\nSafety fallback active."
        };
    }
};
