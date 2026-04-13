/**
 * Report generator for the Construction Operations Diagnostic.
 * Depends on: assessment-data.js (AssessmentData global)
 *
 * Usage:
 *   const scored = Scoring.compute(responses);
 *   const report = Report.generate(scored);
 */
const Report = (() => {

  /**
   * Builds a category narrative object for the given category id,
   * using its band to select the correct copy.
   */
  function getCategoryNarrative(categoryId, categoryBands) {
    const { categories, content } = AssessmentData;
    const band      = categoryBands[categoryId];
    const catMeta   = categories.find(c => c.id === categoryId);
    const narrative = content.categoryNarratives[categoryId][band];
    return {
      category:      categoryId,
      category_name: catMeta ? catMeta.name : categoryId,
      band,
      title:         narrative.title,
      summary:       narrative.summary,
      risk:          narrative.risk,
      next_steps:    narrative.next_steps
    };
  }

  /**
   * Main generate function.
   * @param {Object} scored  Output from Scoring.compute()
   * @returns {Object} Full report object
   */
  function generate(scored) {
    const { content, sections } = AssessmentData;
    const {
      category_bands,
      category_percents,
      section_percents,
      section_bands,
      priority,
      sorted_categories
    } = scored;

    const { primary_constraint, secondary_constraint, top_strength } = priority;

    // ── Intro (based on percentage thresholds) ────────────────────────────
    const constrainedCategories = Object.values(category_percents).filter(p => p < 55).length;
    let introText = '';
    if (constrainedCategories >= 2) {
      introText = "Your results point to structural gaps across the business, not just isolated issues. The same operating weaknesses are showing up in multiple parts of execution.";
    } else if (constrainedCategories === 1) {
      introText = "Your operation has a workable foundation, but one category stands out as a clear constraint. That issue is likely creating drag across multiple workflows.";
    } else {
      introText = "Your operation has a solid foundation. The opportunity now is tightening inconsistency rather than rebuilding from scratch.";
    }

    // ── Final summary headline + body ─────────────────────────────────────
    let headline = '', summary = '';
    for (const rule of content.finalSummaryLogic) {
      if (rule.condition(primary_constraint, secondary_constraint)) {
        headline = rule.headline;
        summary  = rule.summary;
        break;
      }
    }

    // ── Build category narratives with percentages ───────────────────────
    function getCategoryWithPercent(categoryId) {
      const narrative = getCategoryNarrative(categoryId, category_bands);
      return {
        ...narrative,
        percent: Math.round(category_percents[categoryId])
      };
    }

    // ── Category output in specified order ───────────────────────────────
    const specialIds = new Set([primary_constraint, secondary_constraint, top_strength]);
    const remaining = sorted_categories
      .filter(id => !specialIds.has(id))
      .map(getCategoryWithPercent);

    // ── All sections overview (sorted highest to lowest) ──────────────────
    const allSections = sections
      .map(s => ({
        section:      s.id,
        section_name: s.name,
        percent:      Math.round(section_percents[s.id]),
        score:        (Math.round(section_percents[s.id]) / 100 * 10 * 10) / 10, // out of 10, one decimal
        band:         section_bands[s.id],
        narrative:    content.sectionNarratives[section_bands[s.id]]
      }))
      .sort((a, b) => b.percent - a.percent);

    // ── Weakest sections (bottom 3 by percentage) ────────────────────────
    const weakestSections = allSections.slice(0, 3);

    return {
      title:               "Operations Diagnostic Report",
      overview:            content.overview,
      intro:               introText,
      headline,
      summary,
      all_sections:        allSections,
      top_strength:        getCategoryWithPercent(top_strength),
      primary_constraint:  getCategoryWithPercent(primary_constraint),
      secondary_constraint:getCategoryWithPercent(secondary_constraint),
      remaining_categories: remaining,
      weakest_sections:    weakestSections,
      closing_cta:         content.closingCta
    };
  }

  return { generate };
})();

if (typeof module !== 'undefined') module.exports = Report;
