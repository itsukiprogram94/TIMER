const modeButtons = document.querySelectorAll('.mode-button');
const panels = document.querySelectorAll('.panel');
const appIcon = document.querySelector('.app-icon');

// Countdown elements
const countdownMinutesInput = document.querySelector('#countdown-minutes');
const countdownSecondsInput = document.querySelector('#countdown-seconds');
const countdownDisplay = document.querySelector('#countdown-display');
const countdownStartBtn = document.querySelector('#countdown-start');
const countdownPauseBtn = document.querySelector('#countdown-pause');
const countdownResetBtn = document.querySelector('#countdown-reset');
const countdownStatus = document.querySelector('#countdown-status');

// Stopwatch elements
const stopwatchDisplay = document.querySelector('#stopwatch-display');
const stopwatchStartBtn = document.querySelector('#stopwatch-start');
const stopwatchPauseBtn = document.querySelector('#stopwatch-pause');
const stopwatchResetBtn = document.querySelector('#stopwatch-reset');
const stopwatchStatus = document.querySelector('#stopwatch-status');

const countdownState = {
  totalSeconds: 0,
  remainingSeconds: 0,
  timerId: null,
  isPaused: false,
};

const stopwatchState = {
  startTimestamp: 0,
  elapsedMs: 0,
  timerId: null,
  isRunning: false,
  isPaused: false,
};

const formatCountdownTime = (secs) => {
  const mins = Math.floor(secs / 60);
  const seconds = secs % 60;
  return `${String(mins).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const formatStopwatchTime = (ms) => {
  const totalCentiseconds = Math.floor(ms / 10);
  const minutes = Math.floor(totalCentiseconds / 6000);
  const seconds = Math.floor((totalCentiseconds % 6000) / 100);
  const centiseconds = totalCentiseconds % 100;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`;
};

const updateCountdownDisplay = () => {
  countdownDisplay.textContent = formatCountdownTime(countdownState.remainingSeconds);
};

const updateStopwatchDisplay = () => {
  stopwatchDisplay.textContent = formatStopwatchTime(stopwatchState.elapsedMs);
};

const setCountdownInputsDisabled = (disabled) => {
  countdownMinutesInput.disabled = disabled;
  countdownSecondsInput.disabled = disabled;
};

const clearCountdownHighlight = () => {
  countdownDisplay.classList.remove('completed');
  countdownStatus.classList.remove('highlight');
};

const sanitizeCountdownInputs = () => {
  const minutes = Math.max(0, parseInt(countdownMinutesInput.value, 10) || 0);
  const seconds = Math.max(0, Math.min(59, parseInt(countdownSecondsInput.value, 10) || 0));
  countdownMinutesInput.value = minutes;
  countdownSecondsInput.value = seconds;
  const total = minutes * 60 + seconds;
  countdownState.totalSeconds = total;
  return total;
};

const resetCountdown = ({ silent = false } = {}) => {
  clearInterval(countdownState.timerId);
  countdownState.timerId = null;
  countdownState.isPaused = false;
  sanitizeCountdownInputs();
  countdownState.remainingSeconds = countdownState.totalSeconds;
  updateCountdownDisplay();
  setCountdownInputsDisabled(false);
  clearCountdownHighlight();

  countdownStartBtn.disabled = false;
  countdownPauseBtn.disabled = true;
  countdownPauseBtn.textContent = '一時停止';
  countdownPauseBtn.classList.remove('active');
  countdownResetBtn.disabled = true;

  countdownStatus.textContent = silent ? '' : '設定時間にリセットしました。';
};

const finishCountdown = () => {
  clearInterval(countdownState.timerId);
  countdownState.timerId = null;
  countdownState.isPaused = false;
  countdownState.remainingSeconds = 0;
  updateCountdownDisplay();
  setCountdownInputsDisabled(false);

  countdownStartBtn.disabled = false;
  countdownPauseBtn.disabled = true;
  countdownPauseBtn.textContent = '一時停止';
  countdownPauseBtn.classList.remove('active');
  countdownResetBtn.disabled = true;

  countdownDisplay.classList.add('completed');
  countdownStatus.classList.add('highlight');
  countdownStatus.textContent = 'カウントダウンが完了しました！';
};

const tickCountdown = () => {
  countdownState.remainingSeconds -= 1;
  updateCountdownDisplay();

  if (countdownState.remainingSeconds <= 0) {
    finishCountdown();
  }
};

const startCountdown = () => {
  const total = sanitizeCountdownInputs();

  if (total <= 0) {
    countdownStatus.textContent = '1秒以上の時間を入力してください。';
    return;
  }

  countdownState.remainingSeconds = countdownState.totalSeconds;
  updateCountdownDisplay();
  clearCountdownHighlight();
  countdownStatus.textContent = 'カウントダウンを実行中です。';
  setCountdownInputsDisabled(true);

  countdownStartBtn.disabled = true;
  countdownPauseBtn.disabled = false;
  countdownResetBtn.disabled = false;

  countdownState.timerId = setInterval(tickCountdown, 1000);
};

const toggleCountdownPause = () => {
  if (!countdownState.timerId && !countdownState.isPaused) return;

  if (countdownState.isPaused) {
    countdownState.timerId = setInterval(tickCountdown, 1000);
    countdownState.isPaused = false;
    clearCountdownHighlight();
    countdownStatus.textContent = 'カウントダウンを再開しました。';
    countdownPauseBtn.textContent = '一時停止';
    countdownPauseBtn.classList.remove('active');
    return;
  }

  clearInterval(countdownState.timerId);
  countdownState.timerId = null;
  countdownState.isPaused = true;
  countdownStatus.textContent = '一時停止中です。';
  countdownPauseBtn.textContent = '再開';
  countdownPauseBtn.classList.add('active');
};

const resetStopwatch = ({ silent = false } = {}) => {
  clearInterval(stopwatchState.timerId);
  stopwatchState.timerId = null;
  stopwatchState.isRunning = false;
  stopwatchState.isPaused = false;
  stopwatchState.startTimestamp = 0;
  stopwatchState.elapsedMs = 0;
  updateStopwatchDisplay();

  stopwatchStartBtn.disabled = false;
  stopwatchPauseBtn.disabled = true;
  stopwatchPauseBtn.textContent = '一時停止';
  stopwatchPauseBtn.classList.remove('active');
  stopwatchResetBtn.disabled = true;

  stopwatchStatus.textContent = silent ? '' : '計測値をリセットしました。';
};

const updateStopwatch = () => {
  stopwatchState.elapsedMs = Date.now() - stopwatchState.startTimestamp;
  updateStopwatchDisplay();
};

const startStopwatch = () => {
  if (stopwatchState.isRunning) return;

  stopwatchState.startTimestamp = Date.now() - stopwatchState.elapsedMs;
  stopwatchState.timerId = setInterval(updateStopwatch, 10);
  stopwatchState.isRunning = true;
  stopwatchState.isPaused = false;
  stopwatchStatus.textContent = 'ストップウォッチを実行中です。';

  stopwatchStartBtn.disabled = true;
  stopwatchPauseBtn.disabled = false;
  stopwatchResetBtn.disabled = false;
};

const toggleStopwatchPause = () => {
  if (!stopwatchState.isRunning && !stopwatchState.isPaused) return;

  if (stopwatchState.isPaused) {
    stopwatchState.startTimestamp = Date.now() - stopwatchState.elapsedMs;
    stopwatchState.timerId = setInterval(updateStopwatch, 10);
    stopwatchState.isRunning = true;
    stopwatchState.isPaused = false;
    stopwatchStatus.textContent = 'ストップウォッチを再開しました。';
    stopwatchPauseBtn.textContent = '一時停止';
    stopwatchPauseBtn.classList.remove('active');
    return;
  }

  clearInterval(stopwatchState.timerId);
  stopwatchState.timerId = null;
  stopwatchState.isRunning = false;
  stopwatchState.isPaused = true;
  stopwatchState.elapsedMs = Date.now() - stopwatchState.startTimestamp;
  updateStopwatchDisplay();
  stopwatchStatus.textContent = '一時停止中です。';
  stopwatchPauseBtn.textContent = '再開';
  stopwatchPauseBtn.classList.add('active');
};

const setMode = (selectedMode) => {
  modeButtons.forEach((btn) => {
    const isActive = btn.dataset.mode === selectedMode;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', String(isActive));
  });

  panels.forEach((panel) => {
    const isActive = panel.dataset.panel === selectedMode;
    panel.classList.toggle('hidden', !isActive);
    panel.setAttribute('aria-hidden', String(!isActive));
  });

  if (selectedMode === 'countdown') {
    resetStopwatch({ silent: true });
  } else {
    resetCountdown({ silent: true });
  }
};

modeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    if (button.classList.contains('active')) return;

    setMode(button.dataset.mode);
  });
});

countdownStartBtn.addEventListener('click', startCountdown);
countdownPauseBtn.addEventListener('click', toggleCountdownPause);
countdownResetBtn.addEventListener('click', () => resetCountdown());
countdownMinutesInput.addEventListener('change', () => {
  sanitizeCountdownInputs();
  countdownState.remainingSeconds = countdownState.totalSeconds;
  updateCountdownDisplay();
  clearCountdownHighlight();
});
countdownSecondsInput.addEventListener('change', () => {
  sanitizeCountdownInputs();
  countdownState.remainingSeconds = countdownState.totalSeconds;
  updateCountdownDisplay();
  clearCountdownHighlight();
});

stopwatchStartBtn.addEventListener('click', startStopwatch);
stopwatchPauseBtn.addEventListener('click', toggleStopwatchPause);
stopwatchResetBtn.addEventListener('click', () => resetStopwatch());

if (appIcon) {
  appIcon.addEventListener('click', () => {
    setMode('countdown');
    countdownMinutesInput.value = '0';
    countdownSecondsInput.value = '0';
    resetCountdown({ silent: true });
    resetStopwatch({ silent: true });
    countdownStatus.textContent = '';
    stopwatchStatus.textContent = '';
  });
}

// 初期化
resetCountdown({ silent: true });
resetStopwatch({ silent: true });
panels.forEach((panel) => panel.setAttribute('aria-hidden', panel.dataset.panel !== 'countdown'));
