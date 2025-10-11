"use strict";
const head = document.head;
const title = document.createElement('title');
head.append(title);
const body = document.body;
const heading = document.createElement('head');
const h1 = document.createElement('h1');
(async () => {
    while (true) {
        const dateTime = `${new Date().toLocaleString()}`;
        title.textContent = dateTime;
        h1.textContent = dateTime;
        await new Promise(r => setTimeout(r, 1000));
    }
})();
const calendarController = (() => {
    const STARTYEAR = 2000;
    const ENDYEAR = 2050;
    const EVENTMAP = new Map();
    const currentTime = new Date();
    let _currentYear = currentTime.getFullYear();
    let _currentMonth = (currentTime.getMonth() + 1);
    const CURRENT = {
        get year() {
            return _currentYear;
        },
        get month() {
            return _currentMonth;
        }
    };
    const dateObject = {};
    let d = new Date(STARTYEAR, 0, 1);
    while (d.getFullYear() <= ENDYEAR) {
        const year = d.getFullYear();
        dateObject[year] ??= {
            1: [],
            2: [],
            3: [],
            4: [],
            5: [],
            6: [],
            7: [],
            8: [],
            9: [],
            10: [],
            11: [],
            12: [],
        };
        const month = d.getMonth() + 1;
        const x = dateObject[year];
        if (x)
            x[month].push(new Date(d));
        d.setDate(d.getDate() + 1);
    }
    const getMonth = (year, month) => {
        const x = dateObject[year];
        if (x)
            return x[month];
        throw new Error('Invalid year/month');
    };
    const getDay = (year, month, day) => {
        const m = getMonth(year, month);
        const d = m[day - 1];
        if (!d)
            throw new Error('Invalid day');
        return d;
    };
    const addEvent = (year, month, day) => {
    };
    const goToMonth = (year, month) => {
        if (year > ENDYEAR)
            throw new Error();
        if (month < 1 || month > 12)
            throw new Error();
        _currentYear = year;
        _currentMonth = month;
        return CURRENT;
    };
    const goToNextMonth = () => {
        if (CURRENT.month >= 12)
            return goToMonth(CURRENT.year + 1, 1);
        return goToMonth(CURRENT.year, CURRENT.month + 1);
    };
    const goToPrevMonth = () => {
        if (CURRENT.month <= 1)
            return goToMonth(CURRENT.year - 1, 12);
        return goToMonth(CURRENT.year, CURRENT.month - 1);
    };
    return {
        getMonth,
        goToNextMonth,
        goToPrevMonth
    };
})();
const main = document.createElement('main');
main.style.width = '80vw';
main.style.display = 'flex';
main.style.flexDirection = 'column';
main.style.alignItems = 'center';
const section = document.createElement('section');
const buttonDiv = document.createElement('div');
buttonDiv.style.display = 'flex';
buttonDiv.style.gap = '1rem';
buttonDiv.style.justifyContent = 'end';
const nextButton = document.createElement('button');
const prevButton = document.createElement('button');
nextButton.textContent = '>';
prevButton.textContent = '<';
buttonDiv.replaceChildren(prevButton, nextButton);
nextButton.addEventListener('click', () => {
    const { year, month } = calendarController.goToNextMonth();
    setMonthView(year, month);
});
prevButton.addEventListener('click', () => {
    const { year, month } = calendarController.goToPrevMonth();
    setMonthView(year, month);
});
const getMonthView = (month) => {
    const mainDiv = document.createElement('div');
    mainDiv.style.boxSizing = 'border-box';
    mainDiv.style.width = '700px';
    mainDiv.style.display = 'grid';
    mainDiv.style.gridTemplateColumns = 'repeat(7, 1fr)';
    mainDiv.style.gap = '1px';
    mainDiv.style.placeItems = 'center';
    month.forEach((day, i) => {
        const dayDiv = document.createElement('div');
        dayDiv.style.padding = '8px';
        if (i === 0) {
            dayDiv.style.gridColumnStart = String(day.getDay() + 1);
        }
        dayDiv.textContent = String(i + 1);
        mainDiv.append(dayDiv);
    });
    return mainDiv;
};
const calendar = document.createElement('div');
const setMonthView = (year, month) => calendar.replaceChildren(getMonthView(calendarController.getMonth(year, month)));
setMonthView(2025, 10);
section.replaceChildren(buttonDiv, calendar);
main.replaceChildren(section);
body.replaceChildren(h1, main);
