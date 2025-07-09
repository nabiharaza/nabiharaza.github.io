const themeToggle = document.querySelector('.theme-toggle');
const body = document.body;
const themes = ['light', 'dark', 'system'];

function setTheme(theme) {
    localStorage.setItem('theme', theme);
    let activeTheme = theme;
    if (theme === 'system') {
        activeTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    body.setAttribute('data-theme', activeTheme);
    updateThemeUI(activeTheme);
}

function updateThemeUI(theme) {
    const isDark = theme === 'dark';
    themeToggle.setAttribute('aria-pressed', isDark);
    themeToggle.setAttribute('data-tooltip', `Switch to ${isDark ? 'Light' : 'Dark'} Theme`);
}

themeToggle.addEventListener('click', () => {
    const currentTheme = localStorage.getItem('theme') || 'system';
    const currentThemeIndex = themes.indexOf(currentTheme);
    const nextThemeIndex = (currentThemeIndex + 1) % themes.length;
    setTheme(themes[nextThemeIndex]);
});

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (localStorage.getItem('theme') === 'system') {
        setTheme('system');
    }
});

function updateLastModified() {
    const cacheKey = 'lastCommitDate';
    const cacheTTL = 60 * 60 * 1000; // 1 hour
    const cached = localStorage.getItem(cacheKey);
    if (cached && Date.now() - JSON.parse(cached).timestamp < cacheTTL) {
        document.getElementById('last-updated').textContent = JSON.parse(cached).formattedDate;
        return;
    }
    const apiUrl = `https://api.github.com/repos/nabiharaza/nabiharaza.github.io/commits?per_page=1`;
    fetch(apiUrl, { headers: { 'Accept': 'application/vnd.github.v3+json' } })
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                const lastCommitDate = new Date(data[0].commit.committer.date);
                const options = {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true,
                    timeZone: 'America/Los_Angeles'
                };
                const formattedDate = lastCommitDate.toLocaleString('en-US', options) + ' PDT';
                localStorage.setItem(cacheKey, JSON.stringify({ formattedDate, timestamp: Date.now() }));
                document.getElementById('last-updated').textContent = formattedDate;
            } else {
                document.getElementById('last-updated').textContent = 'Unable to fetch update time';
            }
        })
        .catch(error => {
            console.error('Error fetching last commit:', error);
            document.getElementById('last-updated').textContent = 'Unable to fetch update time';
        });
}

document.querySelectorAll('.project-link[data-modal]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const modal = document.getElementById('project-modal');
        const title = link.closest('.project-card').querySelector('.project-title').textContent;
        const desc = link.closest('.project-card').querySelector('.project-description').textContent;
        const tech = link.closest('.project-card').querySelector('.project-tech').innerHTML;
        const codeLink = link.closest('.project-card').querySelector('.project-link[href*="github"]')?.href || '#';
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-description').textContent = desc;
        document.getElementById('modal-tech').innerHTML = tech;
        document.getElementById('modal-link').href = codeLink;
        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
        document.querySelector('.modal-close').focus();
    });
});

document.querySelector('.modal-close').addEventListener('click', () => {
    const modal = document.getElementById('project-modal');
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    document.querySelector('.project-link[data-modal]').focus();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('project-modal');
        if (modal.style.display === 'flex') {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
            document.querySelector('.project-link[data-modal]').focus();
        }
    }
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
});

const projectCards = document.querySelectorAll('.project-card');
projectCards.forEach((card, index) => {
    card.style.transitionDelay = `${index * 0.15}s`;
});

const skillItems = document.querySelectorAll('.skill-item');
skillItems.forEach((item, index) => {
    item.style.transitionDelay = `${index * 0.1}s`;
});

window.onload = () => {
    setTheme('dark');
    updateLastModified();
};