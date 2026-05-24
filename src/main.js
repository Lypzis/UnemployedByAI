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

const renderGalleryCard = (job) => `
  <article class="job-card">
    <img src="${job.image}" alt="${job.title} retro robot portrait" loading="lazy" />
    <div>
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
`;

const form = document.querySelector('.analyzer');
const input = document.querySelector('#profession');
const autocompleteList = document.querySelector('#profession-matches');
const output = document.querySelector('.output');
const suggestionButtons = document.querySelectorAll('.suggestion');
let currentTimer = null;
let currentMatches = [];
let activeMatchIndex = -1;

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
