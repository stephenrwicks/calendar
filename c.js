"use strict";
const currentTime = new Date();
const todayYear = currentTime.getFullYear();
const todayMonth = (currentTime.getMonth() + 1);
const todayDay = currentTime.getDate();
let currentView = 'month';
const CONTROLLER = (() => {
    const STARTYEAR = 2000;
    const ENDYEAR = 2050;
    let _currentYear = todayYear;
    let _currentMonth = todayMonth;
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
    const isSameDay = (start, end) => {
        const isYearSame = end.getFullYear() === start.getFullYear();
        const isMonthSame = end.getMonth() === start.getMonth();
        const isDaySame = end.getDate() === start.getDate();
        return (isYearSame && isMonthSame && isDaySame);
    };
    const getDatesBetweenStartAndEnd = (start, end) => {
        if (Number(end) > Number(start))
            throw new Error('End time is before start time?');
        if (isSameDay(start, end))
            return [];
        const dates = [];
        let d = end;
        while (true) {
            d.setDate(d.getDate() - 1);
            if (d.getFullYear() < STARTYEAR)
                break;
            if (isSameDay(start, d))
                break;
            dates.push(new Date(d));
        }
        return dates;
    };
    const addEvent = (event) => {
        const timeSpan = () => {
        };
        eventMap.set(event.startTime, event);
    };
    const removeEvent = () => {
    };
    const getEventsByDay = () => {
    };
    const eventMap = new Map();
    const goToMonth = (year, month) => {
        if (year > ENDYEAR)
            throw new Error();
        if (month < 1 || month > 12)
            throw new Error();
        _currentYear = year;
        _currentMonth = month;
        return { year: _currentYear, month: _currentMonth };
    };
    const goToNextMonth = () => {
        if (_currentMonth >= 12)
            return goToMonth(_currentYear + 1, 1);
        return goToMonth(_currentYear, _currentMonth + 1);
    };
    const goToPrevMonth = () => {
        if (_currentMonth <= 1)
            return goToMonth(_currentYear - 1, 12);
        return goToMonth(_currentYear, _currentMonth - 1);
    };
    return {
        getMonth,
        goToNextMonth,
        goToPrevMonth
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
    const { year, month } = CONTROLLER.goToNextMonth();
    setMonthView(year, month);
});
prevButton.addEventListener('click', () => {
    const { year, month } = CONTROLLER.goToPrevMonth();
    setMonthView(year, month);
});
const calendar = document.createElement('div');
const daysOfTheWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const monthsOfTheYear = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const dayFocusIn = (e) => e.target.style.boxShadow = '0px 0px 0px 2px lightblue';
const dayFocusOut = (e) => e.target.style.boxShadow = '';
const getDayView = (month, day) => {
    const wrapper = document.createElement('div');
    const text = day.toISOString().split('T')[0];
    const topDiv = document.createElement('div');
    topDiv.style.fontSize = '1.5em';
    topDiv.textContent = text;
    wrapper.append(topDiv);
    return wrapper;
};
const getMonthView = (month) => {
    const wrapper = document.createElement('div');
    const y = month[0].getFullYear();
    const m = month[0].getMonth();
    const topDiv = document.createElement('div');
    topDiv.style.fontSize = '1.5em';
    topDiv.textContent = `${monthsOfTheYear[m]} ${y}`;
    const monthGrid = document.createElement('div');
    monthGrid.style.boxSizing = 'border-box';
    monthGrid.style.width = '700px';
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
        const dayButton = document.createElement('button');
        dayButton.type = 'button';
        dayButton.style.backgroundColor = 'unset';
        dayButton.style.outline = 'unset';
        dayButton.style.border = 'unset';
        dayButton.style.borderRadius = '0px';
        dayButton.style.padding = '8px';
        dayButton.style.outline = '1px solid #ccc';
        dayButton.onclick = () => console.log(day);
        dayButton.addEventListener('focusin', dayFocusIn);
        dayButton.addEventListener('focusout', dayFocusOut);
        dayButton.addEventListener('dblclick', () => setDayView(month, day));
        const isToday = (day.getFullYear() === todayYear) && (day.getMonth() + 1 === todayMonth) && (day.getDate() === todayDay);
        if (isToday) {
            dayButton.style.backgroundColor = 'lightblue';
        }
        if (i === 0) {
            dayButton.style.gridColumnStart = String(day.getDay() + 1);
        }
        dayButton.textContent = String(i + 1);
        return dayButton;
    });
    monthGrid.append(...dayButtons);
    wrapper.append(topDiv, monthGrid);
    return wrapper;
};
const setMonthView = (year, month) => {
    currentView = 'month';
    calendar.replaceChildren(getMonthView(CONTROLLER.getMonth(year, month)));
};
const setDayView = (month, day) => {
    currentView = 'day';
    calendar.replaceChildren(getDayView(month, day));
};
setMonthView(todayYear, todayMonth);
section.replaceChildren(buttonDiv, calendar);
main.replaceChildren(section);
pageWrapper.replaceChildren(header, main);
body.replaceChildren(pageWrapper);
(async () => {
    while (true) {
        const dateTime = `${new Date().toLocaleString()}`;
        title.textContent = dateTime;
        h1.textContent = dateTime;
        await new Promise(r => setTimeout(r, 1000));
    }
})();
