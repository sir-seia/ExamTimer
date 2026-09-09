const headContainer = document.getElementById('head');
const scheduleContainer = document.getElementById('schedule');
let clockInterval = null;

const headMarkup = `
    <div>
        <h1>Irvinghall School</h1>
        <h2>1st Quarterly Exam</h2>
        <h3>Day <select name="day" id="daySelect">
            <option value="day1">1</option>
            <option value="day2">2</option>
        </select></h3>
    </div>
    <p id="time" aria-live="polite">
        <span id="hours">00</span>
        <span class="separator">:</span>
        <span id="minutes">00</span>
        <span class="separator">:</span>
        <span id="seconds">00</span>
        <span id="ampm">AM</span>
    </p>
`;

const examDays = {
    day1: [
        { subject: 'Araling Panlipunan', start: '8:00 AM', end: '9:00 AM' },
        { subject: 'Recess', start: '9:00 AM', end: '9:20 AM' },
        { subject: 'English', start: '9:20 AM', end: '10:20 AM' },
        { subject: 'Math', start: '10:20 AM', end: '11:20 AM' }
    ],
    day2: [
        { subject: 'Filipino', start: '8:00 AM', end: '9:00 AM' },
        { subject: 'Science', start: '9:00 AM', end: '10:00 AM' }
    ]
};

function renderSchedule(dayKey = 'day1') {
    const dayEntries = examDays[dayKey] || examDays.day1;

    if (!scheduleContainer) {
        return;
    }

    const rows = dayEntries.map((entry) => `
        <tr class="schedule-row" data-start="${entry.start}" data-end="${entry.end}">
            <td class="subject">
                <span class="subject-name">${entry.subject}</span>
                <span class="countdown"></span>
            </td>
            <td class="time">${entry.start} - ${entry.end}</td>
        </tr>
    `).join('');

    scheduleContainer.innerHTML = `
        <table>
            <tr>
                <th>Subject</th>
                <th>Schedule</th>
            </tr>
            ${rows}
        </table>
    `;

    initializeClock();
}

function bindDaySelector() {
    const daySelect = document.getElementById('daySelect');

    if (!daySelect) {
        return;
    }

    daySelect.addEventListener('change', (event) => {
        renderSchedule(event.target.value);
    });
}

function initializeClock() {
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    const ampmEl = document.getElementById('ampm');
    const scheduleRows = document.querySelectorAll('.schedule-row');

    if (!hoursEl || !minutesEl || !secondsEl || !ampmEl) {
        return;
    }

    if (clockInterval) {
        clearInterval(clockInterval);
    }

    function toSeconds(timeValue) {
        const [time, meridiem] = timeValue.trim().split(' ');
        const [hours, minutes] = time.split(':').map(Number);
        let totalSeconds = (hours * 60 + minutes) * 60;

        if (meridiem === 'PM' && hours !== 12) {
            totalSeconds += 12 * 60 * 60;
        }

        if (meridiem === 'AM' && hours === 12) {
            totalSeconds = minutes * 60;
        }

        return totalSeconds;
    }

    function updateScheduleHighlight() {
        const now = new Date();
        const currentSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

        scheduleRows.forEach((row) => {
            const start = toSeconds(row.dataset.start);
            const end = toSeconds(row.dataset.end);
            const isActive = currentSeconds >= start && currentSeconds < end;
            const isPast = currentSeconds >= end;
            const remainingSeconds = end - currentSeconds;
            const isEndingSoon = isActive && remainingSeconds <= 10 && remainingSeconds >= 0;
            const countdownEl = row.querySelector('.countdown');

            row.classList.remove('active', 'finished', 'warning');

            if (countdownEl) {
                countdownEl.textContent = isEndingSoon ? `  (${remainingSeconds}s)` : '';
            }

            if (isActive && isEndingSoon) {
                row.classList.add('warning');
            } else if (isActive) {
                row.classList.add('active');
            } else if (isPast) {
                row.classList.add('finished');
            }
        });
    }

    function updateClock() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';

        hours = hours % 12 || 12;

        hoursEl.textContent = String(hours).padStart(2, '0');
        minutesEl.textContent = minutes;
        secondsEl.textContent = seconds;
        ampmEl.textContent = ampm;

        updateScheduleHighlight();
    }

    updateClock();
    clockInterval = setInterval(updateClock, 1000);
}

if (headContainer) {
    headContainer.innerHTML = headMarkup;
}

bindDaySelector();
renderSchedule(document.getElementById('daySelect')?.value || 'day1');
