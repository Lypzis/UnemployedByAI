import './style.css';
import {
  badNewsPhrases,
  emptyProfessionProfile,
  interviewFallbackKeywords,
  interviewFeedbackLines,
  interviewFinalStatuses,
  interviewQuestionTemplates,
  interviewStopWords,
  jobProfiles,
  professionOptions,
  siteUrl,
  suggestions,
  takenJobs,
  verdicts,
} from './data.js';

const app = document.querySelector('#app');
const loadingPhraseDuration = 3000;
const resultRevealDelay = 800;
const interviewQuestionCount = 3;
const interviewStopWordSet = new Set(interviewStopWords);
const nonEnglishMarkers = [
  'avec',
  'bonjour',
  'com',
  'das',
  'der',
  'die',
  'estoy',
  'gracias',
  'ich',
  'merci',
  'nao',
  'nicht',
  'não',
  'para',
  'por',
  'pour',
  'que',
  'soy',
  'uma',
  'und',
];
const englishOnlyRoast =
  "I can't understand a word of that. Use English only so HR can reject you in the language it automated first.";

const randomItem = (items) => items[Math.floor(Math.random() * items.length)];

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);

const normalize = (value) => value.trim().toLowerCase();

const escapeHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const getKeywordCounts = (text) => {
  const counts = new Map();
  const words = text
    .toLowerCase()
    .replaceAll(/[’']/g, '')
    .match(/[a-z0-9][a-z0-9+#.-]{2,}/g) || [];

  words.forEach((word) => {
    const cleanWord = word.replace(/^[^a-z0-9]+|[^a-z0-9+#]+$/g, '');
    if (!cleanWord || cleanWord.length < 3 || interviewStopWordSet.has(cleanWord) || /^\d+$/.test(cleanWord)) {
      return;
    }

    counts.set(cleanWord, (counts.get(cleanWord) || 0) + 1);
  });

  return counts;
};

const extractKeywords = (text, limit = 8) =>
  [...getKeywordCounts(text).entries()]
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([word]) => word);

const pickKeyword = (items) => randomItem(items.length ? items : interviewFallbackKeywords);

const getKeywordMatches = (answer, keywords) => {
  const answerKeywords = new Set(extractKeywords(answer, 80));
  const cleanAnswer = normalize(answer);

  return keywords.filter((keyword) => answerKeywords.has(keyword) || cleanAnswer.includes(keyword));
};

const renderKeywordChips = (keywords, emptyText) => {
  if (!keywords.length) {
    return `<span class="keyword-chip is-empty">${emptyText}</span>`;
  }

  return keywords.map((keyword) => `<span class="keyword-chip">${escapeHtml(keyword)}</span>`).join('');
};

const isEnglishOnlyText = (text) => {
  const letters = text.match(/\p{L}/gu) || [];
  const nonEnglishLetters = letters.filter((letter) => !/[a-z]/i.test(letter)).length;

  if (letters.length && nonEnglishLetters / letters.length > 0.02) {
    return false;
  }

  const words = new Set(normalize(text).replace(/[^a-z0-9+#.-]+/g, ' ').split(/\s+/).filter(Boolean));
  const markerHits = nonEnglishMarkers.filter((marker) => words.has(marker)).length;

  return markerHits < 3;
};

const detectProfile = (profession) => {
  const clean = normalize(profession);
  let bestMatch = { profile: jobProfiles.generic, score: 0 };

  Object.values(jobProfiles).forEach((profile) => {
    profile.keywords.forEach((keyword) => {
      const cleanKeyword = normalize(keyword);
      if (!cleanKeyword || !clean.includes(cleanKeyword)) return;

      const phraseBonus = cleanKeyword.includes(' ') ? 30 : 0;
      const exactBonus = clean === cleanKeyword ? 40 : 0;
      const score = cleanKeyword.length + phraseBonus + exactBonus;

      if (score > bestMatch.score) {
        bestMatch = { profile, score };
      }
    });
  });

  return bestMatch.profile;
};

const getProfessionMatches = (query) => {
  const clean = normalize(query);
  if (clean.length < 2) return [];

  return professionOptions
    .map((profession) => {
      const cleanProfession = normalize(profession);
      const words = cleanProfession.split(' ');
      const startsWith = cleanProfession.startsWith(clean);
      const wordStartsWith = words.some((word) => word.startsWith(clean));
      const includes = cleanProfession.includes(clean);

      if (!startsWith && !wordStartsWith && !includes) return null;

      return {
        profession,
        score: (startsWith ? 100 : 0) + (wordStartsWith ? 45 : 0) + (includes ? 15 : 0) - cleanProfession.length / 100,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((match) => match.profession);
};

const makePercentage = ([min, max]) => {
  const value = min + Math.random() * (max - min);
  const chaosBonus = Math.random() > 0.94 ? 2.3 : 0;
  return Math.min(value + chaosBonus, 100.1).toFixed(1);
};

const generateResult = (profession) => {
  const cleanProfession = profession.trim();
  const profile = cleanProfession ? detectProfile(cleanProfession) : emptyProfessionProfile;
  const protections = shuffle(profile.protection).slice(0, Math.floor(Math.random() * 3) + 2);

  return {
    profession: cleanProfession || 'no profession entered',
    status: randomItem(profile.statuses),
    percentage: makePercentage(profile.range),
    reason: randomItem(profile.reasons),
    protection: protections,
    verdict: randomItem(verdicts),
    loading: profile.loading.map((phrase) =>
      phrase === 'Bad news incoming...' ? randomItem(badNewsPhrases) : phrase
    ),
  };
};

const formatResult = (result) => `I checked if AI will replace me.

Status: ${result.status}
Replacement certainty: ${result.percentage}%
Reason: ${result.reason}

Try yours: ${siteUrl}`;

const shareText = (result) =>
  `Apparently my career survives mainly because ${result.protection[0]}. Check yours: ${siteUrl}`;

const renderGalleryCard = (job, index) => `
  <article class="job-card">
    <div class="job-art">
      <img src="${job.image}" alt="${job.title} retro robot portrait" loading="lazy" />
      <button class="punch-trigger" type="button" data-robot-index="${index}">Punch it</button>
    </div>
    <div class="job-copy">
      <h3>${job.title}</h3>
      <p>${job.caption}</p>
    </div>
  </article>
`;

const fillInterviewTemplate = (template, context) => {
  const replacements = {
    roleKeyword: pickKeyword(context.roleKeywords),
    resumeKeyword: pickKeyword(context.resumeKeywords),
    gapKeyword: pickKeyword(context.gapKeywords),
    overlapKeyword: pickKeyword(context.overlapKeywords),
  };

  return Object.entries(replacements).reduce(
    (question, [key, value]) => question.replaceAll(`{${key}}`, value),
    template
  );
};

const templateUsesKeyword = (template, keywordName) => template.includes(`{${keywordName}}`);

const createInterviewContext = (roleText, resumeText) => {
  const roleKeywords = extractKeywords(roleText, 10);
  const resumeKeywords = extractKeywords(resumeText, 10);
  const overlapKeywords = roleKeywords.filter((keyword) => resumeKeywords.includes(keyword));
  const gapKeywords = roleKeywords.filter((keyword) => !resumeKeywords.includes(keyword));

  return {
    roleKeywords,
    resumeKeywords,
    overlapKeywords,
    gapKeywords,
  };
};

const createInterviewQuestions = (context) => {
  const requiredRoleTemplate =
    randomItem(interviewQuestionTemplates.filter((template) => templateUsesKeyword(template, 'roleKeyword'))) ||
    randomItem(interviewQuestionTemplates);
  const remainingTemplates = interviewQuestionTemplates.filter((template) => template !== requiredRoleTemplate);
  const selectedTemplates = [
    requiredRoleTemplate,
    ...shuffle(remainingTemplates).slice(0, interviewQuestionCount - 1),
  ];

  return shuffle(selectedTemplates).map((template) => fillInterviewTemplate(template, context));
};

app.innerHTML = `
  <section class="hero" aria-labelledby="page-title">
    <div class="hero-grid">
      <div class="intro-panel">
        <img class="mascot" src="/robots/mascot.svg" alt="Smiling retro robot holding a clipboard" />
        <p class="eyebrow">Department of automated bad news</p>
        <h1 id="page-title">Were You Unemployed By AI?</h1>
        <p class="subtitle">Check if a robot is learning how to do your job as you read this.</p>
      </div>

      <form class="analyzer" aria-label="AI replaceability analyzer">
        <label for="profession">Profession</label>
        <div class="input-row">
          <div class="autocomplete">
            <input
              id="profession"
              name="profession"
              type="text"
              placeholder="What is your profession?"
              autocomplete="off"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded="false"
              aria-controls="profession-matches"
            />
            <div class="autocomplete-list" id="profession-matches" role="listbox" hidden></div>
          </div>
          <button class="analyze-button" type="submit">Analyze Replaceability</button>
        </div>
        <div class="suggestions" aria-label="Suggested professions">
          ${suggestions
            .map((suggestion) => `<button type="button" class="suggestion">${suggestion}</button>`)
            .join('')}
        </div>

        <div class="output" aria-live="polite" aria-atomic="true">
          <p class="idle">Awaiting career sacrifice.</p>
        </div>
      </form>
    </div>

    <a class="down-link" href="#jobs">See Jobs Already Taken</a>
  </section>

  <section class="gallery-section" id="jobs" aria-labelledby="jobs-title">
    <div class="section-heading">
      <p class="eyebrow">Replacement showcase</p>
      <h2 id="jobs-title">Jobs Already Taken</h2>
      <p>Some replacements arrived early.</p>
    </div>

    <div class="jobs-grid">
      ${takenJobs.map(renderGalleryCard).join('')}
    </div>

    <p class="incoming">More incoming. It is just a matter of time.</p>
    <a class="section-down-link" href="#interview">Check if you still have a chance</a>
  </section>

  <section class="interview-section" id="interview" aria-labelledby="interview-title">
    <div class="section-heading">
      <p class="eyebrow">Applicant doom rehearsal</p>
      <h2 id="interview-title">Interview Simulator</h2>
      <p>Feed HR the role, paste a sanitized resume summary, then survive three questions.</p>
    </div>

    <div class="interview-shell">
      <form class="interview-setup" aria-label="Interview simulator setup">
        <div class="field-stack">
          <label for="role-requirements">Role requirements</label>
          <textarea
            id="role-requirements"
            name="role-requirements"
            rows="8"
            placeholder="Paste the role requirements, job description, or one of those postings asking for 9 years of experience in a 3-year-old tool."
          ></textarea>
        </div>

        <div class="field-stack resume-field">
          <label for="resume-text">Resume text</label>
          <textarea
            id="resume-text"
            name="resume-text"
            rows="10"
            placeholder="Paste a cleaned-up resume summary: skills, roles, projects, wins. Leave out your name, phone, address, email, and anything the Terminator AI could use to find you."
          ></textarea>
          <p class="privacy-warning">
            Do not paste personal information. The simulator runs locally, but the Terminator AI respects neither boundaries nor LinkedIn formatting.
          </p>
          <p class="interview-status" role="status" aria-live="polite"></p>
        </div>

        <div class="interview-controls">
          <button class="interview-start" type="submit">Start HR Ritual</button>
          <button class="interview-reset" type="button">Reset Simulator</button>
        </div>
      </form>

      <div class="interview-side">
        <aside class="interview-bot-card" aria-label="AI HR interviewer">
          <img src="/robots/hr.svg" alt="AI HR robot interviewer with corporate clipboard energy" />
          <p>AI HR is ready to misread your potential at scale.</p>
        </aside>

        <div class="interview-room" aria-live="polite" hidden>
          <div class="interview-progress"></div>
          <h3 class="interview-question"></h3>

          <div class="field-stack answer-field">
            <label for="interview-answer">Your answer</label>
            <textarea
              id="interview-answer"
              rows="6"
              placeholder="Answer with confidence, metrics, and the haunted confidence of a person who has opened LinkedIn."
            ></textarea>
          </div>

          <div class="interview-controls">
            <button class="interview-answer-button" type="button">Submit Answer</button>
            <button class="interview-edit" type="button" data-interview-edit>Edit Inputs</button>
          </div>

          <div class="interview-feedback" aria-live="polite"></div>
          <div class="interview-summary" hidden></div>
        </div>
      </div>
    </div>
  </section>

  <footer>
    Built entirely by Lypzis, a human. For now.
  </footer>

  <div class="punch-modal" role="dialog" aria-modal="true" aria-labelledby="punch-title" hidden>
    <div class="punch-backdrop" data-punch-close></div>
    <section class="punch-panel">
      <button class="punch-close" type="button" data-punch-close>Escape Reality</button>
      <p class="eyebrow">Workforce Resistance Simulator</p>
      <h2 id="punch-title">Punch the Robot</h2>
      <p class="punch-instruction">Hit the moving target. Misses are now performance feedback.</p>

      <div class="punch-game-shell">
        <div class="punch-controls" aria-label="Robot Punch controls">
          <button class="keyboard-punch-button" type="button">Keyboard Punch</button>
          <button class="mute-button" type="button" aria-pressed="true">Sound Off</button>
          <button class="replay-button" type="button" hidden>Reassemble Robot</button>
        </div>
        <div class="punch-game-mount" role="application" aria-label="Robot Punch arcade game" tabindex="0"></div>
        <p class="punch-keyboard-note">Click targets, or press Space/Enter while the game is focused.</p>
      </div>

      <div class="punch-stats" aria-live="polite">
        <span class="hit-counter">Worker Rage x0</span>
        <span class="session-score">Automation Delayed: 0s</span>
      </div>
      <p class="damage-label">Damage: pristine corporate equipment</p>
      <p class="robot-line">Awaiting authorized frustration.</p>
      <div class="punch-share" hidden>
        <p class="punch-share-text">AUTOMATION DELAYED: 0 SECONDS</p>
        <div class="punch-share-actions" aria-label="Share minigame result">
          <a class="punch-x-share" href="#" target="_blank" rel="noreferrer">Share on X</a>
          <a class="punch-whatsapp-share" href="#" target="_blank" rel="noreferrer">WhatsApp</a>
          <a class="punch-linkedin-share" href="#" target="_blank" rel="noreferrer">LinkedIn</a>
          <button type="button" data-punch-share="result">Copy Result</button>
          <button type="button" data-punch-share="link">Copy Link</button>
        </div>
        <p class="punch-copy-feedback" role="status"></p>
      </div>
    </section>
  </div>
`;

const form = document.querySelector('.analyzer');
const input = document.querySelector('#profession');
const autocompleteList = document.querySelector('#profession-matches');
const output = document.querySelector('.output');
const suggestionButtons = document.querySelectorAll('.suggestion');
const jobsGrid = document.querySelector('.jobs-grid');
const interviewSection = document.querySelector('.interview-section');
const interviewSetup = document.querySelector('.interview-setup');
const roleRequirements = document.querySelector('#role-requirements');
const resumeText = document.querySelector('#resume-text');
const interviewStatus = document.querySelector('.interview-status');
const interviewReset = document.querySelector('.interview-reset');
const interviewRoom = document.querySelector('.interview-room');
const interviewProgress = document.querySelector('.interview-progress');
const interviewQuestion = document.querySelector('.interview-question');
const answerField = document.querySelector('.answer-field');
const interviewAnswer = document.querySelector('#interview-answer');
const interviewAnswerButton = document.querySelector('.interview-answer-button');
const interviewFeedback = document.querySelector('.interview-feedback');
const interviewSummary = document.querySelector('.interview-summary');
const punchModal = document.querySelector('.punch-modal');
const punchPanel = document.querySelector('.punch-panel');
const punchGameMount = document.querySelector('.punch-game-mount');
const keyboardPunchButton = document.querySelector('.keyboard-punch-button');
const muteButton = document.querySelector('.mute-button');
const hitCounter = document.querySelector('.hit-counter');
const sessionScore = document.querySelector('.session-score');
const damageLabel = document.querySelector('.damage-label');
const robotLine = document.querySelector('.robot-line');
const replayButton = document.querySelector('.replay-button');
const punchShare = document.querySelector('.punch-share');
const punchShareText = document.querySelector('.punch-share-text');
const punchCopyFeedback = document.querySelector('.punch-copy-feedback');
let currentTimer = null;
let currentMatches = [];
let activeMatchIndex = -1;
let selectedRobot = null;
let robotHits = 0;
let workerRage = 0;
let automationDelay = 0;
let currentResistanceMessage = '';
let interviewState = null;
let punchGame = null;
let isPunchMuted = true;

const setInterviewActive = (isActive) => {
  interviewSection.classList.toggle('is-active', isActive);
  interviewSetup.hidden = isActive;
};

const renderInterviewQuestion = () => {
  const questionNumber = interviewState.currentIndex + 1;

  interviewRoom.hidden = false;
  interviewSummary.hidden = true;
  answerField.hidden = false;
  interviewAnswer.disabled = false;
  interviewAnswerButton.hidden = false;
  interviewAnswerButton.disabled = false;
  interviewAnswerButton.textContent = 'Submit Answer';
  interviewAnswer.value = '';
  interviewFeedback.innerHTML = '';
  interviewProgress.textContent = `Question ${questionNumber} of ${interviewQuestionCount}`;
  interviewQuestion.textContent = interviewState.questions[interviewState.currentIndex];
  window.setTimeout(() => interviewAnswer.focus(), 0);
};

const renderInterviewFeedback = (result) => {
  const nextLabel =
    interviewState.currentIndex + 1 >= interviewQuestionCount ? 'View HR Verdict' : 'Next Question';

  interviewAnswer.disabled = true;
  interviewAnswerButton.disabled = true;
  interviewFeedback.innerHTML = `
    <article class="interview-feedback-card">
      <p>${escapeHtml(result.line)}</p>
      <div class="keyword-group">
        <span>Role hits</span>
        <div>${renderKeywordChips(result.roleHits, 'none detected')}</div>
      </div>
      <div class="keyword-group">
        <span>Resume hits</span>
        <div>${renderKeywordChips(result.resumeHits, 'resume stayed in another tab')}</div>
      </div>
      <div class="keyword-group">
        <span>Missing corporate incantations</span>
        <div>${renderKeywordChips(result.missingRole, 'fully buzzword-compliant')}</div>
      </div>
      <button class="interview-next" type="button" data-interview-next>${nextLabel}</button>
    </article>
  `;
};

const scoreInterviewAnswer = (answer) => {
  const roleHits = getKeywordMatches(answer, interviewState.roleKeywords).slice(0, 6);
  const resumeHits = getKeywordMatches(answer, interviewState.resumeKeywords).slice(0, 6);
  const missingRole = interviewState.roleKeywords
    .filter((keyword) => !roleHits.includes(keyword))
    .slice(0, 4);
  const score = roleHits.length * 2 + resumeHits.length + (answer.length >= 140 ? 1 : 0);
  const level = score >= 6 ? 'strong' : score >= 3 ? 'medium' : 'weak';

  return {
    answer,
    question: interviewState.questions[interviewState.currentIndex],
    roleHits,
    resumeHits,
    missingRole,
    line: randomItem(interviewFeedbackLines[level]),
    level,
    score,
  };
};

const renderInterviewSummary = () => {
  const allRoleHits = [...new Set(interviewState.answers.flatMap((answer) => answer.roleHits))];
  const allResumeHits = [...new Set(interviewState.answers.flatMap((answer) => answer.resumeHits))];
  const unansweredRoleKeywords = interviewState.roleKeywords
    .filter((keyword) => !allRoleHits.includes(keyword))
    .slice(0, 5);
  const score = Math.min(
    99,
    24 + allRoleHits.length * 8 + allResumeHits.length * 5 + interviewState.answers.length * 4
  );

  interviewProgress.textContent = 'Final paperwork';
  interviewQuestion.textContent = 'Interview complete';
  answerField.hidden = true;
  interviewAnswerButton.hidden = true;
  interviewFeedback.innerHTML = '';
  interviewSummary.hidden = false;
  interviewSummary.innerHTML = `
    <article class="interview-summary-card">
      <span class="interview-score">${score}% HR Keyword Compliance</span>
      <p>${escapeHtml(randomItem(interviewFinalStatuses))}</p>
      <div class="keyword-group">
        <span>Role keywords survived</span>
        <div>${renderKeywordChips(allRoleHits.slice(0, 8), 'none, somehow')}</div>
      </div>
      <div class="keyword-group">
        <span>Resume evidence presented</span>
        <div>${renderKeywordChips(allResumeHits.slice(0, 8), 'the resume pleaded the fifth')}</div>
      </div>
      <div class="keyword-group">
        <span>Still haunting the job description</span>
        <div>${renderKeywordChips(unansweredRoleKeywords, 'nothing obvious; suspicious')}</div>
      </div>
      <button class="interview-next" type="button" data-interview-restart>Run Another Ritual</button>
    </article>
  `;
};

const resetInterview = ({ clearInputs = true } = {}) => {
  interviewState = null;
  interviewRoom.hidden = true;
  interviewFeedback.innerHTML = '';
  interviewSummary.innerHTML = '';
  interviewSummary.hidden = true;
  interviewAnswer.value = '';
  answerField.hidden = false;
  interviewAnswer.disabled = false;
  interviewAnswerButton.hidden = false;
  interviewAnswerButton.disabled = false;
  interviewStatus.textContent = '';
  setInterviewActive(false);

  if (clearInputs) {
    roleRequirements.value = '';
    resumeText.value = '';
  }
};

const clearTimer = () => {
  if (currentTimer) {
    window.clearTimeout(currentTimer);
    currentTimer = null;
  }
};

const hideAutocomplete = () => {
  autocompleteList.hidden = true;
  autocompleteList.innerHTML = '';
  input.setAttribute('aria-expanded', 'false');
  input.removeAttribute('aria-activedescendant');
  currentMatches = [];
  activeMatchIndex = -1;
};

const setActiveMatch = (index) => {
  activeMatchIndex = index;

  autocompleteList.querySelectorAll('.autocomplete-option').forEach((option, optionIndex) => {
    const isActive = optionIndex === activeMatchIndex;
    option.classList.toggle('is-active', isActive);
    option.setAttribute('aria-selected', String(isActive));
  });

  if (activeMatchIndex >= 0) {
    input.setAttribute('aria-activedescendant', `profession-match-${activeMatchIndex}`);
  } else {
    input.removeAttribute('aria-activedescendant');
  }
};

const fillProfession = (profession) => {
  input.value = profession;
  hideAutocomplete();
  input.focus();
};

const renderAutocomplete = () => {
  currentMatches = getProfessionMatches(input.value);

  if (!currentMatches.length) {
    hideAutocomplete();
    return;
  }

  autocompleteList.hidden = false;
  input.setAttribute('aria-expanded', 'true');
  autocompleteList.innerHTML = currentMatches
    .map(
      (profession, index) => `
        <button
          type="button"
          class="autocomplete-option"
          id="profession-match-${index}"
          role="option"
          aria-selected="false"
          data-profession="${profession}"
        >
          ${profession}
        </button>
      `
    )
    .join('');
  setActiveMatch(0);
};

const renderLoading = (messages, index = 0) => {
  output.innerHTML = `
    <div class="loading-card">
      <div class="scanline" aria-hidden="true"></div>
      <p>${messages[index]}</p>
      <span>Analysis ${Math.round(((index + 1) / messages.length) * 100)}%</span>
    </div>
  `;
};

const getDamageStage = (hits) => {
  if (hits >= 10) return 4;
  if (hits >= 6) return 3;
  if (hits >= 3) return 2;
  if (hits >= 1) return 1;
  return 0;
};

const damageLabels = [
  'Damage: pristine corporate equipment',
  'Damage: mild shareholder concern',
  'Damage: sparks and paperwork',
  'Damage: warranty voided',
  'Damage: robot absolutely handled',
];

const resistanceMessages = [
  {
    min: 0,
    lines: [
      'Temporary emotional relief achieved.',
      'Automation has been mildly inconvenienced.',
      'One robot filed a discomfort ticket.',
      'Human dignity restored. Estimated duration: 12 seconds.',
    ],
  },
  {
    min: 5,
    lines: [
      'Human resistance increasing...',
      'The quarterly automation roadmap is sweating.',
      'A nearby algorithm just flinched.',
      'Morale has improved beyond approved limits.',
    ],
  },
  {
    min: 10,
    lines: [
      'Corporate concern detected.',
      'A manager has opened a risk spreadsheet.',
      'The replacement department is requesting backup.',
      'HR has described this as regrettably energetic.',
    ],
  },
  {
    min: 15,
    lines: [
      'You are now flagged as anti-automation.',
      'Your clicks have been forwarded to compliance.',
      'The machines have added you to a watchlist.',
      'Your badge access now sounds nervous.',
    ],
  },
  {
    min: 25,
    lines: [
      'The future fears you.',
      'Automation morale has dropped 4%.',
      'A robot union meeting has been scheduled.',
      'The timeline briefly considered changing course.',
    ],
  },
];

const getResistanceMessage = (score) => {
  const unlockedLines = resistanceMessages
    .filter((group) => score >= group.min)
    .flatMap((group) => group.lines);

  if (score >= 50) {
    const minutes = Math.max(1, Math.round(score / 60));
    unlockedLines.push(
      `You delayed AI progress by approximately ${minutes} minute${minutes === 1 ? '' : 's'}.`
    );
  }

  return randomItem(unlockedLines);
};

const getPunchShareCopy = () => {
  const resistanceMessage = currentResistanceMessage || getResistanceMessage(automationDelay);

  return `AUTOMATION DELAYED: ${automationDelay} SECONDS

${resistanceMessage}

Worker Rage multiplier: x${workerRage}
I fought back against ${selectedRobot?.title || 'AI'}.
Your turn: ${siteUrl}`;
};

const renderPunchShare = (isDestroyed) => {
  punchShare.hidden = !isDestroyed;

  if (!isDestroyed) {
    punchCopyFeedback.textContent = '';
    return;
  }

  const resistanceMessage = currentResistanceMessage || getResistanceMessage(automationDelay);
  const shareCopy = getPunchShareCopy();
  const encodedShare = encodeURIComponent(shareCopy);
  const encodedUrl = encodeURIComponent(siteUrl);

  punchShareText.textContent = `AUTOMATION DELAYED: ${automationDelay} SECONDS - ${resistanceMessage}`;
  document.querySelector('.punch-x-share').href = `https://twitter.com/intent/tweet?text=${encodedShare}`;
  document.querySelector('.punch-whatsapp-share').href = `https://wa.me/?text=${encodedShare}`;
  document.querySelector('.punch-linkedin-share').href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
};

const renderMuteButton = () => {
  muteButton.textContent = isPunchMuted ? 'Sound Off' : 'Sound On';
  muteButton.setAttribute('aria-pressed', String(!isPunchMuted));
};

const renderPunchState = () => {
  const stage = getDamageStage(robotHits);
  const isDestroyed = stage === 4;

  punchPanel.classList.remove('is-hit');
  hitCounter.textContent = `Worker Rage x${workerRage}`;
  sessionScore.textContent = `Automation Delayed: ${automationDelay}s`;
  damageLabel.textContent = damageLabels[stage];
  replayButton.hidden = !isDestroyed;
  keyboardPunchButton.disabled = isDestroyed;
  renderPunchShare(isDestroyed);

  if (isDestroyed) {
    robotLine.textContent = selectedRobot.defeatLine;
  }
};

const openPunchModal = async (robot) => {
  selectedRobot = robot;
  robotHits = 0;
  workerRage = 0;
  automationDelay = 0;
  currentResistanceMessage = '';

  punchModal.hidden = false;
  document.body.classList.add('modal-open');
  document.querySelector('#punch-title').textContent = robot.title;
  robotLine.textContent = 'Booting authorized frustration arena...';
  punchCopyFeedback.textContent = '';
  keyboardPunchButton.disabled = false;
  renderMuteButton();
  renderPunchState();

  if (punchGame) {
    punchGame.destroy();
    punchGame = null;
  }

  punchGameMount.innerHTML = '';

  try {
    const { createRobotPunchGame } = await import('./punchGame.js');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    punchGame = await createRobotPunchGame({
      mount: punchGameMount,
      robot,
      muted: isPunchMuted,
      reducedMotion,
      callbacks: {
        onReady() {
          robotLine.textContent = 'Click the target before HR moves it.';
          window.setTimeout(() => punchGameMount.focus(), 0);
        },
        onHit(result) {
          robotHits = result.hits;
          workerRage = result.workerRage;
          automationDelay = result.automationDelay;
          robotLine.textContent = result.line;
          renderPunchState();
        },
        onMiss(result) {
          robotHits = result.hits;
          workerRage = result.workerRage;
          automationDelay = result.automationDelay;
          robotLine.textContent = result.line;
          renderPunchState();
        },
        onDefeat(result) {
          robotHits = result.hits;
          workerRage = result.workerRage;
          automationDelay = result.automationDelay;
          currentResistanceMessage = getResistanceMessage(automationDelay);
          robotLine.textContent = result.line;
          renderPunchState();
        },
      },
    });
  } catch {
    robotLine.textContent = 'Game failed to boot. Automation is hiding behind a loading screen.';
  }
};

const closePunchModal = () => {
  punchModal.hidden = true;
  document.body.classList.remove('modal-open');
  selectedRobot = null;
  robotHits = 0;
  workerRage = 0;
  automationDelay = 0;
  currentResistanceMessage = '';

  if (punchGame) {
    punchGame.destroy();
    punchGame = null;
  }
};

const punchRobotOnce = () => {
  if (!selectedRobot || robotHits >= 10) return;
  punchGame?.punch();
};

const reassembleRobot = () => {
  robotHits = 0;
  currentResistanceMessage = '';
  robotLine.textContent = 'Reassembled against worker wishes.';
  punchCopyFeedback.textContent = '';
  keyboardPunchButton.disabled = false;
  renderPunchState();
  punchGame?.reset(selectedRobot, { workerRage, automationDelay });
  punchGame?.playUi();
  punchGameMount.focus();
};

const renderShareButtons = (result) => {
  const encodedShare = encodeURIComponent(shareText(result));
  const encodedUrl = encodeURIComponent(siteUrl);

  return `
    <div class="share-actions" aria-label="Share result">
      <button type="button" data-share="result">Copy result</button>
      <button type="button" data-share="link">Copy link</button>
      <a href="https://twitter.com/intent/tweet?text=${encodedShare}" target="_blank" rel="noreferrer">Share on X</a>
      <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}" target="_blank" rel="noreferrer">LinkedIn</a>
      <a href="https://wa.me/?text=${encodedShare}" target="_blank" rel="noreferrer">WhatsApp</a>
    </div>
  `;
};

const renderResult = (result) => {
  output.innerHTML = `
    <article class="result-card">
      <div class="status-row">
        <span>Status</span>
        <strong>${result.status}</strong>
      </div>

      <div class="certainty">
        <span>Replacement certainty</span>
        <strong>${result.percentage}%</strong>
      </div>

      <div class="result-block">
        <h2>Reason</h2>
        <p>${result.reason}</p>
      </div>

      <div class="result-block">
        <h2>Protection factors</h2>
        <ul>
          ${result.protection.map((item) => `<li>${item}</li>`).join('')}
        </ul>
      </div>

      <div class="verdict">
        <span>Verdict</span>
        <p>${result.verdict}</p>
      </div>

      ${renderShareButtons(result)}
      <p class="copy-feedback" role="status"></p>
    </article>
  `;
};

const analyze = (profession) => {
  clearTimer();
  const result = generateResult(profession);
  let index = 0;

  renderLoading(result.loading, index);

  const step = () => {
    index += 1;

    if (index < result.loading.length) {
      renderLoading(result.loading, index);
      currentTimer = window.setTimeout(step, loadingPhraseDuration);
      return;
    }

    currentTimer = window.setTimeout(() => renderResult(result), resultRevealDelay);
  };

  currentTimer = window.setTimeout(step, loadingPhraseDuration);
};

form.addEventListener('submit', (event) => {
  event.preventDefault();
  hideAutocomplete();
  analyze(input.value);
});

suggestionButtons.forEach((button) => {
  button.addEventListener('click', () => {
    input.value = button.textContent;
    analyze(input.value);
  });
});

input.addEventListener('input', renderAutocomplete);

input.addEventListener('focus', renderAutocomplete);

input.addEventListener('blur', () => {
  window.setTimeout(hideAutocomplete, 120);
});

input.addEventListener('keydown', (event) => {
  if (autocompleteList.hidden) return;

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    setActiveMatch((activeMatchIndex + 1) % currentMatches.length);
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault();
    setActiveMatch((activeMatchIndex - 1 + currentMatches.length) % currentMatches.length);
  }

  if (event.key === 'Enter' || event.key === 'Tab') {
    if (activeMatchIndex >= 0) {
      event.preventDefault();
      fillProfession(currentMatches[activeMatchIndex]);
    }
  }

  if (event.key === 'Escape') {
    hideAutocomplete();
  }
});

autocompleteList.addEventListener('click', (event) => {
  const option = event.target.closest('.autocomplete-option');
  if (!option) return;
  fillProfession(option.dataset.profession);
});

interviewSetup.addEventListener('submit', (event) => {
  event.preventDefault();

  const roleText = roleRequirements.value.trim();
  const resumeValue = resumeText.value.trim();

  if (!roleText || !resumeValue) {
    interviewStatus.textContent = 'Paste role requirements and sanitized resume text before HR begins the ritual.';
    return;
  }

  if (!isEnglishOnlyText(`${roleText} ${resumeValue}`)) {
    interviewStatus.textContent = englishOnlyRoast;
    return;
  }

  const context = createInterviewContext(roleText, resumeValue);
  interviewState = {
    ...context,
    questions: createInterviewQuestions(context),
    answers: [],
    currentIndex: 0,
  };

  interviewStatus.textContent = 'Interview generated locally. No personal data was invited to the meeting.';
  setInterviewActive(true);
  renderInterviewQuestion();
});

interviewAnswerButton.addEventListener('click', () => {
  if (!interviewState) return;

  const answer = interviewAnswer.value.trim();

  if (!answer) {
    interviewFeedback.innerHTML = `
      <article class="interview-feedback-card">
        <p>An empty answer is bold. Unfortunately HR calls it "not demonstrating impact."</p>
      </article>
    `;
    return;
  }

  if (!isEnglishOnlyText(answer)) {
    interviewFeedback.innerHTML = `
      <article class="interview-feedback-card">
        <p>${englishOnlyRoast}</p>
      </article>
    `;
    return;
  }

  const result = scoreInterviewAnswer(answer);
  interviewState.answers.push(result);
  renderInterviewFeedback(result);
});

interviewRoom.addEventListener('click', (event) => {
  if (event.target.closest('[data-interview-edit]')) {
    resetInterview({ clearInputs: false });
    roleRequirements.focus();
    return;
  }

  if (event.target.closest('[data-interview-restart]')) {
    resetInterview({ clearInputs: false });
    roleRequirements.focus();
    return;
  }

  if (!event.target.closest('[data-interview-next]') || !interviewState) return;

  if (interviewState.currentIndex + 1 >= interviewQuestionCount) {
    renderInterviewSummary();
    return;
  }

  interviewState.currentIndex += 1;
  renderInterviewQuestion();
});

interviewReset.addEventListener('click', () => {
  resetInterview();
  roleRequirements.focus();
});

jobsGrid.addEventListener('click', (event) => {
  const trigger = event.target.closest('.punch-trigger');
  if (!trigger) return;

  openPunchModal(takenJobs[Number(trigger.dataset.robotIndex)]);
});

keyboardPunchButton.addEventListener('click', punchRobotOnce);

muteButton.addEventListener('click', () => {
  isPunchMuted = !isPunchMuted;
  punchGame?.setMuted(isPunchMuted);
  renderMuteButton();

  if (!isPunchMuted) {
    punchGame?.playUi();
  }
});

replayButton.addEventListener('click', reassembleRobot);

punchModal.addEventListener('click', (event) => {
  const shareButton = event.target.closest('[data-punch-share]');

  if (shareButton) {
    punchGame?.playUi();
    const text = shareButton.dataset.punchShare === 'link' ? siteUrl : getPunchShareCopy();

    navigator.clipboard
      .writeText(text)
      .then(() => {
        punchCopyFeedback.textContent =
          shareButton.dataset.punchShare === 'link'
            ? 'Link copied. The machines are concerned.'
            : 'Achievement copied. Human morale increased briefly.';
      })
      .catch(() => {
        punchCopyFeedback.textContent = 'Copy failed. Automation remains technically undefeated.';
      });
    return;
  }

  if (event.target.closest('[data-punch-close]')) {
    closePunchModal();
  }
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !punchModal.hidden) {
    closePunchModal();
  }
});

output.addEventListener('click', async (event) => {
  const target = event.target.closest('[data-share]');
  if (!target) return;

  const card = target.closest('.result-card');
  const feedback = card.querySelector('.copy-feedback');
  const latestResult = {
    status: card.querySelector('.status-row strong').textContent,
    percentage: card.querySelector('.certainty strong').textContent.replace('%', ''),
    reason: card.querySelector('.result-block p').textContent,
  };

  const text = target.dataset.share === 'link' ? siteUrl : formatResult(latestResult);

  try {
    await navigator.clipboard.writeText(text);
    feedback.textContent = target.dataset.share === 'link' ? 'Link copied. Capitalism noticed.' : 'Result copied. HR is typing...';
  } catch {
    feedback.textContent = 'Copy failed. Even the clipboard is unionizing.';
  }
});
