import './style.css';
import {
  badNewsPhrases,
  emptyProfessionProfile,
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

const randomItem = (items) => items[Math.floor(Math.random() * items.length)];

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);

const normalize = (value) => value.trim().toLowerCase();

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
      <p class="punch-instruction">Click the robot until morale improves.</p>

      <button class="punch-target" type="button" aria-label="Punch selected robot">
        <img class="punch-robot" src="" alt="" />
        <span class="crack crack-one" aria-hidden="true"></span>
        <span class="crack crack-two" aria-hidden="true"></span>
        <span class="spark spark-one" aria-hidden="true"></span>
        <span class="spark spark-two" aria-hidden="true"></span>
        <span class="spark spark-three" aria-hidden="true"></span>
      </button>

      <div class="punch-stats" aria-live="polite">
        <span class="hit-counter">Worker Rage x0</span>
        <span class="session-score">Automation Delayed: 0s</span>
      </div>
      <p class="damage-label">Damage: pristine corporate equipment</p>
      <p class="robot-line">Awaiting authorized frustration.</p>
      <button class="replay-button" type="button" hidden>Reassemble Robot</button>
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
const punchModal = document.querySelector('.punch-modal');
const punchPanel = document.querySelector('.punch-panel');
const punchTarget = document.querySelector('.punch-target');
const punchRobot = document.querySelector('.punch-robot');
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

const renderPunchState = () => {
  const stage = getDamageStage(robotHits);
  const isDestroyed = stage === 4;

  punchPanel.classList.remove('is-hit');
  punchRobot.className = `punch-robot robot-stage-${stage}${isDestroyed ? ' robot-destroyed' : ''}`;
  hitCounter.textContent = `Worker Rage x${workerRage}`;
  sessionScore.textContent = `Automation Delayed: ${automationDelay}s`;
  damageLabel.textContent = damageLabels[stage];
  replayButton.hidden = !isDestroyed;
  punchTarget.disabled = isDestroyed;
  renderPunchShare(isDestroyed);

  if (isDestroyed) {
    robotLine.textContent = selectedRobot.defeatLine;
  }
};

const openPunchModal = (robot) => {
  selectedRobot = robot;
  robotHits = 0;
  workerRage = 0;
  automationDelay = 0;
  currentResistanceMessage = '';

  punchModal.hidden = false;
  document.body.classList.add('modal-open');
  document.querySelector('#punch-title').textContent = robot.title;
  punchRobot.src = robot.image;
  punchRobot.alt = `${robot.title} awaiting workplace consequences`;
  robotLine.textContent = 'Awaiting authorized frustration.';
  punchCopyFeedback.textContent = '';
  renderPunchState();
  window.setTimeout(() => punchTarget.focus(), 0);
};

const closePunchModal = () => {
  punchModal.hidden = true;
  document.body.classList.remove('modal-open');
  selectedRobot = null;
  robotHits = 0;
  workerRage = 0;
  automationDelay = 0;
  currentResistanceMessage = '';
};

const punchRobotOnce = () => {
  if (!selectedRobot || robotHits >= 10) return;

  robotHits += 1;
  workerRage += 1;
  automationDelay += workerRage;
  if (robotHits >= 10) {
    currentResistanceMessage = getResistanceMessage(automationDelay);
  }
  robotLine.textContent = randomItem(selectedRobot.hitLines);
  renderPunchState();

  punchPanel.classList.add('is-hit');
  punchTarget.classList.remove('impact');
  void punchTarget.offsetWidth;
  punchTarget.classList.add('impact');

  window.setTimeout(() => punchPanel.classList.remove('is-hit'), 260);
};

const reassembleRobot = () => {
  robotHits = 0;
  currentResistanceMessage = '';
  robotLine.textContent = 'Reassembled against worker wishes.';
  punchCopyFeedback.textContent = '';
  renderPunchState();
  punchTarget.focus();
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

jobsGrid.addEventListener('click', (event) => {
  const trigger = event.target.closest('.punch-trigger');
  if (!trigger) return;

  openPunchModal(takenJobs[Number(trigger.dataset.robotIndex)]);
});

punchTarget.addEventListener('click', punchRobotOnce);

replayButton.addEventListener('click', reassembleRobot);

punchModal.addEventListener('click', (event) => {
  const shareButton = event.target.closest('[data-punch-share]');

  if (shareButton) {
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
