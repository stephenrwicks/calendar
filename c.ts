type Year = 2000 | 2001 | 2002 | 2003 | 2004 | 2005 | 2006 | 2007 | 2008 | 2009 |
    2010 | 2011 | 2012 | 2013 | 2014 | 2015 | 2016 | 2017 | 2018 | 2019 |
    2020 | 2021 | 2022 | 2023 | 2024 | 2025 | 2026 | 2027 | 2028 | 2029 |
    2030 | 2031 | 2032 | 2033 | 2034 | 2035 | 2036 | 2037 | 2038 | 2039 |
    2040 | 2041 | 2042 | 2043 | 2044 | 2045 | 2046 | 2047 | 2048 | 2049 | 2050;
type Month = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
type CalendarObject = {
    [K in Year]: {
        [K in Month]: Date[];
    }
}

type ScheduledEvent = {
    startTime: Date; // Here we use Date more like a timestamp. Then track back to the date in the calendar that it refers to. Since here we have month/day.
    endTime: Date;
    name: string;
    description: string;
    color?: string;
}

// It would have been fun to use the new Temporal API for this project but it's not widely available yet ~October 2025

let LIVETIME: Date;
const STARTYEAR = 2000;
const ENDYEAR = 2050;
const initTime = new Date();
const todayYear = initTime.getFullYear() as Year;
const todayMonth = (initTime.getMonth() + 1) as Month;
const todayDay = initTime.getDate();
let currentView: 'month' | 'day' = 'month';

const CONTROLLER = (() => {
    // Initializes where to start on the calendar
    let _currentYear = todayYear;
    let _currentMonth = todayMonth;
    let _currentDay = todayDay;

    const getMonth = (year: Year, month: Month): Date[] => {
        const days = [];
        const m = month - 1;
        const d = new Date(year, m, 1);
        while (d.getMonth() === m) {
            days.push(new Date(d));
            d.setDate(d.getDate() + 1);
        }
        return days;
    };

    const getNumberOfDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        // No month has fewer than 28 days so we can just start at 28
        if (year > ENDYEAR || year < STARTYEAR) throw new Error('Exceeded max year range');
        const d = new Date(year, month, 28);
        let n = 28;
        while (true) {
            d.setDate(d.getDate() + 1)
            if (d.getDate() < n) break; // Break if we got to 1
            n++;
        }
        return n;
    };


    // Includes end and start
    const getDatesInRange = (event: ScheduledEvent): Date[] => {
        const start = event.startTime;
        const end = event.endTime;
        if (Number(end) < Number(start)) throw new Error('End time is before start time?');
        const dates: Date[] = [end];
        if (isSameDay(start, end)) return dates;
        let d = new Date(end);
        // Just walk backward one day and push until you get the start day
        while (true) {
            d.setDate(d.getDate() - 1);
            if (d.getFullYear() < STARTYEAR) break;
            dates.push(new Date(d));
            if (isSameDay(start, d)) break;
        }
        return dates;
    };

    // Map and Set are way faster than Arrays. Easily avoids nested loops
    // Earlier in this project I was getting all events for a given date by looping through every event and checking its date range
    const EVENTMAP: Map<string, Set<ScheduledEvent>> = new Map();

    const mapEventToDay = (scheduledEvent: ScheduledEvent, date: Date) => {
        const dayString = date.toISOString().slice(0, 10); // Removes timestamp
        const eventsSet = EVENTMAP.get(dayString);
        if (eventsSet) {
            eventsSet.add(scheduledEvent);
            return;
        }
        const newEventsSet: Set<ScheduledEvent> = new Set();
        newEventsSet.add(scheduledEvent);
        EVENTMAP.set(dayString, newEventsSet);
    };

    const addEvent = (scheduledEvent: ScheduledEvent) => {
        const dates = getDatesInRange(scheduledEvent as ScheduledEvent);
        scheduledEvent.color ??= getRandomColor();
        for (const date of dates) {
            mapEventToDay(scheduledEvent as ScheduledEvent, date);
        }
    }

    const updateEvent = (scheduledEvent: ScheduledEvent, updatedData: Omit<ScheduledEvent, 'color'>) => {
        removeEvent(scheduledEvent);
        scheduledEvent.name = updatedData.name.trim();
        scheduledEvent.description = updatedData.description.trim();
        scheduledEvent.startTime = updatedData.startTime;
        scheduledEvent.endTime = updatedData.endTime;
        addEvent(scheduledEvent);
    };

    const removeEvent = (scheduledEvent: ScheduledEvent) => {
        const dates = getDatesInRange(scheduledEvent);
        for (const date of dates) {
            const dayString = date.toISOString().slice(0, 10); // Removes timestamp
            const eventsSet = EVENTMAP.get(dayString);
            eventsSet?.delete(scheduledEvent);
        }
    };

    const getEventsForDay = (day: Date) => EVENTMAP.get(day.toISOString().slice(0, 10)) ?? new Set();

    const getCurrentDate = (): Date => {
        return new Date(_currentYear, _currentMonth - 1, _currentDay, 0);
    };

    const setCurrentDate = (date: Date) => {
        const year = date.getFullYear() as Year;
        const month = (date.getMonth() + 1) as Month;
        if (year > ENDYEAR || year < STARTYEAR) throw new Error();
        _currentYear = year;
        _currentMonth = month;
        _currentDay = date.getDate();
        return getCurrentDate();
    };

    const setCurrentMonth = (year: Year, month: Month) => {
        if (year > ENDYEAR || year < STARTYEAR) throw new Error('Exceeded max year range');
        if (month < 1 || month > 12) throw new Error('Invalid month');
        // Set current day to day 1
        _currentYear = year;
        _currentMonth = month;
        _currentDay = 1;
        return { year: _currentYear, month: _currentMonth, day: _currentDay };
    };

    const goToNextMonth = () => {
        if (_currentMonth >= 12) return setCurrentMonth((_currentYear + 1 as Year), 1);
        return setCurrentMonth(_currentYear, (_currentMonth + 1 as Month));
    };

    const goToPrevMonth = () => {
        if (_currentMonth <= 1) return setCurrentMonth((_currentYear - 1 as Year), 12);
        return setCurrentMonth(_currentYear, (_currentMonth - 1 as Month));
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

    // API
    return {
        setCurrentDate,
        getCurrentDate,
        getMonth,
        goToNextMonth,
        goToPrevMonth,
        goToNextDay,
        goToPrevDay,
        getEventsForDay,
        addEvent,
        updateEvent,
        removeEvent,
        getNumberOfDaysInMonth,
    };

})();

const body = document.body;
body.style.margin = '0px';
body.style.height = '100vh';
body.style.paddingTop = '10vh';

const pageWrapper = document.createElement('div');
pageWrapper.style.fontFamily = 'Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif';

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

// These don't need to be recreated
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
addEventButton.addEventListener('click', () => eventDialog());

const eventDialog = async (scheduledEvent?: ScheduledEvent) => {
    const dialog = document.createElement('dialog');
    dialog.style.borderColor = scheduledEvent?.color ?? '#ccc';
    dialog.addEventListener('cancel', () => dialog.remove());
    pageWrapper.append(dialog);
    const { form, getResult } = eventForm(scheduledEvent);
    dialog.append(form);
    dialog.showModal();
    const result = await getResult;
    if (result && scheduledEvent) {
        CONTROLLER.updateEvent(scheduledEvent, result);
    }
    else if (result) {
        CONTROLLER.addEvent(result);
    }

    dialog.remove();
    if (currentView === 'day') {
        setDayView(CONTROLLER.getCurrentDate());
    }
};

// Maybe pointless decoupling here though. Could just put this inside dialog with no cost
const eventForm = (scheduledEvent?: ScheduledEvent) => {
    //console.log(event);
    // Clean pattern using withResolvers and a form and exporting them separately
    const { promise, resolve } = Promise.withResolvers<Omit<ScheduledEvent, 'color'> | null>();
    const form = document.createElement('form');
    form.style.display = 'flex';
    form.style.flexFlow = 'column';
    form.style.gap = '1rem';

    const nameDiv = document.createElement('div');
    const nameLabel = document.createElement('label');
    const nameInput = document.createElement('input');
    nameDiv.style.display = 'grid';
    nameLabel.style.width = 'min-content';
    nameLabel.htmlFor = 'name-input';
    nameLabel.textContent = 'Name';
    nameInput.id = 'name-input';
    nameInput.type = 'text';
    nameInput.required = true;
    nameInput.maxLength = 40;
    nameInput.pattern = '\\S.*';
    const descriptionDiv = document.createElement('div');
    const descriptionLabel = document.createElement('label');
    const descriptionInput = document.createElement('textarea');
    descriptionDiv.style.display = 'grid';
    descriptionLabel.style.width = 'min-content';
    descriptionLabel.htmlFor = 'description-input';
    descriptionLabel.textContent = 'Description';
    descriptionInput.id = 'description-input';
    descriptionInput.maxLength = 500;
    descriptionInput.style.resize = 'none';
    descriptionInput.style.height = '4rem';

    // Need a way to validate these two dates against each other without breaking the query rule.
    // Could pass up a function that fires reportValidity/setCustom etc
    // Maybe end should not even populate / show until start is filled out
    const defaultStart = CONTROLLER.getCurrentDate();
    const defaultEnd = new Date(defaultStart.getTime() + 3600000); // One hour
    const { datePickerEl: startDateEl, getDate: getStartTime } = datePicker('Start', scheduledEvent?.startTime ?? defaultStart);
    const { datePickerEl: endDateEl, getDate: getEndTime } = datePicker('End', scheduledEvent?.endTime ?? defaultEnd);

    if (scheduledEvent) {
        nameInput.value = scheduledEvent.name ?? '';
        descriptionInput.value = scheduledEvent.description ?? '';
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
        const eventData = {
            name: nameInput.value,
            description: descriptionInput.value,
            startTime: getStartTime(),
            endTime: getEndTime(),
        };
        resolve(eventData);
    });

    nameDiv.replaceChildren(nameLabel, nameInput);
    descriptionDiv.replaceChildren(descriptionLabel, descriptionInput);
    form.replaceChildren(
        nameDiv,
        descriptionDiv,
        startDateEl,
        endDateEl,
        buttonDiv
    )
    return {
        form,
        getResult: promise
    };
};

const datePicker = (title: string, value: Date) => {
    // Avoiding native date input
    const fieldset = document.createElement('fieldset');
    fieldset.style.display = 'grid';
    fieldset.style.margin = '0px';
    fieldset.style.gap = '1rem';

    const legend = document.createElement('legend');
    legend.textContent = title;

    const yearSelect = document.createElement('select');
    yearSelect.required = true;

    const monthSelect = document.createElement('select');
    monthSelect.required = true;

    const daySelect = document.createElement('select');
    daySelect.required = true;

    const timeDiv = document.createElement('div');
    const hourSelect = document.createElement('select');
    const minuteSelect = document.createElement('select');
    const amPmSelect = document.createElement('select');
    timeDiv.style.display = 'flex';
    timeDiv.style.gap = '.5rem';
    timeDiv.style.justifyContent = 'center';
    hourSelect.required = true;
    minuteSelect.required = true;
    amPmSelect.required = true;

    for (let y = STARTYEAR; y <= ENDYEAR; y++) {
        yearSelect.add(new Option(String(y), String(y)));
    }
    for (let m = 0; m <= 11; m++) {
        monthSelect.add(new Option(monthsOfTheYear[m], String(m)));
    }
    for (let d = 1; d <= CONTROLLER.getNumberOfDaysInMonth(value); d++) {
        daySelect.add(new Option(String(d), String(d)));
    }
    for (let h = 1; h <= 12; h++) {
        hourSelect.add(new Option(String(h), String(h)));
    }
    minuteSelect.add(new Option('00', '0'));
    minuteSelect.add(new Option('15', '15'));
    minuteSelect.add(new Option('30', '30'));
    minuteSelect.add(new Option('45', '40'));
    amPmSelect.add(new Option('AM', 'AM'));
    amPmSelect.add(new Option('PM', 'PM'));


    const setDate = (value: Date) => {
        yearSelect.value = String(value.getFullYear());
        monthSelect.value = String(value.getMonth());
        daySelect.value = String(value.getDate());
        let hours = value.getHours();
        if (hours === 0) hours = 12;
        hourSelect.value = hours > 12 ? String(hours - 12) : String(hours);
        amPmSelect.value = value.getHours() >= 12 ? 'PM' : 'AM';
        let minutes = value.getMinutes();
        let minutesValue: string;
        if (minutes < 15) minutesValue = '0';
        else if (minutes < 30) minutesValue = '15';
        else if (minutes < 45) minutesValue = '30';
        else minutesValue = '45';
        minuteSelect.value = minutesValue;
        //return getDate();
    };

    setDate(value);

    const getDate = () => {
        const isPm = amPmSelect.value === 'PM';
        let h = Number(hourSelect.value);
        if (h === 12) {
            // Always set 12:00 to zero
            h = 0;
        }
        if (isPm) {
            // If 12:00 is actually noon it will get set back to 12
            // Otherwise, we need 2 PM to be 14:00, etc.
            h = h + 12;
        }
        return new Date(
            Number(yearSelect.value),
            Number(monthSelect.value),
            Number(daySelect.value),
            h,
            Number(minuteSelect.value)
        );
    };

    fieldset.addEventListener('change', () => {
        // Update "day" input to reflect the number of days
        const dayState = daySelect.value;
        daySelect.replaceChildren();
        for (let d = 1; d <= CONTROLLER.getNumberOfDaysInMonth(getDate()); d++) {
            daySelect.add(new Option(String(d), String(d)));
        }
        daySelect.value = dayState;
    });


    timeDiv.replaceChildren(hourSelect, ':', minuteSelect, amPmSelect)
    const dayDiv = document.createElement('div');
    dayDiv.style.display = 'flex';
    dayDiv.style.gap = '.5rem';
    dayDiv.append(monthSelect, daySelect, yearSelect);
    fieldset.replaceChildren(legend, dayDiv, timeDiv);

    return {
        datePickerEl: fieldset, getDate, setDate
    };
};


const goBackToMonthButton = document.createElement('button');
goBackToMonthButton.type = 'button';
goBackToMonthButton.textContent = 'Back';
goBackToMonthButton.addEventListener('click', () => {
    const date = CONTROLLER.getCurrentDate();
    setMonthView((date.getFullYear() as Year), ((date.getMonth() + 1) as Month), date.getDate() - 1);
});

const calendar = document.createElement('section');

const daysOfTheWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const monthsOfTheYear = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const handleDayFocusIn = (e: Event) => (e.target as HTMLButtonElement).style.boxShadow = '0px 0px 0px 2px inset darkblue';
const handleDayFocusOut = (e: Event) => (e.target as HTMLButtonElement).style.boxShadow = '';
const handleDayMouseIn = (e: Event) => (e.target as HTMLButtonElement).style.backgroundColor = 'var(--hoverBackgroundColor)';
const handleDayMouseOut = (e: Event) => (e.target as HTMLButtonElement).style.backgroundColor = 'var(--backgroundColor)';


const handleDayKeydown = (e: KeyboardEvent, i: number, day: Date, dayButtons: HTMLButtonElement[]) => {
    if (e.key === 'Tab') return;
    e.preventDefault();
    if (e.key === 'Enter') {
        setDayView(day);
        return;
    }

    // This is verbose but probably the clearest way to write this
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

const getDayView = (day: Date) => {
    const wrapper = document.createElement('div');
    wrapper.style.width = '700px';

    const topDiv = document.createElement('div');
    topDiv.style.fontSize = '1.5em';
    topDiv.style.display = 'flex';
    topDiv.style.justifyContent = 'space-between';
    topDiv.style.marginBottom = '2rem';

    const dateHeader = document.createElement('div');
    dateHeader.textContent = day.toISOString().split('T')[0];

    // 96 is 24 * 4 (15 minute increments)
    const dayGrid = document.createElement('div');
    dayGrid.style.display = 'grid';
    dayGrid.style.rowGap = '2rem';
    dayGrid.style.gridTemplateColumns = 'repeat(96, 1fr)';
    dayGrid.style.minHeight = '12rem';
    dayGrid.style.padding = '.2rem';
    dayGrid.style.outline = '1px solid #ccc';

    let gridColumnStart = 1;
    for (const time of ['12AM', '4AM', '8AM', '12PM', '4PM', '8PM']) {
        const hourDiv = document.createElement('div');
        hourDiv.style.gridColumn = `${gridColumnStart} / span 16`;
        // Increment by 16 because we are dividing 96 into 6 equal parts
        gridColumnStart = gridColumnStart + 16;
        hourDiv.textContent = time;
        hourDiv.style.fontSize = '.8em';
        hourDiv.style.pointerEvents = 'none';
        dayGrid.append(hourDiv);
    }

    for (const event of CONTROLLER.getEventsForDay(day)) {
        const eventButton = document.createElement('button');
        eventButton.style.border = 'unset';
        eventButton.style.outline = 'unset';
        eventButton.style.borderRadius = '0px';
        eventButton.style.display = 'grid';
        eventButton.style.placeItems = 'center';
        eventButton.style.height = '3rem';
        eventButton.style.cursor = 'pointer';
        eventButton.style.backgroundColor = event.color ?? getRandomColor();
        eventButton.style.gridColumn = getGridColumnForEvent(day, event);
        //div.textContent = `${event.name} (${event.startTime.toLocaleDateString()} - ${event.endTime.toLocaleDateString()})`;
        eventButton.textContent = event.name;
        eventButton.addEventListener('pointerenter', () => eventButton.style.filter = 'brightness(1.2)');
        eventButton.addEventListener('pointerleave', () => eventButton.style.filter = '');
        eventButton.addEventListener('dblclick', () => eventDialog(event));
        eventButton.addEventListener('keydown', (e) => e.key === 'Enter' && eventDialog(event));
        eventButton.addEventListener('focusin', handleDayFocusIn)
        eventButton.addEventListener('focusout', handleDayFocusOut);

        dayGrid.append(eventButton);
    }

    topDiv.append(goBackToMonthButton, dateHeader, addEventButton, dayNavigationButtonDiv);
    wrapper.append(topDiv, dayGrid);
    return wrapper;

};



// Add 1 here to adjust for 1 index in css grid
const getTimeAs15MinuteIncrement = (d: Date) => Math.floor(d.getHours() * 4) + Math.floor(d.getMinutes() / 15) + 1;
const getGridColumnForEvent = (currentDay: Date, event: ScheduledEvent): string => {
    // Event is assumed to be occuring on currentDay if we got here
    const isStartToday = isSameDay(event.startTime, currentDay);
    const isEndToday = isSameDay(event.endTime, currentDay);
    if (!isStartToday && !isEndToday) return '1 / -1';
    if (isStartToday && !isEndToday) return `${getTimeAs15MinuteIncrement(event.startTime)} / -1`;
    if (!isStartToday && isEndToday) return `1 / ${getTimeAs15MinuteIncrement(event.endTime)}`;
    return `${getTimeAs15MinuteIncrement(event.startTime)} / ${getTimeAs15MinuteIncrement(event.endTime)}`;
}


const getMonthView = (month: Date[]) => {

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
        const eventsForThisDay = CONTROLLER.getEventsForDay(day);
        const dayButton = document.createElement('button');

        dayButton.type = 'button';
        // Leveraging different inline css variable values which then get toggled by JS - This is pretty nice
        dayButton.style.setProperty('--backgroundColor', isToday ? 'lightblue' : 'unset');
        dayButton.style.setProperty('--hoverBackgroundColor', isToday ? 'cyan' : '#fafafa');
        dayButton.style.backgroundColor = 'var(--backgroundColor)';
        dayButton.style.border = 'unset';
        dayButton.style.borderRadius = '0px';
        dayButton.style.padding = '.5rem';
        dayButton.style.outline = '1px solid #ccc';
        dayButton.addEventListener('focusin', handleDayFocusIn)
        dayButton.addEventListener('focusout', handleDayFocusOut);
        dayButton.addEventListener('pointerenter', handleDayMouseIn);
        dayButton.addEventListener('pointerleave', handleDayMouseOut);
        dayButton.addEventListener('dblclick', () => setDayView(day));
        dayButton.addEventListener('keydown', (e) => handleDayKeydown(e, i, day, dayButtons));

        if (i === 0) {
            dayButton.style.gridColumnStart = String(day.getDay() + 1);
        }
        dayButton.textContent = String(i + 1);
        if (eventsForThisDay.size) {
            dayButton.style.position = 'relative';
            const num = document.createElement('div');
            num.style.position = 'absolute';
            num.style.top = '.3rem';
            num.style.right = '.3rem';
            num.style.width = '1rem';
            num.style.height = '1rem';
            num.style.fontSize = '.8em';
            num.style.color = 'red';
            num.style.outline = '1px solid red';
            num.style.borderRadius = '50%';
            num.textContent = String(eventsForThisDay.size);
            dayButton.append(num);
        }
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

const setMonthView = (year: Year, month: Month, focusIndex?: number) => {
    currentView = 'month';
    const { element, dayButtons } = getMonthView(CONTROLLER.getMonth(year, month));
    calendar.replaceChildren(element);
    if (typeof focusIndex === 'number') {
        // Here I can work from the end easily using negative .at()
        dayButtons.at(focusIndex)?.focus();
    }
}
const setDayView = (day: Date) => {
    currentView = 'day';
    CONTROLLER.setCurrentDate(day);
    calendar.replaceChildren(getDayView(day));
};


(async () => {
    while (true) {
        // This should update some "live date" marker on the calendar every second
        LIVETIME = new Date();
        const dateTime = `${LIVETIME.toLocaleString()}`;
        title.textContent = dateTime;
        h1.textContent = dateTime; // This is super basic but we can run it through a function to look cool
        await new Promise(r => setTimeout(r, 1000));
    }
})();

const isSameDay = (a: Date, b: Date) => {
    if (a.getDate() !== b.getDate()) return false;
    if (a.getMonth() !== b.getMonth()) return false;
    if (a.getFullYear() !== b.getFullYear()) return false;
    return true;
}

const getRandomColor = () => {
    const colors = [
        'hsla(17, 82%, 46%, 0.5)',
        'hsla(202, 65%, 58%, 0.5)',
        'hsla(281, 73%, 41%, 0.5)',
        'hsla(124, 69%, 52%, 0.5)',
        'hsla(348, 77%, 49%, 0.5)',
        'hsla(46, 88%, 60%, 0.5)',
        'hsla(192, 71%, 44%, 0.5)',
        'hsla(263, 67%, 55%, 0.5)',
        'hsla(97, 75%, 47%, 0.5)',
        'hsla(329, 63%, 53%, 0.5)',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

const Select = () => {
    const select = document.createElement('select');


    return select;
};

const Button = () => {
    const button = document.createElement('button');


    return button;
};



// Init
setMonthView(todayYear, todayMonth);

main.replaceChildren(calendar);
pageWrapper.replaceChildren(header, main);
body.replaceChildren(pageWrapper);