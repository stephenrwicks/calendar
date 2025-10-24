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
    const getDatesInRange = (event) => {
        const start = event.startTime;
        const end = event.endTime;
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
    let eventId = 0;
    const EVENTS = [];
    const upsertEvent = (scheduledEvent) => {
        if ('id' in scheduledEvent && typeof scheduledEvent.id === 'number') {
            const index = EVENTS.findIndex(event => event.id === scheduledEvent.id);
            if (index === -1)
                throw new Error('Event not found');
            EVENTS.splice(1, index, scheduledEvent);
            return;
        }
        const event = { ...scheduledEvent, id: ++eventId };
        EVENTS.push(event);
    };
    const deleteEvent = (id) => {
        const index = EVENTS.findIndex(event => event.id === id);
        if (index === -1)
            throw new Error('Event not found');
        EVENTS.splice(1, index);
    };
    upsertEvent({
        startTime: new Date(2025, 9, 22, 1),
        endTime: new Date(2025, 9, 25, 4),
        name: 'TESTING EVENT',
        description: 'description',
    });
    const getEventsForDay = (day) => {
        return EVENTS.filter(event => {
            return getDatesInRange(event).some(date => isSameDay(date, day));
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
            throw new Error('Exceeded max year range');
        if (month < 1 || month > 12)
            throw new Error('Invalid month');
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
        upsertEvent,
        deleteEvent,
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
addEventButton.addEventListener('click', () => EventDialog());
const EventDialog = async (event) => {
    const dialog = document.createElement('dialog');
    pageWrapper.append(dialog);
    const { form, getResult } = EventForm(event);
    dialog.append(form);
    dialog.showModal();
    const scheduledEvent = await getResult;
    if (scheduledEvent) {
        CONTROLLER.upsertEvent(scheduledEvent);
    }
    dialog.remove();
};
const EventForm = (event) => {
    const { promise, resolve } = Promise.withResolvers();
    const form = document.createElement('form');
    form.style.display = 'grid';
    form.style.gridTemplateColumns = '1fr 1fr';
    form.style.gap = '1rem';
    const nameDiv = document.createElement('div');
    const nameLabel = document.createElement('label');
    const nameInput = document.createElement('input');
    nameDiv.style.display = 'grid';
    nameLabel.htmlFor = 'name-input';
    nameLabel.textContent = 'Name';
    nameInput.id = 'name-input';
    nameInput.type = 'text';
    nameInput.required = true;
    const descriptionDiv = document.createElement('div');
    const descriptionLabel = document.createElement('label');
    const descriptionInput = document.createElement('textarea');
    descriptionDiv.style.display = 'grid';
    descriptionDiv.style.gridColumn = 'span 2';
    descriptionLabel.htmlFor = 'description-input';
    descriptionLabel.textContent = 'Description';
    descriptionInput.id = 'description-input';
    descriptionInput.required = true;
    descriptionInput.style.resize = 'none';
    descriptionInput.style.height = '4rem';
    const { fieldset: startDate, getDate: getStartTime } = DatePicker('Start Time', event?.startTime);
    const { fieldset: endDate, getDate: getEndTime } = DatePicker('End Time', event?.endTime);
    if (event) {
        nameInput.value = event.name ?? '';
        descriptionInput.value = event.description ?? '';
    }
    const okButton = document.createElement('button');
    const cancelButton = document.createElement('button');
    okButton.type = 'submit';
    cancelButton.type = 'button';
    okButton.textContent = 'OK';
    cancelButton.textContent = 'Cancel';
    const buttonDiv = document.createElement('div');
    buttonDiv.style.display = 'flex';
    buttonDiv.style.justifyContent = 'end';
    buttonDiv.style.gap = '1rem';
    buttonDiv.style.gridColumn = 'span 2';
    buttonDiv.append(cancelButton, okButton);
    cancelButton.addEventListener('click', () => resolve(null));
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        resolve({
            ...(event ?? {}),
            name: nameInput.value,
            description: descriptionInput.value,
            startTime: new Date(2025, 9, 1),
            endTime: new Date(2025, 9, 30),
        });
    });
    nameDiv.replaceChildren(nameLabel, nameInput);
    descriptionDiv.replaceChildren(descriptionLabel, descriptionInput);
    form.replaceChildren(nameDiv, descriptionDiv, startDate, endDate, buttonDiv);
    return {
        form,
        getResult: promise
    };
};
const DatePicker = (title, value) => {
    const fieldset = document.createElement('fieldset');
    fieldset.style.display = 'grid';
    fieldset.style.margin = '0px';
    fieldset.style.gap = '1rem';
    const legend = document.createElement('legend');
    legend.textContent = title;
    const yearDiv = document.createElement('div');
    const year = document.createElement('input');
    const yearLabel = document.createElement('label');
    const yearId = `_${crypto.randomUUID()}`;
    yearDiv.style.display = 'grid';
    year.id = yearId;
    yearLabel.htmlFor = yearId;
    yearLabel.textContent = 'Year';
    year.type = 'number';
    year.required = true;
    year.maxLength = 4;
    const monthDiv = document.createElement('div');
    const month = document.createElement('input');
    const monthLabel = document.createElement('label');
    const monthId = `_${crypto.randomUUID()}`;
    monthDiv.style.display = 'grid';
    month.id = monthId;
    monthLabel.htmlFor = monthId;
    monthLabel.textContent = 'Month';
    month.type = 'number';
    month.required = true;
    month.maxLength = 2;
    const dayDiv = document.createElement('div');
    const day = document.createElement('input');
    const dayLabel = document.createElement('label');
    const dayId = `_${crypto.randomUUID()}`;
    dayDiv.style.display = 'grid';
    day.id = dayId;
    dayLabel.htmlFor = dayId;
    dayLabel.textContent = 'Day';
    day.type = 'number';
    day.required = true;
    day.maxLength = 2;
    const getDate = () => {
        return new Date(Number(year.value), Number(month.value) + 1, Number(day.value));
    };
    yearDiv.replaceChildren(yearLabel, year);
    monthDiv.replaceChildren(monthLabel, month);
    dayDiv.replaceChildren(dayLabel, day);
    fieldset.replaceChildren(legend, yearDiv, monthDiv, dayDiv);
    return {
        fieldset, getDate
    };
};
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
    dayGrid.style.gridTemplateColumns = 'repeat(96, 1fr)';
    let start = 1;
    dayGrid.append(...Array.from({ length: 6 }, (_, i) => {
        const hourDiv = document.createElement('div');
        hourDiv.style.gridColumnStart = String(start);
        start = start + 16;
        hourDiv.textContent = `${i * 4}:00`;
        hourDiv.style.textAlign = 'center';
        hourDiv.style.fontSize = '.8em';
        return hourDiv;
    }));
    const events = CONTROLLER.getEventsForDay(day);
    if (events.length) {
        const eventDivs = events.map((event, i) => {
            const div = document.createElement('div');
            div.style.gridColumn = getGridColumnForEvent(day, event);
            div.style.textAlign = 'center';
            div.textContent = `${event.name} (${event.startTime.toLocaleDateString()} - ${event.endTime.toLocaleDateString()})`;
            div.style.backgroundColor = 'hsla(140, 70%, 50%, 0.5)';
            div.addEventListener('dblclick', () => EventDialog(event));
            return div;
        });
        dayGrid.append(...eventDivs);
    }
    topDiv.append(goBackToMonthButton, dateHeader, addEventButton, dayNavigationButtonDiv);
    wrapper.append(topDiv, dayGrid);
    return wrapper;
};
const getTimeAs15MinuteIncrement = (d) => Math.floor(d.getHours() * 4) + Math.floor(d.getMinutes() / 15) + 1;
const getGridColumnForEvent = (currentDay, event) => {
    const isStartToday = isSameDay(event.startTime, currentDay);
    const isEndToday = isSameDay(event.endTime, currentDay);
    if (!isStartToday && !isEndToday)
        return '1 / -1';
    if (isStartToday && !isEndToday)
        return `${getTimeAs15MinuteIncrement(event.startTime)} / -1`;
    if (!isStartToday && isEndToday)
        return `1 / ${getTimeAs15MinuteIncrement(event.endTime)}`;
    return `${getTimeAs15MinuteIncrement(event.startTime)} / ${getTimeAs15MinuteIncrement(event.endTime)}`;
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
    monthGrid.setAttribute('style', '--backgroundColor: unset');
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
        if (isToday)
            dayButton.setAttribute('style', '--backgroundColor: lightblue');
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
const isSameDay = (a, b) => {
    if (a.getDate() !== b.getDate())
        return false;
    if (a.getMonth() !== b.getMonth())
        return false;
    if (a.getFullYear() !== b.getFullYear())
        return false;
    return true;
};
