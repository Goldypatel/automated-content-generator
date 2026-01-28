import { type CohortType } from './goalToCohort';

export type FunnelStage = 'Awareness' | 'Consideration' | 'Conversion';
export type BoatPillar = 'Authority' | 'Trust' | 'Belief';

/**
 * Maps a cohort type to a funnel stage in a deterministic way.
 */
export const mapCohortToFunnel = (cohort: CohortType): FunnelStage => {
    switch (cohort) {
        case 'Education':
            return 'Consideration';
        case 'Promotional':
            return 'Conversion';
        case 'Personal':
            return 'Consideration';
        case 'Inspiration':
            return 'Awareness';
        default:
            return 'Consideration';
    }
};

/**
 * Maps a cohort type to a BOAT pillar in a deterministic way.
 */
export const mapCohortToBoatPillar = (cohort: CohortType): BoatPillar => {
    switch (cohort) {
        case 'Education':
            return 'Authority';
        case 'Promotional':
            return 'Trust';
        case 'Personal':
            return 'Belief';
        case 'Inspiration':
            return 'Trust';
        default:
            return 'Trust';
    }
};
