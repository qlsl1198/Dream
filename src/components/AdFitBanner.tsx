/** Advertising is disabled in this release. No ad SDK is imported. */
import React from 'react';
export const ADMOB_AD_SIZES = { BANNER: 'BANNER', MEDIUM_RECTANGLE: 'MEDIUM_RECTANGLE', LEADERBOARD: 'LEADERBOARD', FULL_BANNER: 'FULL_BANNER', LARGE_BANNER: 'LARGE_BANNER' } as const;
export default function AdMobBanner(_props: { unitId?: string; adSize?: keyof typeof ADMOB_AD_SIZES; style?: unknown }): React.ReactElement | null { return null; }
