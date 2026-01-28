import { type Platform, type PostFormat } from './formatDecider';
import { type CohortType } from './goalToCohort';
import { type PrimaryGoal } from './platformFrequency';
import { type ScheduledPost } from './hardConstraints';

export interface ScoringContext {
    primaryGoal: PrimaryGoal;
    recentHistory: ScheduledPost[];
    preferredDays?: number[]; // 0-6 (Sun-Sat)
}

const FIT_SCORES: Record<CohortType, Record<Platform, number>> = {
    Education: { LinkedIn: 15, YouTube: 12, Instagram: 6 },
    Promotional: { Instagram: 15, LinkedIn: 12, YouTube: 6 },
    Personal: { Instagram: 15, LinkedIn: 9, YouTube: 6 },
    Inspiration: { Instagram: 15, YouTube: 12, LinkedIn: 6 },
};

/**
 * Calculates a soft score for a candidate post based on various optimization factors.
 */
export const scoreCandidate = (
    candidate: { cohort: CohortType; platform: Platform; format: PostFormat; date: Date },
    context: ScoringContext
): number => {
    let score = 0;

    // 1. Goal Alignment (+10 to +30)
    // Simplified logic: certain cohorts align better with certain goals
    if (context.primaryGoal === 'Thought Leadership' && candidate.cohort === 'Education') score += 30;
    if (context.primaryGoal === 'Engagement/Awareness' && (candidate.cohort === 'Personal' || candidate.cohort === 'Inspiration')) score += 30;
    if (context.primaryGoal === 'Leads/Sales' && (candidate.cohort === 'Promotional' || candidate.cohort === 'Education')) score += 30;

    // 2. Cohort Variety (+20)
    // Bonus if the cohort hasn't appeared in the last 3 posts
    const recentCohorts = context.recentHistory.slice(0, 3).map(p => p.cohort);
    if (!recentCohorts.includes(candidate.cohort)) {
        score += 20;
    }

    // 3. Platform Fit (+6 to +15)
    score += FIT_SCORES[candidate.cohort][candidate.platform] || 0;

    // 4. Day-of-Week Preference (+10)
    const day = candidate.date.getDay();
    const isWeekday = day >= 1 && day <= 5;

    if (candidate.cohort === 'Education' && isWeekday) {
        score += 10;
    } else if ((candidate.cohort === 'Personal' || candidate.cohort === 'Inspiration') && !isWeekday) {
        score += 10;
    }

    return score;
};
