/**
 * Scoring engine for the Construction Operations Diagnostic.
 * Depends on: assessment-data.js (AssessmentData global)
 *
 * Usage:
 *   const result = Scoring.compute({ Q1: 'B', Q2: 'C', ... });
 */
const Scoring = (() => {

  // band label → sort rank (lower = more constrained)
  const BAND_RANK = { low: 0, mid: 1, high: 2 };

  /**
   * Given a percentage (0-100) and percentage-based band thresholds,
   * return the matching band key ('high' | 'mid' | 'low').
   * Thresholds: high 80-100, mid 55-79, low 0-54
   */
  function assignBand(percentage) {
    if (percentage >= 80) return 'high';
    if (percentage >= 55) return 'mid';
    return 'low';
  }

  /**
   * Main compute function.
   * @param {Object} responses  e.g. { Q1: 'A', Q2: 'C', ... }
   * @returns {Object} scored output with percentage-based calculations
   */
  function compute(responses) {
    const { questions, sections, categories, scoring } = AssessmentData;
    const { responseToPoints, priorityOrderForTies } = scoring;

    // ── 1. Count questions per section and category ───────────────────────
    const sectionCounts  = {};
    const categoryCounts = {};
    sections.forEach(s => { sectionCounts[s.id] = 0; });
    categories.forEach(c => { categoryCounts[c.id] = 0; });

    for (const q of questions) {
      sectionCounts[q.section]++;
      categoryCounts[q.category]++;
    }

    // ── 2. Initialize score accumulators ──────────────────────────────────
    const sectionScores  = {};
    const sectionMaxScores = {};
    sections.forEach(s => {
      sectionScores[s.id]  = 0;
      sectionMaxScores[s.id] = sectionCounts[s.id] * 3; // max 3 points per question
    });

    const categoryScores = {};
    const categoryMaxScores = {};
    categories.forEach(c => {
      categoryScores[c.id] = 0;
      categoryMaxScores[c.id] = categoryCounts[c.id] * 3; // max 3 points per question
    });

    // ── 3. Accumulate points ──────────────────────────────────────────────
    for (const q of questions) {
      const ans = responses[q.id];
      const pts = (ans && responseToPoints[ans] !== undefined) ? responseToPoints[ans] : 0;
      sectionScores[q.section]   += pts;
      categoryScores[q.category] += pts;
    }

    // ── 4. Calculate percentages ──────────────────────────────────────────
    const sectionPercents = {};
    for (const [id, score] of Object.entries(sectionScores)) {
      sectionPercents[id] = (score / sectionMaxScores[id]) * 100;
    }

    const categoryPercents = {};
    for (const [id, score] of Object.entries(categoryScores)) {
      categoryPercents[id] = (score / categoryMaxScores[id]) * 100;
    }

    // ── 5. Assign section bands using percentages ─────────────────────────
    const sectionBands = {};
    for (const id of Object.keys(sectionPercents)) {
      sectionBands[id] = assignBand(sectionPercents[id]);
    }

    // ── 6. Assign category bands using percentages ────────────────────────
    const categoryBands = {};
    for (const id of Object.keys(categoryPercents)) {
      categoryBands[id] = assignBand(categoryPercents[id]);
    }

    // ── 7. Sort categories to find constraints & strengths ────────────────
    // Sort ascending by: band rank → percentage score → priority order index
    // Result: index 0 = most constrained (primary), last = strongest
    const sortedCategories = categories.map(c => c.id).sort((a, b) => {
      const bandDiff  = BAND_RANK[categoryBands[a]] - BAND_RANK[categoryBands[b]];
      if (bandDiff  !== 0) return bandDiff;
      const percentDiff = categoryPercents[a] - categoryPercents[b];
      if (percentDiff !== 0) return percentDiff;
      return priorityOrderForTies.indexOf(a) - priorityOrderForTies.indexOf(b);
    });

    return {
      section_scores:    sectionScores,
      section_percents:  sectionPercents,
      section_bands:     sectionBands,
      category_scores:   categoryScores,
      category_percents: categoryPercents,
      category_bands:    categoryBands,
      sorted_categories: sortedCategories,
      priority: {
        primary_constraint:   sortedCategories[0],
        secondary_constraint: sortedCategories[1],
        top_strength:         sortedCategories[sortedCategories.length - 1]
      }
    };
  }

  return { compute };
})();

if (typeof module !== 'undefined') module.exports = Scoring;
