/**
 * AuraTab Feedback Controller
 * Directly connects user feedback to developer email (anuhas.ekanayaka320@gmail.com)
 */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const DEVELOPER_EMAIL = 'anuhas.ekanayaka320@gmail.com';
  const GITHUB_REPO = 'https://github.com/UdithaAnuhas/AuraTab';

  let selectedCategory = 'General';
  let selectedRating = 5;

  // DOM Elements
  const categoryChips = document.querySelectorAll('.category-chip');
  const starBtns = document.querySelectorAll('.star-btn');
  const ratingHint = document.getElementById('rating-hint');
  const starBadge = document.getElementById('star-feedback-badge');
  const categoryHint = document.getElementById('category-hint');
  const subjectInput = document.getElementById('fb-subject');
  const messageInput = document.getElementById('fb-message');
  const charCount = document.getElementById('char-count');
  const nameInput = document.getElementById('fb-name');
  const emailInput = document.getElementById('fb-email');
  const diagCheckbox = document.getElementById('fb-diag-toggle');
  const diagDetails = document.getElementById('diag-details');
  const btnSend = document.getElementById('btn-send');
  const btnGmail = document.getElementById('btn-gmail');
  const btnCopy = document.getElementById('btn-copy');
  const btnGithub = document.getElementById('btn-github');
  const toast = document.getElementById('feedback-toast');

  // Rating labels & badges
  const ratingLabels = {
    1: '1 Star - Needs much work',
    2: '2 Stars - Could be better',
    3: '3 Stars - It\'s okay',
    4: '4 Stars - Great extension!',
    5: '5 Stars - Absolutely love it!'
  };

  const ratingBadges = {
    1: '⚠️ Needs Work',
    2: '🔧 Needs Polish',
    3: '👍 Fair Experience',
    4: '✨ Great Experience!',
    5: '⭐ Top Rated!'
  };

  const categoryDetails = {
    'General': {
      hint: 'General feedback or impression',
      placeholder: 'Tell us what\'s working well, what\'s missing, or describe any thoughts...',
      subjectPrefix: 'General Feedback'
    },
    'Feature Idea': {
      hint: 'Suggest a new widget or feature',
      placeholder: 'What exciting feature would you like to see in AuraTab? Describe how it would work and why it would be helpful...',
      subjectPrefix: 'Feature Request'
    },
    'Bug Report': {
      hint: 'Report an issue or unexpected behavior',
      placeholder: 'What happened? Please describe the steps to reproduce the issue, what you expected to happen, and what actually occurred...',
      subjectPrefix: 'Bug Report'
    },
    'Improvement': {
      hint: 'Speed, responsiveness & visual polish',
      placeholder: 'Where did you notice slowness or lag? (e.g. startup, widgets, animations, high memory usage)...',
      subjectPrefix: 'Performance & Polish'
    }
  };

  // Character counter
  if (messageInput && charCount) {
    messageInput.addEventListener('input', () => {
      const len = messageInput.value.length;
      charCount.textContent = `${len} character${len === 1 ? '' : 's'}`;
    });
  }

  // Detect basic browser and platform info
  function getSystemInfo() {
    const ua = navigator.userAgent;
    let browser = 'Unknown Browser';
    if (ua.includes('Edg/')) browser = 'Microsoft Edge';
    else if (ua.includes('Chrome/')) browser = 'Google Chrome';
    else if (ua.includes('Firefox/')) browser = 'Mozilla Firefox';
    else if (ua.includes('Safari/')) browser = 'Apple Safari';

    let os = 'Unknown OS';
    if (ua.includes('Win')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

    return {
      version: 'v1.0.0',
      browser: `${browser} (${navigator.userAgentData ? navigator.userAgentData.platform : os})`,
      os: os,
      screen: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language || 'en'
    };
  }

  const sysInfo = getSystemInfo();
  if (diagDetails) {
    diagDetails.textContent = `AuraTab ${sysInfo.version} | ${sysInfo.browser} | ${sysInfo.screen}`;
  }

  // Category chip selection
  categoryChips.forEach(chip => {
    chip.addEventListener('click', () => {
      categoryChips.forEach(c => {
        c.classList.remove('active');
        c.setAttribute('aria-checked', 'false');
      });
      chip.classList.add('active');
      chip.setAttribute('aria-checked', 'true');
      selectedCategory = chip.dataset.category || 'General';

      const details = categoryDetails[selectedCategory] || categoryDetails['General'];
      if (categoryHint) {
        categoryHint.textContent = details.hint;
      }
      if (messageInput && (!messageInput.value.trim() || messageInput.dataset.touched !== 'true')) {
        messageInput.placeholder = details.placeholder;
      }

      // Update placeholder or default subject if empty
      if (!subjectInput.value.trim() || subjectInput.dataset.autoFilled === 'true') {
        subjectInput.placeholder = `e.g. [${selectedCategory}] Summary of your thoughts`;
      }
    });
  });

  if (messageInput) {
    messageInput.addEventListener('input', () => {
      messageInput.dataset.touched = 'true';
    });
  }

  // Star Rating Interaction
  function updateStars(val) {
    starBtns.forEach(btn => {
      const starVal = parseInt(btn.dataset.star, 10);
      btn.classList.toggle('active', starVal <= val);
    });
    if (ratingHint) {
      ratingHint.textContent = ratingLabels[val] || '';
    }
    if (starBadge) {
      starBadge.textContent = ratingBadges[val] || 'Rating';
    }
  }

  starBtns.forEach(btn => {
    const starVal = parseInt(btn.dataset.star, 10);
    btn.addEventListener('mouseenter', () => {
      starBtns.forEach(b => {
        const v = parseInt(b.dataset.star, 10);
        b.classList.toggle('hover', v <= starVal);
      });
    });

    btn.addEventListener('mouseleave', () => {
      starBtns.forEach(b => b.classList.remove('hover'));
    });

    btn.addEventListener('click', () => {
      selectedRating = starVal;
      updateStars(selectedRating);
    });
  });

  // Initialize with 5 stars
  updateStars(selectedRating);

  // Generate beautifully formatted payload
  function buildPayload() {
    const rawName = nameInput.value.trim();
    const rawEmail = emailInput.value.trim();
    const rawSubject = subjectInput.value.trim();
    const message = messageInput.value.trim();

    // Clean, readable Subject line
    const displaySubject = rawSubject
      ? `[AuraTab] ${selectedCategory}: ${rawSubject}`
      : `[AuraTab] ${selectedCategory} Feedback (${selectedRating}★)`;

    const starsDisplay = '★'.repeat(selectedRating) + '☆'.repeat(5 - selectedRating);

    // Formatted sender details
    let senderStr = 'Anonymous User';
    if (rawName && rawEmail) {
      senderStr = `${rawName} (${rawEmail})`;
    } else if (rawName) {
      senderStr = rawName;
    } else if (rawEmail) {
      senderStr = rawEmail;
    }

    // Friendly date & time
    const now = new Date();
    const dateFormatted = now.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    const timeFormatted = now.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });

    let body = `Hi Uditha,\n\n` +
      `Here is my feedback for AuraTab:\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `💬 FEEDBACK SUMMARY\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `• Topic    : ${selectedCategory}\n` +
      `• Rating   : ${starsDisplay} (${selectedRating} / 5)\n` +
      `• Sender   : ${senderStr}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📝 MESSAGE\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `${message || '(No message content provided)'}\n\n`;

    if (diagCheckbox && diagCheckbox.checked) {
      body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `💻 SYSTEM & ENVIRONMENT\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `• App      : AuraTab ${sysInfo.version}\n` +
        `• OS       : ${sysInfo.os}\n` +
        `• Browser  : ${sysInfo.browser}\n` +
        `• Screen   : ${sysInfo.screen}\n` +
        `• Date     : ${dateFormatted} at ${timeFormatted}\n\n`;
    }

    body += `──────────────────────────────────\n` +
      `Sent via AuraTab Dashboard\n` +
      `https://github.com/UdithaAnuhas/AuraTab\n`;

    return { subject: displaySubject, body, message };
  }

  // Modal Elements
  const emailModal = document.getElementById('email-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const provGmail = document.getElementById('prov-gmail');
  const provOutlook = document.getElementById('prov-outlook');
  const provDefault = document.getElementById('prov-default');
  const provCopy = document.getElementById('prov-copy');
  const modalStatusText = document.getElementById('modal-status-text');

  function openEmailModal() {
    if (!emailModal) return;
    emailModal.style.display = 'flex';
    if (modalStatusText) {
      modalStatusText.textContent = 'Select your preferred email service to send immediately.';
    }
  }

  function closeEmailModal() {
    if (!emailModal) return;
    emailModal.style.display = 'none';
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeEmailModal);
  }

  if (emailModal) {
    emailModal.addEventListener('click', (e) => {
      if (e.target === emailModal) closeEmailModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && emailModal.style.display === 'flex') {
        closeEmailModal();
      }
    });
  }

  function validate() {
    const message = messageInput ? messageInput.value.trim() : '';
    if (!message) {
      if (messageInput) {
        messageInput.classList.add('has-error');
        messageInput.focus();
        messageInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      showToast('⚠️ Please write a brief message before sending.');
      return false;
    }
    return true;
  }

  if (messageInput) {
    messageInput.addEventListener('input', () => {
      messageInput.classList.remove('has-error');
    });
  }

  function showToast(text) {
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
  }

  function sendViaGmail() {
    const { subject, body } = buildPayload();
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(DEVELOPER_EMAIL)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(gmailUrl, '_blank');
    showToast('✉️ Opening Gmail web composer in a new tab...');
    closeEmailModal();
  }

  function sendViaOutlook() {
    const { subject, body } = buildPayload();
    const outlookUrl = `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(DEVELOPER_EMAIL)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(outlookUrl, '_blank');
    showToast('📬 Opening Outlook.com in a new tab...');
    closeEmailModal();
  }

  function sendViaDefaultMail() {
    const { subject, body } = buildPayload();
    // Safety check for mailto URL length on desktop clients
    let mailBody = body;
    if (mailBody.length > 1500) {
      mailBody = mailBody.slice(0, 1400) + '\n\n[...System info truncated for mail client compatibility]';
    }
    const mailtoUrl = `mailto:${DEVELOPER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(mailBody)}`;
    
    // Use an anchor click to safely dispatch protocol handler
    const tempA = document.createElement('a');
    tempA.href = mailtoUrl;
    tempA.target = '_blank';
    tempA.rel = 'noopener noreferrer';
    document.body.appendChild(tempA);
    tempA.click();
    setTimeout(() => tempA.remove(), 250);

    if (modalStatusText) {
      modalStatusText.innerHTML = '🚀 Opening default mail client... If nothing opened, click <strong style="color:#38bdf8;">Gmail (Web)</strong> above!';
    }
    showToast('🚀 Opening your default mail client...');
  }

  async function copyFeedbackText() {
    const { subject, body } = buildPayload();
    const fullText = `To: ${DEVELOPER_EMAIL}\nSubject: ${subject}\n\n${body}`;

    try {
      await navigator.clipboard.writeText(fullText);
      showToast('📋 Feedback copied! You can paste it into any email.');
      if (modalStatusText) {
        modalStatusText.textContent = '📋 Copied to clipboard! Ready to paste into any email composer.';
      }
    } catch (err) {
      showToast('❌ Could not copy automatically. Please copy manually.');
    }
  }

  // 1. Primary "Send via Email" button: opens selector modal
  btnSend.addEventListener('click', (e) => {
    e.preventDefault();
    if (!validate()) return;
    openEmailModal();
  });

  // 2. Direct "Open in Gmail" button on page
  btnGmail.addEventListener('click', (e) => {
    e.preventDefault();
    if (!validate()) return;
    sendViaGmail();
  });

  // Modal provider buttons
  if (provGmail) {
    provGmail.addEventListener('click', (e) => {
      e.preventDefault();
      sendViaGmail();
    });
  }

  if (provOutlook) {
    provOutlook.addEventListener('click', (e) => {
      e.preventDefault();
      sendViaOutlook();
    });
  }

  if (provDefault) {
    provDefault.addEventListener('click', (e) => {
      e.preventDefault();
      sendViaDefaultMail();
    });
  }

  if (provCopy) {
    provCopy.addEventListener('click', async (e) => {
      e.preventDefault();
      await copyFeedbackText();
    });
  }

  // 3. Form "Copy Text" button
  btnCopy.addEventListener('click', async (e) => {
    e.preventDefault();
    await copyFeedbackText();
  });

  // 4. Open GitHub Issues
  btnGithub.addEventListener('click', (e) => {
    e.preventDefault();
    const { message } = buildPayload();
    const issueTitle = `[${selectedCategory}] ${subjectInput.value.trim() || 'Feedback'}`;
    const issueBody = `${message}\n\n---\n**Rating**: ${selectedRating}/5\n**Version**: ${sysInfo.version}\n**Environment**: ${sysInfo.os} / ${sysInfo.browser}`;
    const url = `${GITHUB_REPO}/issues/new?title=${encodeURIComponent(issueTitle)}&body=${encodeURIComponent(issueBody)}`;
    window.open(url, '_blank');
  });
});
