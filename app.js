document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const statusText = document.getElementById('current-status');
    const timeText = document.getElementById('current-time');
    const todayHoursText = document.getElementById('today-hours');
    const statusCard = document.getElementById('status-card');

    // Business Hours Definition
    // Sunday=0, Monday=1, Tuesday=2, Wednesday=3, Thursday=4, Friday=5, Saturday=6
    const hoursConfig = {
        0: { name: 'Sunday', display: '7:00 AM - 7:00 PM', start: 7, end: 19 },
        1: { name: 'Monday', display: '5:00 AM - 12:00 AM', start: 5, end: 24 },
        2: { name: 'Tuesday', display: '24 Hours', start: 0, end: 24 },
        3: { name: 'Wednesday', display: '24 Hours', start: 0, end: 24 },
        4: { name: 'Thursday', display: '24 Hours', start: 0, end: 24 },
        5: { name: 'Friday', display: '24 Hours', start: 0, end: 24 },
        6: { name: 'Saturday', display: '12:00 AM - 7:00 PM', start: 0, end: 19 }
    };

    function checkStatus(now) {
        const day = now.getDay();
        const hour = now.getHours();
        const minute = now.getMinutes();
        
        // Convert current time to a float value for easier comparison
        // e.g., 7:30 AM = 7.5
        const currentTimeFloat = hour + (minute / 60);

        const todayConfig = hoursConfig[day];
        
        // Special case for ending at exactly midnight (24)
        // If end is 24, we treat any time from start up to 23:59:59 as open
        let isOpen = false;
        
        if (todayConfig.start === 0 && todayConfig.end === 24) {
            // 24 hours
            isOpen = true;
        } else if (currentTimeFloat >= todayConfig.start && currentTimeFloat < todayConfig.end) {
            isOpen = true;
        }

        return { isOpen, dayConfig: todayConfig };
    }

    function updateUI() {
        const now = new Date();
        const { isOpen, dayConfig } = checkStatus(now);

        // Update Time Display
        timeText.textContent = now.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });

        // Update Status
        if (isOpen) {
            statusText.textContent = 'OPEN';
            statusCard.classList.remove('closed');
            statusCard.classList.add('open');
        } else {
            statusText.textContent = 'CLOSED';
            statusCard.classList.remove('open');
            statusCard.classList.add('closed');
        }

        // Update Today's Hours string
        todayHoursText.textContent = dayConfig.display;
    }

    // Initial call
    updateUI();

    // Update every second
    setInterval(updateUI, 1000);
});
