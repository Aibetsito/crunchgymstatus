document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const statusText = document.getElementById('current-status');
    const timeRemainingText = document.getElementById('time-remaining');
    const todayHoursText = document.getElementById('today-hours');
    const statusHero = document.getElementById('status-hero');

    // Business Hours Definition
    const hoursConfig = {
        0: { name: 'Sunday', display: '7:00 AM - 7:00 PM', start: 7, end: 19 },
        1: { name: 'Monday', display: '5:00 AM - 12:00 AM', start: 5, end: 24 },
        2: { name: 'Tuesday', display: '24 Hours', start: 0, end: 24 },
        3: { name: 'Wednesday', display: '24 Hours', start: 0, end: 24 },
        4: { name: 'Thursday', display: '24 Hours', start: 0, end: 24 },
        5: { name: 'Friday', display: '24 Hours', start: 0, end: 24 },
        6: { name: 'Saturday', display: '12:00 AM - 7:00 PM', start: 0, end: 19 }
    };

    function getNextOpenTime(now) {
        let checkDay = now.getDay();

        let todayConfig = hoursConfig[checkDay];
        const currentTimeFloat = now.getHours() + (now.getMinutes() / 60) + (now.getSeconds() / 3600);

        if (currentTimeFloat < todayConfig.start) {
            let nextDate = new Date(now);
            nextDate.setHours(Math.floor(todayConfig.start), (todayConfig.start % 1) * 60, 0, 0);
            return nextDate;
        }

        for (let i = 1; i <= 7; i++) {
            let nextDay = (checkDay + i) % 7;
            let config = hoursConfig[nextDay];

            if (config.start !== config.end || (config.start === 0 && config.end === 24)) {
                let nextDate = new Date(now);
                nextDate.setDate(now.getDate() + i);
                nextDate.setHours(Math.floor(config.start), (config.start % 1) * 60, 0, 0);
                return nextDate;
            }
        }
        return null;
    }

    function formatTimeRemaining(ms) {
        if (ms <= 0) return "Right now";
        const totalMinutes = Math.floor(ms / (1000 * 60));
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    }

    function updateLogic() {
        const now = new Date();
        const day = now.getDay();
        const hour = now.getHours();
        const minute = now.getMinutes();
        const second = now.getSeconds();

        const currentTimeFloat = hour + (minute / 60) + (second / 3600);
        const todayConfig = hoursConfig[day];

        let isOpen = false;
        let msRemaining = 0;
        let timeRemainingStr = "";

        if (todayConfig.start === 0 && todayConfig.end === 24) {
            isOpen = true;

            // If it's 24 hours today, we need to find the NEXT day it CLOSES, or just say it's open.
            // For simplicity in a 24-hr layout:
            // Let's find exactly when it closes by looking ahead
            let checkTime = new Date(now);
            let closedFoundDate = null;
            for (let i = 0; i < 7; i++) {
                let d = (day + i) % 7;
                let cfg = hoursConfig[d];
                if (cfg.end < 24) {
                    closedFoundDate = new Date(now);
                    closedFoundDate.setDate(now.getDate() + i);
                    closedFoundDate.setHours(Math.floor(cfg.end), (cfg.end % 1) * 60, 0, 0);
                    break;
                }
            }
            if (closedFoundDate) {
                timeRemainingStr = `Closes in ${formatTimeRemaining(closedFoundDate - now)}`;
            } else {
                timeRemainingStr = "Open 24/7";
            }

        } else if (currentTimeFloat >= todayConfig.start && currentTimeFloat < todayConfig.end) {
            isOpen = true;
            let closeDate = new Date(now);
            let endHour = Math.floor(todayConfig.end);
            let endMinute = Math.round((todayConfig.end % 1) * 60);

            if (endHour === 24) {
                // Look ahead for continuous open hours instead of showing Closes in 2h if the next day is also open 24hr!
                let nextDayCfg = hoursConfig[(day + 1) % 7];
                if (nextDayCfg.start === 0 && nextDayCfg.end === 24) {
                    // Let's defer to the 24 hour logic above by simulating
                    let closedFoundDate = null;
                    for (let i = 1; i <= 7; i++) {
                        let d = (day + i) % 7;
                        let cfg = hoursConfig[d];
                        if (cfg.end < 24) {
                            closedFoundDate = new Date(now);
                            closedFoundDate.setDate(now.getDate() + i);
                            closedFoundDate.setHours(Math.floor(cfg.end), (cfg.end % 1) * 60, 0, 0);
                            break;
                        }
                    }
                    if (closedFoundDate) {
                        timeRemainingStr = `Closes in ${formatTimeRemaining(closedFoundDate - now)}`;
                    } else {
                        timeRemainingStr = "Open 24/7";
                    }
                } else {
                    closeDate.setHours(23, 59, 59, 999);
                    timeRemainingStr = `Closes in ${formatTimeRemaining(closeDate - now)}`;
                }
            } else {
                closeDate.setHours(endHour, endMinute, 0, 0);
                timeRemainingStr = `Closes in ${formatTimeRemaining(closeDate - now)}`;
            }

        } else {
            isOpen = false;
            const nextOpenDate = getNextOpenTime(now);
            if (nextOpenDate) {
                timeRemainingStr = `Opens in ${formatTimeRemaining(nextOpenDate - now)}`;
            } else {
                timeRemainingStr = "Currently Closed";
            }
        }

        // Apply to DOM
        timeRemainingText.textContent = timeRemainingStr;

        if (isOpen) {
            statusText.textContent = 'OPEN';
            statusHero.classList.remove('closed');
            statusHero.classList.add('open');
        } else {
            statusText.textContent = 'CLOSED';
            statusHero.classList.remove('open');
            statusHero.classList.add('closed');
        }

        todayHoursText.textContent = todayConfig.display;
    }

    // Run once immediately, then every second
    updateLogic();
    setInterval(updateLogic, 1000);
});
