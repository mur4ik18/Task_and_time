/**
 * Reports and statistics functionality
 */

let currentReportType = 'daily';
let currentReportDate = new Date();

function initReports() {
    const reportTypeBtns = document.querySelectorAll('.report-type-btn');
    const prevPeriodBtn = document.getElementById('prevPeriod');
    const nextPeriodBtn = document.getElementById('nextPeriod');
    const reportDateInput = document.getElementById('reportDate');
    const reportWeekInput = document.getElementById('reportWeek');
    const reportMonthInput = document.getElementById('reportMonth');

    reportTypeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            reportTypeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            currentReportType = btn.getAttribute('data-type');
            updateDateInputVisibility();
            loadReport();
        });
    });

    prevPeriodBtn.addEventListener('click', () => {
        adjustPeriod(-1);
        loadReport();
    });

    nextPeriodBtn.addEventListener('click', () => {
        adjustPeriod(1);
        loadReport();
    });

    reportDateInput.addEventListener('change', (e) => {
        currentReportDate = new Date(e.target.value);
        loadReport();
    });

    reportWeekInput.addEventListener('change', (e) => {
        const [year, week] = e.target.value.split('-W');
        currentReportDate = getDateOfISOWeek(parseInt(week), parseInt(year));
        loadReport();
    });

    reportMonthInput.addEventListener('change', (e) => {
        const [year, month] = e.target.value.split('-');
        currentReportDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        loadReport();
    });

    // Initialize date inputs
    updateDateInputs();
}

function updateDateInputVisibility() {
    const reportDateInput = document.getElementById('reportDate');
    const reportWeekInput = document.getElementById('reportWeek');
    const reportMonthInput = document.getElementById('reportMonth');

    reportDateInput.style.display = 'none';
    reportWeekInput.style.display = 'none';
    reportMonthInput.style.display = 'none';

    if (currentReportType === 'daily') {
        reportDateInput.style.display = 'block';
    } else if (currentReportType === 'weekly') {
        reportWeekInput.style.display = 'block';
    } else if (currentReportType === 'monthly') {
        reportMonthInput.style.display = 'block';
    }

    updateDateInputs();
}

function updateDateInputs() {
    const reportDateInput = document.getElementById('reportDate');
    const reportWeekInput = document.getElementById('reportWeek');
    const reportMonthInput = document.getElementById('reportMonth');

    const year = currentReportDate.getFullYear();
    const month = String(currentReportDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentReportDate.getDate()).padStart(2, '0');

    reportDateInput.value = `${year}-${month}-${day}`;
    reportMonthInput.value = `${year}-${month}`;
    
    const week = getWeekNumber(currentReportDate);
    reportWeekInput.value = `${year}-W${String(week).padStart(2, '0')}`;
}

function adjustPeriod(delta) {
    if (currentReportType === 'daily') {
        currentReportDate.setDate(currentReportDate.getDate() + delta);
    } else if (currentReportType === 'weekly') {
        currentReportDate.setDate(currentReportDate.getDate() + (delta * 7));
    } else if (currentReportType === 'monthly') {
        currentReportDate.setMonth(currentReportDate.getMonth() + delta);
    }

    updateDateInputs();
}

async function loadReport() {
    try {
        let endpoint = '';
        let dateParam = '';

        const year = currentReportDate.getFullYear();
        const month = String(currentReportDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentReportDate.getDate()).padStart(2, '0');

        if (currentReportType === 'daily') {
            dateParam = `${year}-${month}-${day}`;
            endpoint = `/reports/daily/${dateParam}`;
        } else if (currentReportType === 'weekly') {
            const week = getWeekNumber(currentReportDate);
            dateParam = `${year}-W${String(week).padStart(2, '0')}`;
            endpoint = `/reports/weekly/${dateParam}`;
        } else if (currentReportType === 'monthly') {
            dateParam = `${year}-${month}`;
            endpoint = `/reports/monthly/${dateParam}`;
        }

        const report = await apiRequest(endpoint);
        displayReport(report);
    } catch (error) {
        console.error('Failed to load report:', error);
    }
}

function displayReport(report) {
    // Update stats
    const totalTime = report.total_time || 0;
    const breakTime = report.break_time || 0;
    const totalSessions = report.total_sessions || (report.tasks ? report.tasks.reduce((sum, t) => sum + t.session_count, 0) : 0);

    document.getElementById('totalTime').textContent = formatDuration(totalTime);
    document.getElementById('totalSessions').textContent = totalSessions;
    document.getElementById('breakTime').textContent = formatDuration(breakTime);

    // Display task breakdown
    const taskStatsContainer = document.getElementById('taskStats');
    
    if (!report.tasks || report.tasks.length === 0) {
        taskStatsContainer.innerHTML = '<div class="empty-state"><p>No data for this period</p></div>';
        return;
    }

    // Sort tasks by total time
    const sortedTasks = [...report.tasks].sort((a, b) => b.total_time - a.total_time);

    taskStatsContainer.innerHTML = sortedTasks.map(task => {
        const percentage = totalTime > 0 ? Math.round((task.total_time / totalTime) * 100) : 0;
        
        return `
            <div class="task-stat-item">
                <div class="task-stat-name">${task.task_name}</div>
                <div class="task-stat-info">
                    <span class="task-stat-time">${formatDuration(task.total_time)}</span>
                    <span class="task-stat-sessions">${task.session_count} sessions</span>
                    <span class="task-stat-sessions">${percentage}%</span>
                </div>
            </div>
        `;
    }).join('');
}

// Utility functions
function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function getDateOfISOWeek(week, year) {
    const simple = new Date(year, 0, 1 + (week - 1) * 7);
    const dow = simple.getDay();
    const ISOweekStart = simple;
    if (dow <= 4)
        ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    else
        ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    return ISOweekStart;
}

