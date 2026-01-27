export type Platform = 'LinkedIn' | 'Instagram' | 'Twitter';
export type FunnelStage = 'Awareness' | 'Consideration' | 'Conversion';
export type Cohort = 'Founders' | 'Creators' | 'Marketers';
export type ContentPillar = 'Education' | 'Inspiration' | 'Personal' | 'Promotional';
export type ContentFormat = 'Carousel' | 'Reel' | 'Text' | 'Image';

export interface SocialPost {
    id: string;
    date: string;
    platform: Platform;
    funnel: FunnelStage;
    cohort: Cohort;
    pillar: ContentPillar;
    format: ContentFormat;
    coreMessage: string;
    hook: string;
}

export const mockPosts: SocialPost[] = [
    {
        id: '1',
        date: '2026-02-01',
        platform: 'LinkedIn',
        funnel: 'Awareness',
        cohort: 'Founders',
        pillar: 'Education',
        format: 'Carousel',
        coreMessage: 'Scaling to $1M requires systems, not just hustle.',
        hook: '3 mistakes preventing you from scaling to $1M (and how to fix them)',
    },
    {
        id: '2',
        date: '2026-02-02',
        platform: 'Instagram',
        funnel: 'Consideration',
        cohort: 'Creators',
        pillar: 'Personal',
        format: 'Reel',
        coreMessage: 'Behind the scenes of my content creation workflow.',
        hook: 'Stop guessing what to post. Here is my exact workflow 🎥',
    },
    {
        id: '3',
        date: '2026-02-03',
        platform: 'Twitter',
        funnel: 'Conversion',
        cohort: 'Marketers',
        pillar: 'Promotional',
        format: 'Text',
        coreMessage: 'Join the masterclass to learn advanced analytics.',
        hook: 'Marketing is math. If you want to master the numbers, join us this Friday.',
    },
    {
        id: '4',
        date: '2026-02-04',
        platform: 'LinkedIn',
        funnel: 'Awareness',
        cohort: 'Founders',
        pillar: 'Inspiration',
        format: 'Image',
        coreMessage: 'Resilience is the most important trait for a founder.',
        hook: 'I wanted to quit 5 times last year. Here is why I didn\'t.',
    },
    {
        id: '5',
        date: '2026-02-05',
        platform: 'Instagram',
        funnel: 'Awareness',
        cohort: 'Creators',
        pillar: 'Education',
        format: 'Carousel',
        coreMessage: 'How to design better thumbnails.',
        hook: 'Your content is good, but your packaging sucks. Fix it in 3 steps.',
    },
    {
        id: '6',
        date: '2026-02-06',
        platform: 'Twitter',
        funnel: 'Consideration',
        cohort: 'Founders',
        pillar: 'Education',
        format: 'Text',
        coreMessage: 'The difference between sales and marketing.',
        hook: 'Sales captures value. Marketing creates it. Know the difference.',
    },
    {
        id: '7',
        date: '2026-02-07',
        platform: 'LinkedIn',
        funnel: 'Conversion',
        cohort: 'Marketers',
        pillar: 'Promotional',
        format: 'Text',
        coreMessage: 'Last chance to sign up for the cohort.',
        hook: 'Doors close in 24 hours. Don\'t miss out on Q1 planning.',
    },
    {
        id: '8',
        date: '2026-02-08',
        platform: 'Instagram',
        funnel: 'Awareness',
        cohort: 'Creators',
        pillar: 'Inspiration',
        format: 'Reel',
        coreMessage: 'You are just one piece of content away.',
        hook: 'It took me 100 bad videos to make 1 good one. Keep going.',
    },
    {
        id: '9',
        date: '2026-01-27',
        platform: 'LinkedIn',
        funnel: 'Consideration',
        cohort: 'Founders',
        pillar: 'Personal',
        format: 'Text',
        coreMessage: 'Why I started this agency.',
        hook: 'I was tired of seeing bad content.',
    },
    {
        id: '10',
        date: '2026-01-29',
        platform: 'Instagram',
        funnel: 'Awareness',
        cohort: 'Creators',
        pillar: 'Education',
        format: 'Reel',
        coreMessage: '3 tips for better lighting.',
        hook: 'Stop using ring lights correctly.',
    },
];
