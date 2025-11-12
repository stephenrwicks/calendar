"use strict";
const STARTYEAR = 2000;
const ENDYEAR = 2050;
const initTime = new Date();
const todayYear = initTime.getFullYear();
const todayMonth = (initTime.getMonth() + 1);
const todayDay = initTime.getDate();
let currentView = 'month';
const daysOfTheWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const monthsOfTheYear = ['❄️ January', '❤️ February', '☘️ March', '🌧️ April', '🌼 May', '☀️ June', '🎇 July', '🏖️ August', '🍂 September', '🎃 October', '🦃 November', '🎄 December'];
const CONTROLLER = (() => {
    let _currentYear = todayYear;
    let _currentMonth = todayMonth;
    let _currentDay = todayDay;
    const isSameDay = (a, b) => {
        if (a.getDate() !== b.getDate())
            return false;
        if (a.getMonth() !== b.getMonth())
            return false;
        if (a.getFullYear() !== b.getFullYear())
            return false;
        return true;
    };
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
    const getNumberOfDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        if (year > ENDYEAR || year < STARTYEAR)
            throw new Error('Exceeded max year range');
        const d = new Date(year, month, 28);
        let n = 28;
        while (true) {
            d.setDate(d.getDate() + 1);
            if (d.getDate() < n)
                break;
            n++;
        }
        return n;
    };
    const getDatesInRange = (event) => {
        const start = event.startTime;
        const end = event.endTime;
        if (Number(end) < Number(start))
            throw new Error('End time is before start time?');
        if (isSameDay(start, end))
            return [start];
        const endsAtMidnight = end.getHours() === 0 && end.getMinutes() === 0;
        const dates = endsAtMidnight ? [] : [end];
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
    const EVENTMAP = new Map();
    const EVENTSET = new Set();
    const mapEventToDay = (scheduledEvent, date) => {
        const dayString = date.toLocaleDateString();
        const eventsSet = EVENTMAP.get(dayString);
        if (eventsSet) {
            eventsSet.add(scheduledEvent);
            return;
        }
        const newEventsSet = new Set();
        newEventsSet.add(scheduledEvent);
        EVENTMAP.set(dayString, newEventsSet);
    };
    const addEvent = (scheduledEvent) => {
        const dates = getDatesInRange(scheduledEvent);
        scheduledEvent.color ??= UI.getRandomColor();
        for (const date of dates) {
            mapEventToDay(scheduledEvent, date);
        }
        EVENTSET.add(scheduledEvent);
    };
    const removeEvent = (scheduledEvent) => {
        const dates = getDatesInRange(scheduledEvent);
        for (const date of dates) {
            const dayString = date.toLocaleDateString();
            const eventsSet = EVENTMAP.get(dayString);
            eventsSet?.delete(scheduledEvent);
        }
        EVENTSET.delete(scheduledEvent);
    };
    const updateEvent = (scheduledEvent, updatedData) => {
        removeEvent(scheduledEvent);
        scheduledEvent.name = updatedData.name.trim();
        scheduledEvent.description = updatedData.description.trim();
        scheduledEvent.startTime = updatedData.startTime;
        scheduledEvent.endTime = updatedData.endTime;
        addEvent(scheduledEvent);
    };
    const getEventsFile = () => {
        const eventsJson = JSON.stringify([...EVENTSET].map(event => {
            return {
                name: event.name,
                description: event.description,
                startTime: event.startTime.toLocaleString(),
                endTime: event.endTime.toLocaleString(),
            };
        }));
        const file = new File([(new Blob([eventsJson]))], 'events.json', { type: 'application/json' });
        return file;
    };
    const importEvents = async (fileList) => {
        if (!fileList)
            return;
        if (!fileList.length)
            return;
        const json = await fileList[0].text();
        try {
            const events = JSON.parse(json);
            if (!Array.isArray(events) || !events.length)
                return;
            EVENTSET.clear();
            EVENTMAP.clear();
            for (const event of events) {
                event.startTime = new Date(event.startTime);
                event.endTime = new Date(event.endTime);
                addEvent(event);
            }
        }
        catch {
        }
    };
    const getEventsForDay = (day) => EVENTMAP.get(day.toLocaleDateString()) ?? new Set();
    const getCurrentDate = () => new Date(_currentYear, _currentMonth - 1, _currentDay, 0);
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
        isSameDay,
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
        getEventsFile,
        importEvents,
    };
})();
const THEMES = {
    '🌿': (() => {
        const font = 'normal 16px Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif';
        const primaryColor = 'green';
        const secondaryColor = 'mintcream';
        const darkAccentColor = 'hsla(180, 100%, 25%, 1)';
        const lightAccentColor = 'hsla(180, 100%, 25%, .7)';
        const gray = '#ccc';
        const lightGray = '#eee';
        const border = `1px solid ${primaryColor}`;
        const boxShadow = `0px 1px 8px ${gray}`;
        const insetBoxShadow = `0px 0px 1px 2px inset ${darkAccentColor}`;
        const dropShadow = `drop-shadow(0px 0px 2px ${darkAccentColor})`;
        const borderRadius = '.1rem';
        const black = 'black';
        const white = 'white';
        const alert = 'orange';
        const background = 'hsla(180, 100%, 25%, .1)';
        const monthSelectHover = primaryColor;
        const monthSelectBackground = secondaryColor;
        return {
            font,
            black,
            white,
            primaryColor,
            darkAccentColor,
            lightAccentColor,
            secondaryColor,
            lightGray,
            gray,
            alert,
            border,
            borderRadius,
            boxShadow,
            insetBoxShadow,
            dropShadow,
            background,
            monthSelectHover,
            monthSelectBackground,
        };
    })(),
    '🧊': (() => {
        const font = 'normal 16px Georgia, Cambria, "Times New Roman", Times, serif';
        const black = 'hsl(220, 20%, 10%)';
        const white = 'aliceblue';
        const primaryColor = 'midnightblue';
        const secondaryColor = 'hsla(220, 100%, 30%, .1)';
        const darkAccentColor = 'hsla(220, 100%, 30%, 1)';
        const lightAccentColor = 'hsla(220, 100%, 30%, 1)';
        const gray = '#c8c8c8';
        const lightGray = '#e8e8e8';
        const border = `1px solid ${primaryColor}`;
        const boxShadow = `0px 1px 8px ${gray}`;
        const insetBoxShadow = `0px 0px 1px 2px inset ${darkAccentColor}`;
        const dropShadow = `drop-shadow(0px 0px 2px ${darkAccentColor})`;
        const borderRadius = '0px';
        const alert = 'goldenrod';
        const background = 'aliceblue';
        return {
            font,
            black,
            white,
            primaryColor,
            darkAccentColor,
            lightAccentColor,
            secondaryColor,
            lightGray,
            gray,
            alert,
            border,
            borderRadius,
            boxShadow,
            insetBoxShadow,
            dropShadow,
            background,
        };
    })(),
};
const UI = {
    setTheme(theme = '🌿') {
        for (const [key, value] of Object.entries(THEMES[theme])) {
            CALENDAR.style.setProperty(`--${key}`, value);
        }
    },
    getRandomColor() {
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
    },
    Button(type = 'button') {
        const button = document.createElement('button');
        button.type = type;
        button.style.display = 'grid';
        button.style.placeItems = 'center';
        button.style.textAlign = 'center';
        button.style.textWrap = 'balance';
        button.style.userSelect = 'none';
        button.style.cursor = 'pointer';
        button.style.padding = '.4em';
        button.style.outline = '0px';
        button.style.font = 'inherit';
        button.style.fontSize = '.8em';
        button.style.border = 'var(--border)';
        button.style.borderRadius = 'var(--borderRadius)';
        button.style.backgroundColor = 'var(--secondaryColor)';
        button.style.color = 'var(--black)';
        button.style.transition = 'background-color .2s, box-shadow .2s';
        button.style.userSelect = 'none';
        button.addEventListener('focusin', () => button.style.filter = 'var(--dropShadow)');
        button.addEventListener('focusout', () => button.style.filter = '');
        button.addEventListener('pointerenter', () => button.style.boxShadow = 'var(--boxShadow)');
        button.addEventListener('pointerleave', () => button.style.boxShadow = '');
        return button;
    },
    Label() {
        const label = document.createElement('label');
        label.style.display = 'block';
        label.style.width = 'fit-content';
        label.style.marginBottom = '.2em';
        return label;
    },
    Textbox() {
        const input = document.createElement('input');
        input.type = 'text';
        input.maxLength = 40;
        input.style.display = 'block';
        input.style.padding = '.5em';
        input.style.outline = '0px';
        input.style.font = 'inherit';
        input.style.backgroundColor = 'var(--white)';
        input.style.color = 'var(--black)';
        input.style.border = 'var(--border)';
        input.style.borderRadius = 'var(--borderRadius)';
        input.addEventListener('focusin', () => input.style.backgroundColor = 'var(--secondaryColor)');
        input.addEventListener('focusout', () => input.style.backgroundColor = 'var(--white)');
        input.addEventListener('pointerenter', () => input.style.boxShadow = 'var(--boxShadow)');
        input.addEventListener('pointerleave', () => input.style.boxShadow = '');
        return input;
    },
    Textarea() {
        const input = document.createElement('textarea');
        input.style.display = 'block';
        input.style.resize = 'none';
        input.maxLength = 500;
        input.style.padding = '.5em';
        input.style.font = 'inherit';
        input.style.backgroundColor = 'var(--white)';
        input.style.color = 'var(--black)';
        input.style.outline = '0px';
        input.style.border = 'var(--border)';
        input.style.borderRadius = 'var(--borderRadius)';
        input.style.height = '4em';
        input.addEventListener('focusin', () => input.style.backgroundColor = 'var(--secondaryColor)');
        input.addEventListener('focusout', () => input.style.backgroundColor = 'var(--white)');
        input.addEventListener('pointerenter', () => input.style.boxShadow = 'var(--boxShadow)');
        input.addEventListener('pointerleave', () => input.style.boxShadow = '');
        return input;
    },
    Select() {
        const select = document.createElement('select');
        select.style.display = 'block';
        select.style.padding = '.5em';
        select.style.fontFamily = 'inherit';
        select.style.fontSize = '.8em';
        select.style.borderRadius = 'var(--borderRadius)';
        select.style.cursor = 'pointer';
        select.style.outline = '0px';
        select.style.border = 'var(--border)';
        select.style.borderRadius = 'var(--borderRadius)';
        select.style.backgroundColor = 'var(--secondaryColor)';
        select.style.color = 'var(--black)';
        select.style.transition = 'background-color .2s, box-shadow .2s';
        select.addEventListener('focusin', () => select.style.filter = 'var(--dropShadow)');
        select.addEventListener('focusout', () => select.style.filter = '');
        select.addEventListener('pointerenter', () => select.style.boxShadow = 'var(--boxShadow)');
        select.addEventListener('pointerleave', () => select.style.boxShadow = '');
        return select;
    },
    Dialog(color) {
        const dialog = document.createElement('dialog');
        dialog.style.borderColor = color;
        dialog.style.boxShadow = '0px 0px 0px max(100vh, 100vw) color-mix(in srgb, var(--lightAccentColor) 50%, hsla(0, 0%, 0%, 0.5))';
        dialog.style.padding = '1em';
        dialog.style.backgroundColor = 'var(--white)';
        dialog.addEventListener('cancel', dialog.remove);
        return dialog;
    },
    DayButton(isToday) {
        const dayButton = document.createElement('button');
        dayButton.type = 'button';
        dayButton.style.setProperty('--backgroundColor', isToday ? 'var(--darkAccentColor)' : 'unset');
        dayButton.style.setProperty('--hoverBackgroundColor', isToday ? 'var(--lightAccentColor)' : 'var(--lightGray');
        dayButton.style.color = isToday ? 'white' : '';
        dayButton.style.backgroundColor = 'var(--backgroundColor)';
        dayButton.style.border = 'unset';
        dayButton.style.borderRadius = '0px';
        dayButton.style.cursor = 'pointer';
        dayButton.style.padding = '.5em';
        dayButton.style.outline = 'var(--border)';
        return dayButton;
    },
    DaySelect() {
        const select = UI.Select();
        select.style.appearance = 'none';
        select.style.height = '100%';
        select.addEventListener('change', () => {
            const currentDate = CONTROLLER.getCurrentDate();
            setDayView(new Date(currentDate.getFullYear(), currentDate.getMonth(), Number(select.value)));
        });
        return select;
    },
    MonthSelect() {
        const select = UI.Select();
        select.style.appearance = 'none';
        select.style.height = '100%';
        monthsOfTheYear.forEach((month, i) => {
            const isSelected = CONTROLLER.getCurrentDate().getMonth() === i;
            const option = new Option(month, String(i), false, isSelected);
            select.add(option);
        });
        select.addEventListener('change', () => {
            const currentDate = CONTROLLER.getCurrentDate();
            setMonthView(currentDate.getFullYear(), Number(select.value) + 1);
        });
        return select;
    },
    YearSelect() {
        const select = UI.Select();
        select.style.appearance = 'none';
        select.style.height = '100%';
        for (let i = STARTYEAR; i <= ENDYEAR; i++) {
            const isSelected = CONTROLLER.getCurrentDate().getFullYear() === i;
            const option = new Option(String(i), String(i), false, isSelected);
            option.style.fontSize = '.7em';
            select.add(option);
        }
        select.addEventListener('change', () => {
            const currentDate = CONTROLLER.getCurrentDate();
            setMonthView(Number(select.value), currentDate.getMonth() + 1);
        });
        return select;
    },
    Confirm(parent, message) {
        return new Promise(resolve => {
            const dialog = UI.Dialog('var(--alert)');
            dialog.style.display = 'flex';
            dialog.style.flexFlow = 'column';
            dialog.style.justifyContent = 'space-between';
            dialog.style.gap = '1em';
            dialog.style.width = '15em';
            dialog.style.minHeight = '10em';
            const div = document.createElement('div');
            div.style.display = 'grid';
            div.style.placeItems = 'center';
            div.style.flex = '1';
            div.style.textAlign = 'center';
            div.style.textWrap = 'balance';
            div.textContent = message;
            div.style.lineHeight = '1.5em';
            const buttonDiv = document.createElement('div');
            buttonDiv.style.display = 'flex';
            buttonDiv.style.gap = '1em';
            buttonDiv.style.justifyContent = 'end';
            const okButton = UI.Button();
            okButton.style.padding = '.4em .8em';
            const cancelButton = UI.Button();
            okButton.textContent = 'OK';
            cancelButton.textContent = 'Cancel';
            okButton.addEventListener('click', () => {
                resolve(true);
                dialog.remove();
            });
            cancelButton.addEventListener('click', () => {
                resolve(false);
                dialog.remove();
            });
            dialog.addEventListener('cancel', () => {
                resolve(false);
                dialog.remove();
            });
            buttonDiv.replaceChildren(cancelButton, okButton);
            dialog.replaceChildren(div, buttonDiv);
            parent.append(dialog);
            dialog.showModal();
        });
    },
    DatePicker(title, value) {
        const fieldset = document.createElement('fieldset');
        fieldset.style.display = 'grid';
        fieldset.style.margin = '0px';
        fieldset.style.gap = '1em';
        fieldset.style.border = '1px solid var(--primaryColor)';
        const legend = document.createElement('legend');
        legend.textContent = title;
        legend.style.padding = '0px .2em';
        const yearSelect = UI.Select();
        yearSelect.required = true;
        const monthSelect = UI.Select();
        monthSelect.required = true;
        const daySelect = UI.Select();
        daySelect.required = true;
        const timeDiv = document.createElement('div');
        const hourSelect = UI.Select();
        const minuteSelect = UI.Select();
        const amPmSelect = UI.Select();
        timeDiv.style.display = 'flex';
        timeDiv.style.gap = '.5em';
        timeDiv.style.alignItems = 'center';
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
        minuteSelect.add(new Option('45', '45'));
        amPmSelect.add(new Option('AM', 'AM'));
        amPmSelect.add(new Option('PM', 'PM'));
        const setDate = (value) => {
            yearSelect.value = String(value.getFullYear());
            monthSelect.value = String(value.getMonth());
            daySelect.value = String(value.getDate());
            let hours = value.getHours();
            if (hours === 0)
                hours = 12;
            hourSelect.value = hours > 12 ? String(hours - 12) : String(hours);
            amPmSelect.value = value.getHours() >= 12 ? 'PM' : 'AM';
            let minutes = value.getMinutes();
            let minutesValue;
            if (minutes < 15)
                minutesValue = '0';
            else if (minutes < 30)
                minutesValue = '15';
            else if (minutes < 45)
                minutesValue = '30';
            else
                minutesValue = '45';
            minuteSelect.value = minutesValue;
        };
        setDate(value);
        const getDate = () => {
            const isPm = amPmSelect.value === 'PM';
            let h = Number(hourSelect.value);
            if (h === 12) {
                h = 0;
            }
            if (isPm) {
                h = h + 12;
            }
            return new Date(Number(yearSelect.value), Number(monthSelect.value), Number(daySelect.value), h, Number(minuteSelect.value));
        };
        fieldset.addEventListener('change', () => {
            let dayState = Number(daySelect.value);
            const numberOfDays = CONTROLLER.getNumberOfDaysInMonth(new Date(Number(yearSelect.value), Number(monthSelect.value), 1));
            dayState = dayState > numberOfDays ? numberOfDays : dayState;
            daySelect.replaceChildren();
            for (let d = 1; d <= numberOfDays; d++) {
                daySelect.add(new Option(String(d), String(d)));
            }
            daySelect.value = String(dayState);
            fieldset.dispatchEvent(new CustomEvent('datechange', { bubbles: true }));
        });
        timeDiv.replaceChildren(hourSelect, ':', minuteSelect, amPmSelect);
        const dayDiv = document.createElement('div');
        dayDiv.style.display = 'flex';
        dayDiv.style.gap = '.5em';
        dayDiv.append(monthSelect, daySelect, yearSelect);
        fieldset.replaceChildren(legend, dayDiv, timeDiv);
        return {
            datePickerEl: fieldset,
            getDate,
            setDate,
            setCustomValidity: (error) => monthSelect.setCustomValidity(error)
        };
    }
};
const navigationButtonDiv = document.createElement('div');
navigationButtonDiv.style.display = 'flex';
navigationButtonDiv.style.gap = '1em';
const nextButton = UI.Button();
const prevButton = UI.Button();
nextButton.style.width = '2em';
prevButton.style.width = '2em';
nextButton.textContent = '❯';
prevButton.textContent = '❮';
nextButton.addEventListener('click', () => {
    if (currentView === 'month') {
        const { year, month } = CONTROLLER.goToNextMonth();
        setMonthView(year, month);
    }
    else {
        const date = CONTROLLER.goToNextDay();
        setDayView(date);
    }
});
prevButton.addEventListener('click', () => {
    if (currentView === 'month') {
        const { year, month } = CONTROLLER.goToPrevMonth();
        setMonthView(year, month);
    }
    else {
        const date = CONTROLLER.goToPrevDay();
        setDayView(date);
    }
});
const addEventButton = UI.Button();
addEventButton.textContent = '📌 Schedule an event';
addEventButton.style.paddingRight = '.8em';
addEventButton.addEventListener('click', (e) => {
    e.preventDefault();
    eventDialog();
});
const eventDialog = async (scheduledEvent) => {
    const dialog = UI.Dialog(scheduledEvent?.color ?? 'var(--primaryColor)');
    CALENDAR.append(dialog);
    const { form, getResult } = eventForm(scheduledEvent);
    dialog.replaceChildren(form);
    dialog.showModal();
    const result = await getResult;
    if (!result)
        return dialog.remove();
    if (scheduledEvent) {
        CONTROLLER.updateEvent(scheduledEvent, result);
    }
    else {
        CONTROLLER.addEvent(result);
    }
    dialog.remove();
    const d = result.startTime;
    CONTROLLER.setCurrentDate(d);
    if (currentView === 'day')
        setDayView(d);
    else
        setMonthView(d.getFullYear(), d.getMonth() + 1);
};
const eventForm = (scheduledEvent) => {
    const { promise, resolve } = Promise.withResolvers();
    const form = document.createElement('form');
    form.style.display = 'grid';
    form.style.gap = '1em';
    const h1 = document.createElement('h1');
    h1.textContent = '📌 Schedule an event';
    h1.style.margin = 'unset';
    h1.style.fontSize = '1.2em';
    h1.style.fontWeight = 'normal';
    const nameDiv = document.createElement('div');
    const nameLabel = UI.Label();
    const nameInput = UI.Textbox();
    const nameId = `_${crypto.randomUUID()}`;
    nameDiv.style.display = 'grid';
    nameLabel.htmlFor = nameId;
    nameLabel.textContent = 'Name';
    nameInput.id = nameId;
    nameInput.required = true;
    nameInput.pattern = '\\S.*';
    const descriptionDiv = document.createElement('div');
    const descriptionLabel = UI.Label();
    const descriptionInput = UI.Textarea();
    const descId = `_${crypto.randomUUID()}`;
    descriptionDiv.style.display = 'grid';
    descriptionLabel.htmlFor = descId;
    descriptionLabel.textContent = 'Description';
    descriptionInput.id = descId;
    const currentTime = new Date();
    const defaultStart = new Date(new Date(CONTROLLER.getCurrentDate().setHours(currentTime.getHours())).setMinutes(currentTime.getMinutes()));
    const defaultEnd = new Date(defaultStart.getTime() + 3600000);
    const { datePickerEl: startDateEl, getDate: getStartTime, setDate: setStartTime, setCustomValidity } = UI.DatePicker('Start', scheduledEvent?.startTime ?? defaultStart);
    const { datePickerEl: endDateEl, getDate: getEndTime, setDate: setEndTime } = UI.DatePicker('End', scheduledEvent?.endTime ?? defaultEnd);
    form.addEventListener('datechange', (e) => {
        const startTime = Number(getStartTime());
        const endTime = Number(getEndTime());
        const isValid = endTime > startTime;
        setCustomValidity('');
        if (isValid)
            return;
        setCustomValidity('Start date must be before the end date.');
    });
    if (scheduledEvent) {
        nameInput.value = scheduledEvent.name ?? '';
        descriptionInput.value = scheduledEvent.description ?? '';
    }
    const okButton = UI.Button('submit');
    okButton.style.padding = '.4em .8em';
    const cancelButton = UI.Button();
    okButton.textContent = 'OK';
    cancelButton.textContent = 'Cancel';
    const buttonDiv = document.createElement('div');
    buttonDiv.style.display = 'flex';
    buttonDiv.style.justifySelf = 'end';
    buttonDiv.style.gap = '1em';
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
    form.replaceChildren(h1, nameDiv, descriptionDiv, startDateEl, endDateEl, buttonDiv);
    return {
        form,
        getResult: promise
    };
};
const goBackToMonthButton = UI.Button();
goBackToMonthButton.textContent = 'Back';
goBackToMonthButton.addEventListener('click', () => {
    goBackToMonthButton.style.filter = '';
    goBackToMonthButton.style.boxShadow = '';
    const date = CONTROLLER.getCurrentDate();
    setMonthView(date.getFullYear(), (date.getMonth() + 1), date.getDate() - 1);
});
const handleDayFocusIn = (e) => e.target.style.boxShadow = 'var(--insetBoxShadow)';
const handleDayFocusOut = (e) => e.target.style.boxShadow = '';
const handleDayMouseIn = (e) => e.target.style.backgroundColor = 'var(--hoverBackgroundColor)';
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
    const dayGrid = document.createElement('div');
    dayGrid.style.display = 'grid';
    dayGrid.style.rowGap = '2em';
    dayGrid.style.gridTemplateColumns = 'repeat(96, 1fr)';
    dayGrid.style.minHeight = '12em';
    dayGrid.style.outline = 'var(--border)';
    let gridColumnStart = 1;
    const eventsForThisDay = CONTROLLER.getEventsForDay(day);
    if (!eventsForThisDay.size) {
    }
    for (const time of ['12AM', '4AM', '8AM', '12PM', '4PM', '8PM']) {
        const hourDiv = document.createElement('div');
        hourDiv.style.gridColumn = `${gridColumnStart} / span 16`;
        hourDiv.style.alignSelf = 'start';
        hourDiv.style.width = 'fit-content';
        gridColumnStart = gridColumnStart + 16;
        hourDiv.textContent = time;
        hourDiv.style.fontSize = '.8em';
        hourDiv.style.userSelect = 'none';
        dayGrid.append(hourDiv);
    }
    for (const event of eventsForThisDay) {
        const eventButton = document.createElement('button');
        eventButton.type = 'button';
        eventButton.style.border = 'unset';
        eventButton.style.outline = 'unset';
        eventButton.style.borderRadius = '0px';
        eventButton.style.display = 'grid';
        eventButton.style.placeItems = 'center';
        eventButton.style.height = '3em';
        eventButton.style.cursor = 'pointer';
        eventButton.style.overflow = 'hidden';
        eventButton.style.maxWidth = '100%';
        eventButton.style.backgroundColor = event.color ?? UI.getRandomColor();
        eventButton.style.gridColumn = getGridColumnForEvent(day, event);
        eventButton.textContent = event.name;
        eventButton.title = event.name;
        eventButton.addEventListener('pointerenter', () => eventButton.style.filter = 'brightness(1.2)');
        eventButton.addEventListener('pointerleave', () => eventButton.style.filter = '');
        eventButton.addEventListener('dblclick', () => eventDialog(event));
        eventButton.addEventListener('keydown', (e) => {
            e.preventDefault();
            if (e.key === 'Enter') {
                eventDialog(event);
            }
            else if (e.key === 'Backspace' || e.key === 'Delete') {
                UI.Confirm(CALENDAR, `Delete this event: ${event.name}?`).then(bool => {
                    if (!bool)
                        return;
                    CONTROLLER.removeEvent(event);
                    setDayView(day);
                });
            }
        });
        eventButton.addEventListener('focusin', handleDayFocusIn);
        eventButton.addEventListener('focusout', handleDayFocusOut);
        dayGrid.append(eventButton);
    }
    return { dayGrid };
};
const getTimeAs15MinuteIncrement = (d) => Math.floor(d.getHours() * 4) + Math.floor(d.getMinutes() / 15) + 1;
const getGridColumnForEvent = (currentDay, event) => {
    const isStartToday = CONTROLLER.isSameDay(event.startTime, currentDay);
    const isEndToday = CONTROLLER.isSameDay(event.endTime, currentDay);
    if (!isStartToday && !isEndToday)
        return '1 / -1';
    if (isStartToday && !isEndToday)
        return `${getTimeAs15MinuteIncrement(event.startTime)} / -1`;
    if (!isStartToday && isEndToday)
        return `1 / ${getTimeAs15MinuteIncrement(event.endTime)}`;
    return `${getTimeAs15MinuteIncrement(event.startTime)} / ${getTimeAs15MinuteIncrement(event.endTime)}`;
};
const getMonthView = (month) => {
    const monthGrid = document.createElement('div');
    monthGrid.style.display = 'grid';
    monthGrid.style.gridTemplateColumns = 'repeat(7, 1fr)';
    monthGrid.style.gap = '1px';
    monthGrid.style.placeContent = 'center';
    monthGrid.append(...Array.from({ length: 7 }, (_, i) => {
        const dayOfTheWeekNameDiv = document.createElement('div');
        dayOfTheWeekNameDiv.textContent = daysOfTheWeek[i];
        dayOfTheWeekNameDiv.style.textAlign = 'center';
        dayOfTheWeekNameDiv.style.paddingBottom = '1em';
        return dayOfTheWeekNameDiv;
    }));
    const dayButtons = month.map((day, i) => {
        const isToday = (day.getFullYear() === todayYear) && (day.getMonth() + 1 === todayMonth) && (day.getDate() === todayDay);
        const eventsForThisDay = CONTROLLER.getEventsForDay(day);
        const dayButton = UI.DayButton(isToday);
        dayButton.addEventListener('focusin', (e) => {
            handleDayFocusIn(e);
            CONTROLLER.setCurrentDate(day);
        });
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
            num.style.top = '.3em';
            num.style.right = '.3em';
            num.style.fontSize = '.8em';
            num.style.color = 'red';
            num.style.padding = '.1em .2em .1em .1em';
            num.style.backgroundColor = 'var(--secondaryColor)';
            num.textContent = `📌 ${eventsForThisDay.size}`;
            dayButton.append(num);
        }
        return dayButton;
    });
    const isMax = month[0].getMonth() === 11 && month[0].getFullYear() >= ENDYEAR;
    const isMin = month[0].getMonth() === 0 && month[0].getFullYear() <= STARTYEAR;
    nextButton.style.visibility = isMax ? 'hidden' : '';
    prevButton.style.visibility = isMin ? 'hidden' : '';
    nextButton.disabled = isMax;
    prevButton.disabled = isMin;
    monthGrid.append(...dayButtons);
    return {
        monthGrid,
        dayButtons
    };
};
const setMonthView = (year, month, focusIndex) => {
    currentView = 'month';
    mainMonthSelect.value = String(month - 1);
    mainYearSelect.value = String(year);
    CONTROLLER.setCurrentDate(new Date(year, month - 1, 1));
    const { monthGrid, dayButtons } = getMonthView(CONTROLLER.getMonth(year, month));
    main.replaceChildren(monthGrid);
    if (typeof focusIndex === 'number') {
        dayButtons.at(focusIndex)?.focus();
    }
    mainMonthSelect.blur();
    mainYearSelect.blur();
    headerMidDiv.replaceChildren(mainMonthSelect, mainYearSelect);
};
const setDayView = (date) => {
    currentView = 'day';
    CONTROLLER.setCurrentDate(date);
    mainMonthSelect.value = String(date.getMonth());
    const { dayGrid } = getDayView(date);
    main.replaceChildren(dayGrid);
    mainMonthButton.textContent = monthsOfTheYear[date.getMonth()];
    headerMidDiv.replaceChildren(mainMonthButton, String(date.getDate()));
};
const themeSelect = UI.Select();
for (const key in THEMES) {
    themeSelect.add(new Option(key, key));
}
themeSelect.addEventListener('change', () => UI.setTheme(themeSelect.value ?? '🌿'));
const saveButton = UI.Button();
saveButton.textContent = '💾';
saveButton.style.fontStyle = 'normal';
saveButton.addEventListener('click', () => {
    const a = document.createElement('a');
    const file = CONTROLLER.getEventsFile();
    const url = URL.createObjectURL(file);
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
});
const openButton = UI.Button();
openButton.textContent = '📂';
openButton.addEventListener('click', () => {
    fileInput.click();
});
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = 'application/json';
fileInput.addEventListener('change', async () => {
    const x = await UI.Confirm(CALENDAR, 'This will overwrite existing events. Continue?');
    if (!x)
        return;
    await CONTROLLER.importEvents(fileInput.files);
    fileInput.value = '';
    const currentDate = CONTROLLER.getCurrentDate();
    if (currentView = 'day') {
        setDayView(currentDate);
    }
    else {
        setMonthView(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());
    }
});
const CALENDAR = document.createElement('div');
CALENDAR.style.width = 'min(700px, 100vw)';
CALENDAR.style.display = 'grid';
CALENDAR.style.gap = '2em';
CALENDAR.style.padding = '3em';
CALENDAR.style.boxShadow = 'var(--boxShadow)';
CALENDAR.style.backgroundColor = 'var(--background)';
CALENDAR.style.font = 'var(--font)';
const header = document.createElement('header');
header.style.fontSize = '1.2em';
header.style.display = 'flex';
header.style.justifyContent = 'space-between';
header.style.height = '2em';
const mainMonthSelect = UI.MonthSelect();
const mainYearSelect = UI.YearSelect();
const headerMidDiv = document.createElement('div');
headerMidDiv.style.display = 'flex';
headerMidDiv.style.alignItems = 'center';
headerMidDiv.style.justifyContent = 'center';
headerMidDiv.style.gap = '1em';
const mainMonthButton = UI.Button();
mainMonthButton.style.height = '100%';
mainMonthButton.addEventListener('click', () => {
    const currentDate = CONTROLLER.getCurrentDate();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const focusIndex = currentDate.getDate();
    setMonthView(year, month, focusIndex);
});
const mainDaySelect = UI.Select();
header.replaceChildren(prevButton, headerMidDiv, nextButton);
const main = document.createElement('main');
main.style.minHeight = '15em';
const footer = document.createElement('footer');
footer.style.display = 'flex';
footer.style.justifyContent = 'space-between';
footer.style.height = 'max(3em, fit-content)';
footer.style.fontSize = '1.2em';
footer.style.height = '2em';
const footerMenu = document.createElement('div');
footerMenu.style.display = 'flex';
footerMenu.style.gap = '1em';
footerMenu.replaceChildren(themeSelect, openButton, saveButton);
footer.replaceChildren(addEventButton, footerMenu);
CALENDAR.replaceChildren(header, main, footer);
CALENDAR.dataset.name = 'sw-calendar';
UI.setTheme();
setMonthView(todayYear, todayMonth);
const body = document.body;
body.style.margin = '0px';
body.style.height = '100vh';
body.style.display = 'grid';
body.style.placeItems = 'center';
body.replaceChildren(CALENDAR);
