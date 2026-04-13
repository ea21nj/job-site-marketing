const AssessmentData = {
  sections: [
    { id: 'bidding_pipeline',       name: 'Bidding & Pipeline' },
    { id: 'project_kickoff',        name: 'Project Kickoff' },
    { id: 'scheduling',             name: 'Scheduling' },
    { id: 'rfis_submittals',        name: 'RFIs & Submittals' },
    { id: 'project_visibility_risk',name: 'Project Visibility & Risk' },
    { id: 'field_execution',        name: 'Field Execution' },
    { id: 'closeout',               name: 'Closeout' }
  ],

  categories: [
    { id: 'accountability',    name: 'Accountability',    description: 'Whether ownership is clearly defined or work defaults to the team.' },
    { id: 'process',           name: 'Process',           description: 'Whether workflows are defined, repeatable, and system-driven.' },
    { id: 'failure_mode',      name: 'Failure Mode',      description: 'How early issues are identified and how consistently they are prevented.' },
    { id: 'people_dependency', name: 'People Dependency', description: 'How reliant execution is on specific individuals.' },
    { id: 'visibility',        name: 'Visibility',        description: 'Whether current information is accessible in real time.' },
    { id: 'cost_cash',         name: 'Cost / Cash',       description: 'How operational inefficiencies translate into financial impact.' }
  ],

  questions: [
    // ── Bidding & Pipeline ──────────────────────────────────────────────────
    { id: 'Q1',  section: 'bidding_pipeline', category: 'visibility',
      question: 'How easily can your team see the current status of every active bid?',
      options: {
        A: 'In one centralized system with real-time status, owner, and due dates',
        B: 'In structured spreadsheets that are regularly updated',
        C: 'By checking multiple tools, emails, or individual notes',
        D: 'There is no reliable way to see all active bids in one view'
      } },
    { id: 'Q2',  section: 'bidding_pipeline', category: 'process',
      question: 'When a bid needs follow-up, what usually triggers the next action?',
      options: {
        A: 'A defined workflow with reminders, deadlines, and ownership',
        B: 'A team member updates it manually in a structured process',
        C: 'Someone remembers to follow up based on experience or habit',
        D: 'Follow-up happens inconsistently or only when someone asks'
      } },
    { id: 'Q3',  section: 'bidding_pipeline', category: 'failure_mode',
      question: 'How are stalled or inactive bids usually identified?',
      options: {
        A: 'The system flags inactivity automatically',
        B: 'They are identified during regular pipeline reviews',
        C: 'They are usually noticed later when someone checks back in',
        D: 'They often go unnoticed until the opportunity is already cold or lost'
      } },
    { id: 'Q4',  section: 'bidding_pipeline', category: 'accountability',
      question: 'How is ownership of each bid defined?',
      options: {
        A: 'One person is clearly assigned and visible for every bid',
        B: 'Ownership is assigned, but not always visible in one place',
        C: 'Multiple people are involved, but ownership is not always clear',
        D: 'Ownership is unclear or changes without structure'
      } },
    { id: 'Q5',  section: 'bidding_pipeline', category: 'cost_cash',
      question: 'What is the typical cost of inefficiency in your bidding process?',
      options: {
        A: 'Minimal, with little rework or missed follow-up',
        B: 'Some lost time, but generally manageable',
        C: 'Noticeable time loss, duplicated effort, or delayed response',
        D: 'Significant inefficiency that affects hit rate, labor, or revenue'
      } },
    // ── Project Kickoff ─────────────────────────────────────────────────────
    { id: 'Q6',  section: 'project_kickoff', category: 'process',
      question: 'How standardized is your project kickoff process?',
      options: {
        A: 'Every project follows the same documented kickoff workflow',
        B: 'A kickoff process exists, but it is not followed consistently',
        C: 'The process is mostly informal and varies by PM',
        D: 'There is no defined kickoff process'
      } },
    { id: 'Q7',  section: 'project_kickoff', category: 'people_dependency',
      question: 'If the primary PM became unavailable right after award, what would happen?',
      options: {
        A: 'Another team member could take over with minimal disruption',
        B: 'There would be some delay, but the handoff would be manageable',
        C: 'Important information would need to be reconstructed or re-explained',
        D: 'The project start would stall because too much depends on that person'
      } },
    { id: 'Q8',  section: 'project_kickoff', category: 'failure_mode',
      question: 'When project starts go poorly, what is usually the root cause?',
      options: {
        A: 'Issues are rare because startup gaps are usually caught early',
        B: 'Minor coordination or setup items are occasionally missed',
        C: 'Required information, access, or responsibilities are often incomplete',
        D: 'There is no consistent startup structure, so early confusion is common'
      } },
    { id: 'Q9',  section: 'project_kickoff', category: 'accountability',
      question: 'How clearly is ownership defined during kickoff?',
      options: {
        A: 'Each kickoff step has a clearly assigned owner',
        B: 'Ownership is generally understood, even if not always documented',
        C: 'Ownership is shared across people, which creates some ambiguity',
        D: 'Ownership is often unclear at the start of the job'
      } },
    { id: 'Q10', section: 'project_kickoff', category: 'cost_cash',
      question: 'What is the downstream impact when kickoff is weak or inconsistent?',
      options: {
        A: 'Minimal impact because issues are corrected early',
        B: 'Some inefficiency, but it stays contained',
        C: 'It creates rework, delays, or extra coordination later',
        D: 'It creates significant schedule, labor, or cost impact downstream'
      } },
    // ── Scheduling ──────────────────────────────────────────────────────────
    { id: 'Q11', section: 'scheduling', category: 'process',
      question: 'How is the working project schedule managed day to day?',
      options: {
        A: 'In one centralized system that serves as the current schedule',
        B: 'In a structured format that is updated regularly',
        C: 'Through shared files, messages, or manual coordination',
        D: 'Through multiple versions with no clear source of truth'
      } },
    { id: 'Q12', section: 'scheduling', category: 'visibility',
      question: 'When the schedule changes, how visible is that update to the people affected?',
      options: {
        A: 'The update is visible immediately to everyone who needs it',
        B: 'The update is communicated through a standard process',
        C: 'The update is shared manually and may not reach everyone quickly',
        D: 'Visibility is inconsistent, and people may continue using old information'
      } },
    { id: 'Q13', section: 'scheduling', category: 'failure_mode',
      question: 'How often do people end up working from an outdated schedule?',
      options: {
        A: 'Rarely or never, because outdated versions are controlled',
        B: 'Occasionally, but the issue is caught quickly',
        C: 'It happens often enough to create confusion or rework',
        D: 'It happens regularly and causes recurring coordination problems'
      } },
    { id: 'Q14', section: 'scheduling', category: 'accountability',
      question: 'How clear is ownership of the live project schedule?',
      options: {
        A: 'One person clearly owns the current schedule',
        B: 'Ownership is generally understood, even if not formalized',
        C: 'Multiple people update or manage it, which creates some ambiguity',
        D: 'No one clearly owns the current schedule'
      } },
    { id: 'Q15', section: 'scheduling', category: 'cost_cash',
      question: 'What is the typical impact when teams are misaligned on schedule?',
      options: {
        A: 'Minimal, with little or no downstream effect',
        B: 'Some lost efficiency, but manageable',
        C: 'Rework, lost labor time, or delayed execution',
        D: 'Significant schedule disruption or avoidable cost impact'
      } },
    // ── RFIs & Submittals ───────────────────────────────────────────────────
    { id: 'Q16', section: 'rfis_submittals', category: 'process',
      question: 'How are RFIs and submittals managed from start to close?',
      options: {
        A: 'In one structured workflow with status, ownership, and due dates',
        B: 'In a mostly structured process with some manual gaps',
        C: 'Across multiple tools, emails, or trackers',
        D: 'Without a consistent process or tracking method'
      } },
    { id: 'Q17', section: 'rfis_submittals', category: 'accountability',
      question: 'How clearly is ownership defined for each RFI or submittal?',
      options: {
        A: 'A current owner is clearly assigned at every stage',
        B: 'Ownership is assigned, but not always easy to confirm',
        C: 'Ownership shifts informally based on who is involved',
        D: 'Ownership is often unclear or assumed'
      } },
    { id: 'Q18', section: 'rfis_submittals', category: 'failure_mode',
      question: 'When RFIs or submittals are delayed, where do they usually break down?',
      options: {
        A: 'Delays are rare because issues are surfaced early',
        B: 'Delays happen occasionally at handoffs or approvals',
        C: 'Delays happen regularly because follow-up or visibility is inconsistent',
        D: 'Delays are common and usually discovered after they affect the job'
      } },
    { id: 'Q19', section: 'rfis_submittals', category: 'visibility',
      question: 'How easily can you see the current status of an RFI or submittal?',
      options: {
        A: 'Instantly, in one place with linked documents and status',
        B: 'Mostly visible, with occasional manual checking',
        C: 'Visible, but only after searching across tools or emails',
        D: 'Difficult to determine without asking around'
      } },
    { id: 'Q20', section: 'rfis_submittals', category: 'cost_cash',
      question: 'What is the usual project impact of delayed RFIs or submittals?',
      options: {
        A: 'Minimal, because delays are rare or quickly resolved',
        B: 'Some pressure, but generally manageable',
        C: 'Noticeable schedule or coordination impact',
        D: 'Significant delay, rework, or cost impact on the project'
      } },
    // ── Project Visibility & Risk ───────────────────────────────────────────
    { id: 'Q21', section: 'project_visibility_risk', category: 'visibility',
      question: 'How easily can leadership see current project health across active jobs?',
      options: {
        A: 'Through real-time dashboards with current status and risk visibility',
        B: 'Through regular reports that provide a solid picture',
        C: 'Through updates gathered from meetings, emails, or individual check-ins',
        D: 'Visibility is limited and often based on perception rather than current data'
      } },
    { id: 'Q22', section: 'project_visibility_risk', category: 'process',
      question: 'How are project risks identified before they become bigger issues?',
      options: {
        A: 'Through a defined process with regular tracking and escalation',
        B: 'Through structured reviews or recurring check-ins',
        C: 'As part of normal conversation when something starts to feel off',
        D: 'Mostly after the impact is already visible'
      } },
    { id: 'Q23', section: 'project_visibility_risk', category: 'failure_mode',
      question: 'When project issues surface, how early are they typically identified?',
      options: {
        A: 'Early enough to act before material impact',
        B: 'After a slight delay, but still internally identified',
        C: 'Late, once the issue has started affecting execution',
        D: 'After impact, often through escalation or outside pressure'
      } },
    { id: 'Q24', section: 'project_visibility_risk', category: 'accountability',
      question: 'How clear is ownership for identifying and escalating project risk?',
      options: {
        A: 'Risk ownership is clearly defined and consistently followed',
        B: 'Ownership is generally understood, even if not always formalized',
        C: 'Risk ownership is shared, so escalation can be inconsistent',
        D: 'It is often unclear who is responsible for surfacing risk'
      } },
    { id: 'Q25', section: 'project_visibility_risk', category: 'cost_cash',
      question: 'What is the usual impact of identifying project issues late?',
      options: {
        A: 'Minimal, because most issues are contained quickly',
        B: 'Some extra coordination or delay, but manageable',
        C: 'Noticeable schedule pressure, labor inefficiency, or missed decisions',
        D: 'Significant cost, delay, or margin impact'
      } },
    // ── Field Execution ─────────────────────────────────────────────────────
    { id: 'Q26', section: 'field_execution', category: 'process',
      question: 'How are daily field assignments communicated and confirmed?',
      options: {
        A: 'Through a structured process tied to the current plan or schedule',
        B: 'Through a consistent routine led by field leadership',
        C: 'Through informal conversations, texts, or day-of coordination',
        D: 'Ad hoc, with no consistent process'
      } },
    { id: 'Q27', section: 'field_execution', category: 'people_dependency',
      question: 'How dependent is field execution on specific individuals to keep work moving?',
      options: {
        A: 'Low dependency because direction is documented and repeatable',
        B: 'Some dependency, but others can step in when needed',
        C: 'High dependency on key individuals for coordination and clarity',
        D: 'Critical dependency, where work breaks down without specific people'
      } },
    { id: 'Q28', section: 'field_execution', category: 'failure_mode',
      question: 'When field confusion happens, how often does it affect execution?',
      options: {
        A: 'Rarely, because priorities are usually clear',
        B: 'Occasionally, but it is resolved quickly',
        C: 'Frequently enough to cause lost time or misalignment',
        D: 'Constantly enough to disrupt daily production'
      } },
    { id: 'Q29', section: 'field_execution', category: 'accountability',
      question: 'How clear is ownership for setting and communicating daily field priorities?',
      options: {
        A: 'Clearly assigned to a specific role every day',
        B: 'Generally known, even if not always documented',
        C: 'Shared across people, which can create inconsistency',
        D: 'Often unclear who owns daily direction'
      } },
    { id: 'Q30', section: 'field_execution', category: 'cost_cash',
      question: 'How much labor time is typically lost due to unclear or shifting daily direction?',
      options: {
        A: 'Very little',
        B: 'Some, but not enough to materially affect productivity',
        C: 'Noticeable lost time across crews or throughout the week',
        D: 'Significant lost labor time that regularly affects production'
      } },
    // ── Closeout ────────────────────────────────────────────────────────────
    { id: 'Q31', section: 'closeout', category: 'process',
      question: 'How structured is your closeout process from punch to final completion?',
      options: {
        A: 'Fully structured with clear steps, requirements, and tracking',
        B: 'Mostly structured, with a few manual gaps',
        C: 'Managed manually through coordination and follow-up',
        D: 'Largely reactive, with steps handled as issues arise'
      } },
    { id: 'Q32', section: 'closeout', category: 'accountability',
      question: 'How clearly is ownership defined for closeout deliverables?',
      options: {
        A: 'Each item has a clear owner and due date',
        B: 'Ownership is generally understood, even if not always tracked',
        C: 'Ownership is shared, which creates some ambiguity',
        D: 'Ownership is often unclear until something is overdue'
      } },
    { id: 'Q33', section: 'closeout', category: 'failure_mode',
      question: 'When closeout gets delayed, what is usually true?',
      options: {
        A: 'Delays are uncommon because issues are identified early',
        B: 'A few minor items remain open, but are manageable',
        C: 'Documentation, approvals, or follow-up regularly hold things up',
        D: 'Closeout delays are common and typically discovered late'
      } },
    { id: 'Q34', section: 'closeout', category: 'visibility',
      question: 'How easily can your team see closeout status across active jobs?',
      options: {
        A: 'Fully visible in one place with current progress by item',
        B: 'Mostly visible, with some manual follow-up needed',
        C: 'Limited visibility that requires asking around or checking files',
        D: 'No reliable view of closeout progress across jobs'
      } },
    { id: 'Q35', section: 'closeout', category: 'cost_cash',
      question: 'How predictable is final payment timing once the work is complete?',
      options: {
        A: 'Highly predictable and closely aligned with completion',
        B: 'Slightly delayed, but generally manageable',
        C: 'Regularly delayed due to missing items or loose closeout',
        D: 'Frequently delayed in a way that affects cash flow'
      } }
  ],

  scoring: {
    responseToPoints: { A: 3, B: 2, C: 1, D: 0 },
    priorityOrderForTies: ['visibility','process','failure_mode','cost_cash','accountability','people_dependency']
  },

  content: {
    overview: "This assessment evaluates how your operation performs across seven core execution areas. Each area reflects how work is actually carried out across bidding, project execution, field operations, and closeout.",

    introLogic: [
      {
        id: 'intro_multiple_low_categories',
        condition: (lowCount) => lowCount >= 2,
        text: "You don't have a single broken area. You have a few consistent patterns showing up across multiple parts of the business. This usually points to structural problems, not isolated mistakes."
      },
      {
        id: 'intro_one_low_rest_mid',
        condition: (lowCount, total) => lowCount === 1 && (total - lowCount) >= 5,
        text: "Your operation has a solid foundation. But one category stands out as a clear constraint. That issue is likely creating friction across multiple parts of the business."
      },
      {
        id: 'intro_all_mid_or_high',
        condition: (lowCount) => lowCount === 0,
        text: "Your operation appears sound. The main opportunity isn't rebuilding from scratch—it's tightening the few areas where inconsistency is still creating friction."
      }
    ],

    finalSummaryLogic: [
      {
        condition: (p, s) => p === 'visibility' && s === 'process',
        headline: "You can't see what's happening, and work doesn't move consistently.",
        summary: "Your challenges aren't coming from lack of effort. They're coming from not being able to see what's happening in real time, and not having consistent workflows driving execution. So work gets done—but it's harder than it should be, problems show up later than they should, and you're reacting instead of staying ahead."
      },
      {
        condition: (p, s) => p === 'process' && s === 'failure_mode',
        headline: "Work isn't driven by consistent process, and problems surface too late.",
        summary: "Your challenges aren't coming from lack of effort. They're coming from execution depending on how individuals choose to do it instead of following consistent steps, and problems being discovered after impact instead of before. So issues compound before you see them, and your team is constantly firefighting."
      },
      {
        condition: (p) => p === 'accountability',
        headline: "Ownership is unclear or not visible.",
        summary: "Your challenges aren't coming from lack of effort. They're coming from responsibility being shared or unclear instead of explicitly assigned. So work stalls waiting for someone to own it, follow-ups are necessary, and delays happen because no one is clearly accountable for moving things forward."
      },
      {
        condition: (p) => p === 'cost_cash',
        headline: "Operational friction is quietly costing you money.",
        summary: "Your challenges aren't about broken systems—they're about inefficiencies that compound quietly. Time lost in coordination, rework from misalignment, delays impacting timelines. These don't show up clearly on paper, but they compound across every job and erode margin."
      },
      {
        condition: () => true,
        headline: "Your challenges have a clear structural root.",
        summary: "You don't need more tools. You need a system that actually reflects how your work gets done. The constraints you're seeing aren't isolated problems—they share the same root cause, which is why fixing one thing in isolation won't solve the pattern."
      }
    ],

    categoryNarratives: {
      process: {
        high: { title: "Your workflows are defined and repeatable",                  summary: "Work appears to move through a consistent set of steps across the business.",                                                                      risk: "As volume increases, edge cases can still slip through if processes aren't continuously refined.",                                                 next_steps: ["Tighten exceptions and handoffs","Reduce variation between teams","Document edge cases that still rely on tribal knowledge"] },
        mid:  { title: "Process exists, but it doesn't fully drive execution",       summary: "You have structure, but workflows still vary by person, project, or situation. Work gets done—but in multiple ways.",                             risk: "This creates inconsistency, repeated effort, and a business that works harder than it needs to.",                                                  next_steps: ["Standardize your 2-3 core workflows first","Define how work should move from start to finish","Remove variation between teams"] },
        low:  { title: "Execution relies more on experience than structure",         summary: "Work is largely improvised or dependent on how individuals choose to do it. Processes exist informally, if at all.",                             risk: "This leads to inconsistency, rework, and makes the business harder to scale or control.",                                                          next_steps: ["Define core workflows immediately","Write down how critical work should move","Build structure before scaling further"] }
      },
      accountability: {
        high: { title: "Ownership is generally clear",                              summary: "It's usually obvious who owns each step. That helps work move without constant confusion.",                                                        risk: "Visibility matters as much as clarity. Strong accountability still weakens if people can't see who is responsible.",                              next_steps: ["Make ownership visible in the system","Reduce reliance on verbal hand-offs","Tie accountability to status changes"] },
        mid:  { title: "Ownership is understood, but not enforced",                 summary: "Most people know who is responsible for most things. But some work still depends on follow-up or assumption.",                                   risk: "This creates delays and makes it easier for work to sit unresolved without someone clearly moving it forward.",                                     next_steps: ["Clarify ownership at each stage of work","Remove shared responsibility where possible","Make assignments visible in the system"] },
        low:  { title: "Responsibility is often unclear",                           summary: "Work frequently falls into shared responsibility instead of clear ownership. Multiple people might assume someone else owns it.",                    risk: "When something goes wrong or stalls, no one is clearly accountable for moving it forward.",                                                       next_steps: ["Assign one clear owner to each critical step","Define who owns escalation","Remove ambiguity from hand-offs"] }
      },
      failure_mode: {
        high: { title: "Problems are usually caught early",                         summary: "Issues tend to surface before they become major disruptions. Your operation has visibility into what is breaking.",                              risk: "The remaining opportunity is to surface problems even faster and escalate them more consistently.",                                               next_steps: ["Automate alerts for aging items","Surface risk before meetings expose it","Strengthen early warning indicators"] },
        mid:  { title: "Problems are caught, but often after impact",               summary: "Issues are usually identified internally—but often after they've already created friction or delay.",                                              risk: "Small breakdowns compound into rework, schedule pressure, and extra coordination effort.",                                                          next_steps: ["Add earlier indicators for when work is at risk","Track aging items more visibly","Catch problems before meetings expose them"] },
        low:  { title: "The business operates reactively",                          summary: "Problems are typically discovered after they've already impacted execution. You're reacting, not preventing.",                                     risk: "This leads to rework, delay, and costs that could have been prevented.",                                                                            next_steps: ["Build early warning into your workflows","Surface stalled or at-risk work automatically","Create escalation rules for critical delays"] }
      },
      people_dependency: {
        high: { title: "The operation isn't dependent on specific people",          summary: "Work can continue without major disruption when key people are unavailable. Knowledge isn't trapped in individuals.",                         risk: "Some hidden dependency may exist in edge cases or less-visible workflows.",                                                                       next_steps: ["Keep documenting critical role knowledge","Reduce remaining exceptions tied to key personnel"] },
        mid:  { title: "Certain people hold critical knowledge",                    summary: "The business can function, but specific individuals still carry critical knowledge, decisions, or relationships.",                                risk: "This creates friction when workload increases, people move, or availability changes.",                                                             next_steps: ["Capture how critical decisions get made","Document key workflows tied to people","Reduce single points of failure"] },
        low:  { title: "Operations depend on having the right people in place",     summary: "Too much knowledge and decision-making lives in specific individuals. Work slows or breaks when they're unavailable.",                          risk: "This limits your ability to scale and creates operational fragility that compounds with growth.",                                                  next_steps: ["Document how critical roles make decisions","Build workflows that replace individual judgment","Reduce dependency on key people"] }
      },
      visibility: {
        high: { title: "You have clear access to current information",              summary: "Status is relatively accessible across key workflows. You can see what is happening without asking.",                                           risk: "The opportunity is to improve signal quality and reduce time spent on status checks.",                                                            next_steps: ["Simplify dashboards for faster decisions","Highlight risk more clearly","Eliminate remaining manual status checks"] },
        mid:  { title: "Information exists, but takes effort to access",            summary: "Data is available, but getting a complete picture still requires work—multiple systems, spreadsheets, or follow-up.",                            risk: "This slows decision-making and makes it easier for teams to operate with different assumptions.",                                                   next_steps: ["Centralize status in one place","Reduce reliance on manual updates","Create simple, role-based dashboards"] },
        low:  { title: "You don't have a clear, real-time view",                    summary: "Status is fragmented across tools, emails, spreadsheets, or people's heads. You can't see what's happening without asking.",                    risk: "This creates misalignment, slower decisions, and problems being discovered too late.",                                                            next_steps: ["Build a single source of truth for key workflows","Make status visible without asking","Eliminate fragmented tracking"] }
      },
      cost_cash: {
        high: { title: "Operational inefficiency isn't creating major leakage",     summary: "Your workflows don't create obvious financial drag in day-to-day execution.",                                                                     risk: "There may still be hidden margin erosion in repeated low-grade inefficiencies that compound quietly.",                                            next_steps: ["Track the cost of exceptions and work-arounds","Focus on margin, not just efficiency","Prioritize where time is lost most"] },
        mid:  { title: "There is real financial drag, but it's not quantified",     summary: "Inefficiencies are likely affecting labor hours, schedule delays, or project margins—even if not always visible on paper.",                     risk: "These small recurring losses compound across jobs and quietly erode margins.",                                                                     next_steps: ["Quantify your most expensive inefficiencies","Connect workflow gaps to dollar impact","Fix the areas where money leaks fastest"] },
        low:  { title: "Workflow gaps are costing you real money",                  summary: "Operational friction is affecting time, labor, rework, delays, or cash flow timing in a measurable way.",                                        risk: "This type of leakage compounds quietly and puts consistent pressure on margin.",                                                                   next_steps: ["Identify which workflows are costing you the most","Tie delays and rework to dollar amounts","Fix the few areas where margin is leaking"] }
      }
    },

    sectionNarratives: {
      high: "This area appears relatively well controlled, with defined structure and limited operational drag.",
      mid:  "This area is functioning, but there are clear gaps in consistency, visibility, or control.",
      low:  "This area appears to be a point of operational strain and likely contributes to repeated inefficiency."
    },

    closingCta: "The next step is a focused audit to map your workflows in detail, identify exact breakdown points, and prioritize what to fix first. When these gaps are addressed, work becomes predictable, teams move faster with less effort, problems get caught early, and margins improve—without adding headcount."
  }
};

if (typeof module !== 'undefined') module.exports = AssessmentData;
