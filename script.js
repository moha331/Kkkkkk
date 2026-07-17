async function checkLogin() {
    const res = await fetch('/api/me');
    const data = await res.json();

    const navLogin = document.getElementById('navLogin');
    const navLogout = document.getElementById('navLogout');
    const heroBtn = document.getElementById('heroBtn');
    const dashboard = document.getElementById('dashboard');

    if (!data.loggedIn) {
        navLogin.style.display = 'inline-block';
        navLogin.href = '/auth/discord';
        heroBtn.href = '/auth/discord';
        heroBtn.textContent = 'تسجيل الدخول بحساب Discord';
        return;
    }

    navLogout.style.display = 'inline-block';
    heroBtn.href = '#dashboard';
    heroBtn.textContent = `مرحباً ${data.user.username}`;
    dashboard.style.display = 'block';

    loadDashboard();
}

async function loadDashboard() {
    const res = await fetch('/api/dashboard');
    if (!res.ok) {
        document.getElementById('noAccess').style.display = 'block';
        return;
    }

    const data = await res.json();

    if (!data.isParamedic && !data.isHigh) {
        document.getElementById('noAccess').style.display = 'block';
        return;
    }

    document.getElementById('dashboardContent').style.display = 'block';

    const leaderboardBody = document.getElementById('leaderboardBody');
    leaderboardBody.innerHTML = data.leaderboard.length
        ? data.leaderboard.map((entry, i) => `
            <tr>
                <td>${i + 1}</td>
                <td>${entry.name}</td>
                <td>${entry.rank}</td>
                <td>${entry.sector}</td>
                <td>${entry.wings}</td>
                <td>${entry.points}</td>
            </tr>
        `).join('')
        : `<tr><td colspan="6">ما فيه أعضاء مسجلين حالياً</td></tr>`;

    const sectorsGrid = document.getElementById('sectorsGrid');
    sectorsGrid.innerHTML = data.sectors.length
        ? data.sectors.map(s => `<div class="info-card">${typeof s === 'object' ? (s.name || JSON.stringify(s)) : s}</div>`).join('')
        : `<p>ما فيه قطاعات مضافة بعد</p>`;

    const wingsGrid = document.getElementById('wingsGrid');
    wingsGrid.innerHTML = data.wings.length
        ? data.wings.map(w => `<div class="info-card">${typeof w === 'object' ? (w.name || JSON.stringify(w)) : w}</div>`).join('')
        : `<p>ما فيه أجنحة مضافة بعد</p>`;
}

checkLogin();
