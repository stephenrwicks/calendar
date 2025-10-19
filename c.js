"use strict";
let LIVETIME;
const initTime = new Date();
const todayYear = initTime.getFullYear();
const todayMonth = (initTime.getMonth() + 1);
const todayDay = initTime.getDate();
let currentView = 'month';
const CONTROLLER = (() => {
    const STARTYEAR = 2000;
    const ENDYEAR = 2050;
    let _currentYear = todayYear;
    let _currentMonth = todayMonth;
    let _currentDay = todayDay;
    const getMonth = (year, month) => {
        const days = [];
        const m = month - 1;
        const d = new Date(year, m, 1);
        while (d.getMonth() === m) {
            days.push(new Date(d));
            d.setDate(d.getDate() + 1);
        }
        return days;
    };
    const isSameDay = (start, end) => {
        const isYearSame = end.getFullYear() === start.getFullYear();
        const isMonthSame = end.getMonth() === start.getMonth();
        const isDaySame = end.getDate() === start.getDate();
        return (isYearSame && isMonthSame && isDaySame);
    };
    const getDatesFromStartToEnd = (start, end) => {
        if (Number(end) < Number(start))
            throw new Error('End time is before start time?');
        const dates = [end];
        if (isSameDay(start, end))
            return dates;
        let d = new Date(end);
        while (true) {
            d.setDate(d.getDate() - 1);
            if (d.getFullYear() < STARTYEAR)
                break;
            dates.push(new Date(d));
            if (isSameDay(start, d))
                break;
        }
        return dates;
    };
    const EVENTS = [];
    EVENTS.push({
        startTime: new Date(2025, 9, 2),
        endTime: new Date(2025, 9, 13),
        name: 'test',
        description: 'description',
    });
    const getEventsForDay = (day) => {
        return EVENTS.filter(event => {
            return getDatesFromStartToEnd(event.startTime, event.endTime).some(date => isSameDay(date, day));
        });
    };
    const getCurrentDate = () => {
        return new Date(_currentYear, _currentMonth - 1, _currentDay, 0);
    };
    const setCurrentDate = (date) => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1);
        if (year > ENDYEAR || year < STARTYEAR)
            throw new Error();
        _currentYear = year;
        _currentMonth = month;
        _currentDay = date.getDate();
        return getCurrentDate();
    };
    const setCurrentMonth = (year, month) => {
        if (year > ENDYEAR || year < STARTYEAR)
            throw new Error();
        if (month < 1 || month > 12)
            throw new Error();
        _currentYear = year;
        _currentMonth = month;
        _currentDay = 1;
        return { year: _currentYear, month: _currentMonth, day: _currentDay };
    };
    const goToNextMonth = () => {
        if (_currentMonth >= 12)
            return setCurrentMonth(_currentYear + 1, 1);
        return setCurrentMonth(_currentYear, _currentMonth + 1);
    };
    const goToPrevMonth = () => {
        if (_currentMonth <= 1)
            return setCurrentMonth(_currentYear - 1, 12);
        return setCurrentMonth(_currentYear, _currentMonth - 1);
    };
    const goToNextDay = () => {
        const current = getCurrentDate();
        current.setDate(current.getDate() + 1);
        return new Date(current);
    };
    const goToPrevDay = () => {
        const current = getCurrentDate();
        current.setDate(current.getDate() - 1);
        return new Date(current);
    };
    return {
        setCurrentDate,
        getCurrentDate,
        getMonth,
        goToNextMonth,
        goToPrevMonth,
        goToNextDay,
        goToPrevDay,
        getEventsForDay,
    };
})();
const body = document.body;
body.style.margin = '0px';
body.style.height = '100vh';
body.style.paddingTop = '10vh';
const pageWrapper = document.createElement('div');
const title = document.createElement('title');
document.head.append(title);
const header = document.createElement('header');
const h1 = document.createElement('h1');
header.replaceChildren(h1);
const main = document.createElement('main');
const section = document.createElement('section');
main.style.display = 'flex';
main.style.flexDirection = 'column';
main.style.alignItems = 'center';
main.style.paddingBottom = '5rem';
const monthNavigationButtonDiv = document.createElement('div');
monthNavigationButtonDiv.style.display = 'flex';
monthNavigationButtonDiv.style.gap = '1rem';
const nextButton = document.createElement('button');
const prevButton = document.createElement('button');
nextButton.style.width = '2.5rem';
prevButton.style.width = '2.5rem';
nextButton.textContent = '>';
prevButton.textContent = '<';
monthNavigationButtonDiv.replaceChildren(prevButton, nextButton);
nextButton.addEventListener('click', () => {
    const { year, month } = CONTROLLER.goToNextMonth();
    setMonthView(year, month);
});
prevButton.addEventListener('click', () => {
    const { year, month } = CONTROLLER.goToPrevMonth();
    setMonthView(year, month);
});
const dayNavigationButtonDiv = document.createElement('div');
dayNavigationButtonDiv.style.display = 'flex';
dayNavigationButtonDiv.style.gap = '1rem';
const nextDayButton = document.createElement('button');
const prevDayButton = document.createElement('button');
nextDayButton.style.width = '2.5rem';
prevDayButton.style.width = '2.5rem';
nextDayButton.textContent = '>';
prevDayButton.textContent = '<';
dayNavigationButtonDiv.replaceChildren(prevDayButton, nextDayButton);
nextDayButton.addEventListener('click', () => {
    const date = CONTROLLER.goToNextDay();
    setDayView(date);
});
prevDayButton.addEventListener('click', () => {
    const date = CONTROLLER.goToPrevDay();
    setDayView(date);
});
const addEventButton = document.createElement('button');
addEventButton.type = 'button';
addEventButton.textContent = 'Add Event';
addEventButton.addEventListener('click', async () => {
    await new Promise(resolve => {
        const dialog = document.createElement('dialog');
        pageWrapper.append(dialog);
        dialog.style.width = '600px';
        dialog.style.height = '600px';
        dialog.textContent = 'Add event';
        dialog.showModal();
    });
});
const goBackToMonthButton = document.createElement('button');
goBackToMonthButton.type = 'button';
goBackToMonthButton.textContent = 'Back';
goBackToMonthButton.addEventListener('click', () => {
    const date = CONTROLLER.getCurrentDate();
    setMonthView(date.getFullYear(), (date.getMonth() + 1), date.getDate() - 1);
});
const calendar = document.createElement('section');
const daysOfTheWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const monthsOfTheYear = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const handleDayFocusIn = (e) => e.target.style.boxShadow = '0px 0px 0px 2px inset darkblue';
const handleDayFocusOut = (e) => e.target.style.boxShadow = '';
const handleDayMouseIn = (e) => e.target.style.backgroundColor = '#fafafa';
const handleDayMouseOut = (e) => e.target.style.backgroundColor = 'var(--backgroundColor)';
const handleDayKeydown = (e, i, day, dayButtons) => {
    if (e.key === 'Tab')
        return;
    e.preventDefault();
    if (e.key === 'Enter') {
        setDayView(day);
        return;
    }
    if (e.key === 'ArrowRight') {
        if (dayButtons[i + 1] instanceof HTMLButtonElement) {
            dayButtons[i + 1].focus();
            return;
        }
        const { year, month } = CONTROLLER.goToNextMonth();
        setMonthView(year, month, 0);
    }
    else if (e.key === 'ArrowLeft') {
        if (dayButtons[i - 1] instanceof HTMLButtonElement) {
            dayButtons[i - 1].focus();
            return;
        }
        const { year, month } = CONTROLLER.goToPrevMonth();
        setMonthView(year, month, -1);
    }
    else if (e.key === 'ArrowDown') {
        if (dayButtons[i + 7] instanceof HTMLButtonElement) {
            dayButtons[i + 7].focus();
            return;
        }
        const offset = dayButtons.length - i;
        const focusIndex = 7 - offset;
        const { year, month } = CONTROLLER.goToNextMonth();
        setMonthView(year, month, focusIndex);
    }
    else if (e.key === 'ArrowUp') {
        if (dayButtons[i - 7] instanceof HTMLButtonElement) {
            dayButtons[i - 7].focus();
            return;
        }
        const focusIndex = (7 - i) * -1;
        const { year, month } = CONTROLLER.goToPrevMonth();
        setMonthView(year, month, focusIndex);
    }
};
const getDayView = (day) => {
    const wrapper = document.createElement('div');
    wrapper.style.width = '700px';
    const topDiv = document.createElement('div');
    topDiv.style.fontSize = '1.5em';
    topDiv.style.display = 'flex';
    topDiv.style.justifyContent = 'space-between';
    topDiv.style.marginBottom = '2rem';
    const dateHeader = document.createElement('div');
    dateHeader.textContent = day.toISOString().split('T')[0];
    const dayGrid = document.createElement('div');
    dayGrid.style.display = 'grid';
    dayGrid.style.gridTemplateColumns = 'repeat(24, 1fr)';
    dayGrid.append(...Array.from({ length: 24 }, (_, i) => {
        const hourDiv = document.createElement('div');
        if (i % 4 !== 0)
            return hourDiv;
        hourDiv.textContent = `${i}:00`;
        hourDiv.style.textAlign = 'center';
        hourDiv.style.fontSize = '.8em';
        return hourDiv;
    }));
    const events = CONTROLLER.getEventsForDay(day);
    if (events.length) {
        const eventDivs = events.map(event => {
            const div = document.createElement('div');
            div.style.gridColumnStart = '5';
            div.style.gridColumn = '5/ span 4';
            div.textContent = event.description;
            return div;
        });
        dayGrid.append(...eventDivs);
    }
    topDiv.append(goBackToMonthButton, dateHeader, addEventButton, dayNavigationButtonDiv);
    wrapper.append(topDiv, dayGrid);
    return wrapper;
};
const getMonthView = (month) => {
    const wrapper = document.createElement('div');
    wrapper.style.width = '700px';
    const y = month[0].getFullYear();
    const m = month[0].getMonth();
    const topDiv = document.createElement('div');
    topDiv.style.fontSize = '1.5em';
    topDiv.style.display = 'flex';
    topDiv.style.justifyContent = 'space-between';
    topDiv.style.marginBottom = '2rem';
    const dateHeader = document.createElement('div');
    dateHeader.textContent = `${monthsOfTheYear[m]} ${y}`;
    const monthGrid = document.createElement('div');
    monthGrid.style.boxSizing = 'border-box';
    monthGrid.style.display = 'grid';
    monthGrid.style.gridTemplateColumns = 'repeat(7, 1fr)';
    monthGrid.style.gap = '1px';
    monthGrid.style.placeContent = 'center';
    monthGrid.append(...Array.from({ length: 7 }, (_, i) => {
        const dayOfTheWeekNameDiv = document.createElement('div');
        dayOfTheWeekNameDiv.textContent = daysOfTheWeek[i];
        dayOfTheWeekNameDiv.style.textAlign = 'center';
        return dayOfTheWeekNameDiv;
    }));
    const dayButtons = month.map((day, i) => {
        const isToday = (day.getFullYear() === todayYear) && (day.getMonth() + 1 === todayMonth) && (day.getDate() === todayDay);
        const dayButton = document.createElement('button');
        dayButton.type = 'button';
        dayButton.setAttribute('style', `--backgroundColor: ${isToday ? 'lightblue' : 'unset'}`);
        dayButton.style.backgroundColor = 'var(--backgroundColor)';
        dayButton.style.outline = 'unset';
        dayButton.style.border = 'unset';
        dayButton.style.borderRadius = '0px';
        dayButton.style.padding = '8px';
        dayButton.style.outline = '1px solid #ccc';
        dayButton.addEventListener('focusin', handleDayFocusIn);
        dayButton.addEventListener('focusout', handleDayFocusOut);
        dayButton.addEventListener('pointerenter', handleDayMouseIn);
        dayButton.addEventListener('pointerleave', handleDayMouseOut);
        dayButton.addEventListener('dblclick', () => setDayView(day));
        dayButton.addEventListener('keydown', (e) => handleDayKeydown(e, i, day, dayButtons));
        if (i === 0) {
            dayButton.style.gridColumnStart = String(day.getDay() + 1);
        }
        dayButton.textContent = String(i + 1);
        return dayButton;
    });
    topDiv.append(dateHeader, monthNavigationButtonDiv);
    monthGrid.append(...dayButtons);
    wrapper.append(topDiv, monthGrid);
    return {
        element: wrapper,
        dayButtons
    };
};
const setMonthView = (year, month, focusIndex) => {
    currentView = 'month';
    const { element, dayButtons } = getMonthView(CONTROLLER.getMonth(year, month));
    calendar.replaceChildren(element);
    if (typeof focusIndex === 'number') {
        dayButtons.at(focusIndex)?.focus();
    }
};
const setDayView = (day) => {
    currentView = 'day';
    CONTROLLER.setCurrentDate(day);
    calendar.replaceChildren(getDayView(day));
};
setMonthView(todayYear, todayMonth);
main.replaceChildren(calendar);
pageWrapper.replaceChildren(header, main);
body.replaceChildren(pageWrapper);
(async () => {
    while (true) {
        LIVETIME = new Date();
        const dateTime = `${LIVETIME.toLocaleString()}`;
        title.textContent = dateTime;
        h1.textContent = dateTime;
        await new Promise(r => setTimeout(r, 1000));
    }
})();
