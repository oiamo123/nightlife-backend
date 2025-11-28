import prisma from "../../lib/prisma.ts";
import { EngagementType } from "../models.ts";

// =======================================================
// Scores items for popualar now and near you
// to provide relevant information
// ======================================================
// They're all similar with the exception of events / performers because events and performers share events types
// Steps are as follows
// 1. Get total clicks
// 2. Get dwell time + clicks grouped by type id ie event type
// 3. Normalize clicks and dwell time using total clicks per type / total clicks
//    to produce odds they click on that category
// 4. Look at the final item type, and use (click % * 0.30) + (preference * 0.25) + (dwell % * 45)
// 5. If the account is new, add a 0.2 bonus to the final score. May push it above 1 but oh well haha
// =======================================================

export async function scoreVenueItems({
  userId,
  items,
}: {
  userId: number;
  items: { id: number; venueTypeId: number }[];
}): Promise<Record<number, number>> {
  const preferencesQuery = prisma.venueTypePreference.findMany({
    where: {
      userId,
    },
  });

  const venueMetricsQuery = prisma.$queryRaw`
    SELECT
      vt."id",
      SUM(CASE WHEN vm."engagementTypeId" = ${EngagementType.click} THEN 1 ELSE 0 END) AS "clicks",
      SUM(CASE WHEN vm."engagementTypeId" = ${EngagementType.dwellTime} THEN vm."duration" ELSE 0 END) AS "dwellTime"
    FROM "VenueMetric" vm
    JOIN "Venue" v ON v."id" = vm."venueId"
    JOIN "VenueType" vt ON vt."id" = v."venueTypeId"
    WHERE vm."engagementTypeId" IN (${EngagementType.click}, ${EngagementType.dwellTime})
    AND vm."userId" = ${userId}
	  GROUP BY vt."id"
  `;

  const [venuePreferences, venueMetrics]: any[] = await Promise.all([
    preferencesQuery,
    venueMetricsQuery,
  ]);

  const totalClicks = venueMetrics.reduce((acc, cur) => {
    return acc + Number(cur.clicks);
  }, 0);

  const totalDwellTime = venueMetrics.reduce((acc, cur) => {
    return acc + Number(cur.dwellTime);
  }, 0);

  const preferenceWeights: Set<number> = new Set();
  venuePreferences.forEach((row) => {
    preferenceWeights.add(row.venueTypeId);
  });

  const clickWeights: Record<number, number> = {};
  const dwellTimeWeights: Record<number, number> = {};

  venueMetrics.forEach((row) => {
    const id = row.id;
    clickWeights[id] = totalClicks > 0 ? Number(row.clicks) / totalClicks : 0;
    dwellTimeWeights[id] =
      totalDwellTime > 0 ? Number(row.dwellTime) / totalDwellTime : 0;
  });

  const results: Record<number, number> = {};
  const newAccount = totalClicks < 200 || totalDwellTime < 1000 * 60 * 2;

  items.forEach((item) => {
    let score = 0;

    score +=
      (clickWeights[item.venueTypeId] || 0) * 0.3 +
      (dwellTimeWeights[item.venueTypeId] || 0) * 0.45 +
      (preferenceWeights.has(item.venueTypeId) ? 0.25 : 0);

    results[item.id] = newAccount ? score * 0.6 + 0.4 : score;
  });

  return results;
}

export async function scoreEventItems({
  userId,
  items,
}: {
  userId: number;
  items: { id: number; eventTypeId: number }[];
}): Promise<Record<number, number>> {
  const preferencesQuery = prisma.eventTypePreference.findMany({
    where: {
      userId,
    },
  });

  const eventMetricsQuery = prisma.$queryRaw`
    SELECT 
      evt."id",
      SUM(CASE WHEN em."engagementTypeId" = 0 THEN 1 ELSE 0 END) AS "clicks",
      SUM(CASE WHEN em."engagementTypeId" = 2 THEN em."duration" ELSE 0 END) AS "dwellTime"
    FROM "EventMetric" em
    JOIN "Event" e ON e."id" = em."eventId"
    JOIN "EventType" evt ON evt."id" = e."eventTypeId"
    WHERE em."engagementTypeId" IN (${EngagementType.click}, ${EngagementType.dwellTime})
    AND em."userId" = ${userId}
    GROUP BY evt."id";
  `;

  const performerMetricsQuery = prisma.$queryRaw`
    SELECT 
      evt."id",
      SUM(CASE WHEN pm."engagementTypeId" = ${EngagementType.click} THEN 1 ELSE 0 END) AS "clicks",
      SUM(CASE WHEN pm."engagementTypeId" = ${EngagementType.dwellTime} THEN pm."duration" ELSE 0 END) AS "dwellTime"
    FROM "PerformerMetric" pm
    JOIN "Performer" p ON p."id" = pm."performerId"
    JOIN "EventType" evt ON evt."id" = p."eventTypeId"
    WHERE pm."engagementTypeId" IN (${EngagementType.click}, ${EngagementType.dwellTime})
    AND pm."userId" = ${userId}
	  GROUP BY evt."id"
  `;

  const [preferences, eventMetrics, performerMetrics]: any[] =
    await Promise.all([
      preferencesQuery,
      eventMetricsQuery,
      performerMetricsQuery,
    ]);

  let totalClicks = 0;
  let totalDwellTime = 0;

  const eventClicks: Record<number, number> = {};
  const eventDwellTime: Record<number, number> = {};

  eventMetrics.forEach((row: any) => {
    const type = row.id;
    const rowClicks = Number(row.clicks);
    const rowDwellTime = Number(row.dwellTime);

    totalClicks += rowClicks;
    totalDwellTime += rowDwellTime;

    eventClicks[type] = (eventClicks[type] || 0) + rowClicks;
    eventDwellTime[type] = (eventDwellTime[type] || 0) + rowDwellTime;
  });

  performerMetrics.forEach((row: any) => {
    const type = row.id;
    const rowClicks = Number(row.clicks);
    const rowDwellTime = Number(row.dwellTime);

    totalClicks += rowClicks;
    totalDwellTime += rowDwellTime;

    eventClicks[type] = (eventClicks[type] || 0) + rowClicks;
    eventDwellTime[type] = (eventDwellTime[type] || 0) + rowDwellTime;
  });

  const preferenceWeights: Set<number> = new Set();
  preferences.forEach((row) => {
    preferenceWeights.add(row.eventTypeId);
  });

  const clickWeights: Record<number, number> = {};
  const dwellTimeWeights: Record<number, number> = {};

  Object.entries(eventClicks).forEach(([id, count]) => {
    clickWeights[Number(id)] = totalClicks > 0 ? count / totalClicks : 0;
  });

  Object.entries(eventDwellTime).forEach(([id, count]) => {
    dwellTimeWeights[Number(id)] =
      totalDwellTime > 0 ? count / totalDwellTime : 0;
  });

  const results: Record<number, number> = {};
  const newAccount = totalClicks < 200 || totalDwellTime < 1000 * 60 * 2;

  items.forEach((item) => {
    let score = 0;

    score +=
      (clickWeights[item.eventTypeId] || 0) * 0.3 +
      (dwellTimeWeights[item.eventTypeId] || 0) * 0.45 +
      (preferenceWeights.has(item.eventTypeId) ? 0.25 : 0);

    results[item.id] = newAccount ? score * 0.6 + 0.4 : score;
  });

  return results;
}

// =======================================================
// Promotions
// =======================================================
export async function scorePromotionItem({
  userId,
  items,
}: {
  userId: number;
  items: { id: number; promotionTypeId: number }[];
}): Promise<Record<number, number>> {
  const preferencesQuery = prisma.promotionTypePreference.findMany({
    where: {
      userId,
    },
  });

  const promotionMetricsQuery = prisma.$queryRaw`
    SELECT
      pt."id",
      SUM(CASE WHEN pm."engagementTypeId" = ${EngagementType.click} THEN 1 ELSE 0 END) AS "clicks",
      SUM(CASE WHEN pm."engagementTypeId" = ${EngagementType.dwellTime} THEN pm."duration" ELSE 0 END) AS "dwellTime"
    FROM "PromotionMetric" pm
    JOIN "Promotion" p ON p."id" = pm."promotionId"
    JOIN "PromotionType" pt ON pt."id" = p."promotionTypeId"
    WHERE pm."engagementTypeId" IN (${EngagementType.click}, ${EngagementType.dwellTime})
    AND pm."userId" = ${userId}
	  GROUP BY pt."id"
  `;

  const [promotionPreferences, promotionMetrics]: any[] = await Promise.all([
    preferencesQuery,
    promotionMetricsQuery,
  ]);

  const totalClicks = promotionMetrics.reduce((acc, cur) => {
    return acc + Number(cur.clicks);
  }, 0);

  const totalDwellTime = promotionMetrics.reduce((acc, cur) => {
    return acc + Number(cur.dwellTime);
  }, 0);

  const preferenceWeights: Set<number> = new Set();
  promotionPreferences.forEach((row) => {
    preferenceWeights.add(row.promotionTypeId);
  });

  const clickWeights: Record<number, number> = {};
  const dwellTimeWeights: Record<number, number> = {};

  promotionMetrics.forEach((row) => {
    const id = row.id;
    clickWeights[id] = totalClicks > 0 ? Number(row.clicks) / totalClicks : 0;
    dwellTimeWeights[id] =
      totalDwellTime > 0 ? Number(row.dwellTime) / totalDwellTime : 0;
  });

  const results: Record<number, number> = {};
  items.forEach((item) => {
    const newAccount = totalClicks < 200 || totalDwellTime < 1000 * 60 * 2;
    let score = 0;

    score +=
      (clickWeights[item.promotionTypeId] || 0) * 0.3 +
      (dwellTimeWeights[item.promotionTypeId] || 0) * 0.45 +
      (preferenceWeights.has(item.promotionTypeId) ? 0.25 : 0);

    results[item.id] = newAccount ? score * 0.6 + 0.4 : score;
  });

  return results;
}

export function getTopScoredItems({
  scores,
  items,
  topN = 10,
}: {
  scores: Record<number, number>;
  items: { id: number }[];
  topN: number;
}) {
  return items
    .map((item) => ({ ...item, score: scores[item.id] ?? 0 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}
