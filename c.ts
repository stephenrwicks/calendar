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


type Theme = {
    primaryColor: string;
    secondaryColor: string;
    darkAccentColor: string;
    lightAccentColor: string;
    black: string;
    white: string;
    gray: string;
    lightGray: string;
    alert: string;
    border: string;
    boxShadow: string;
    insetBoxShadow: string;
    dropShadow: string;
}

// It would have been fun to use the new Temporal API for this project but it's not widely available yet ~October 2025

const STARTYEAR = 2000;
const ENDYEAR = 2050;
const initTime = new Date();
const todayYear = initTime.getFullYear() as Year;
const todayMonth = (initTime.getMonth() + 1) as Month;
const todayDay = initTime.getDate();
let currentView: 'month' | 'day' = 'month';
const daysOfTheWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const monthsOfTheYear = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];


const CONTROLLER = (() => {
    // Initializes where to start on the calendar
    let _currentYear = todayYear;
    let _currentMonth = todayMonth;
    let _currentDay = todayDay;

    const isSameDay = (a: Date, b: Date) => {
        if (a.getDate() !== b.getDate()) return false;
        if (a.getMonth() !== b.getMonth()) return false;
        if (a.getFullYear() !== b.getFullYear()) return false;
        return true;
    };

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

    // This maps to the wrong day sometimes? Can't reproduce
    // Check minutes in diff scenarios.
    const addEvent = (scheduledEvent: ScheduledEvent) => {
        const dates = getDatesInRange(scheduledEvent as ScheduledEvent);
        scheduledEvent.color ??= UI.getRandomColor();
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

    const exportEvents = () => {
        // The original references of the ScheduledEvent objects are never lost,
        // so we can just add each to a single set over and over if one occurs in multiple days
        // so the "duplicates" are removed (They are not really duplicates)
        const eventSet: Set<ScheduledEvent> = new Set();
        for (const set of EVENTMAP.values()) {
            for (const event of set) {
                eventSet.add(event);
            }
        }
        // Could easily build a csv with this data
        return [...eventSet].map(event => {
            return {
                name: event.name,
                description: event.description,
                start: event.startTime.toISOString(),
                end: event.endTime.toISOString(),
            };
        });
    };

    const getEventsForDay = (day: Date) => EVENTMAP.get(day.toISOString().slice(0, 10)) ?? new Set();

    const getCurrentDate = (): Date => new Date(_currentYear, _currentMonth - 1, _currentDay, 0);

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
        exportEvents,
    };

})();

// This could be something cooler like a createTheme() function that is flexible. 
// But that will have to be in another project
const THEMES = {
    mint: (() => {
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
        };
    })(),
    midnight: (() => {
        const font = 'italic 16px Georgia, Cambria, "Times New Roman", Times, serif';
        const black = 'hsl(220, 20%, 10%)';
        const white = 'hsl(220, 30%, 97%)';
        const primaryColor = 'midnightblue';
        const secondaryColor = 'aliceblue';
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
        };
    })(),
} as const;

const UI = {
    setTheme(theme: keyof typeof THEMES = 'mint') {
        // Inject CSS properties into parent.
        // This is a cool pattern. We are basically creating a stylesheet.
        // But deeper levels of the DOM could override by injecting a different theme.
        // Child elements consume CSS variables which allows the theme to change natively
        for (const [key, value] of Object.entries(THEMES[theme])) {
            calendarContainer.style.setProperty(`--${key}`, value)
        }

        // Could make this more interesting by injecting all themes, but prefixing them, like --mint--${key}
        // Then some property like data-theme controls the variable to use
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
    Button(type: 'button' | 'submit' = 'button') {
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
        return label;
    },
    Textbox() {
        const input = document.createElement('input')
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
    Dialog(color: string) {
        const dialog = document.createElement('dialog');
        dialog.style.borderColor = color;
        // Cool way to force ::backdrop without using it. max(100vh, 100vw) ensures it takes up the entire screen
        // You can also use 100vmax but I am not sure of the browser support
        // color-mix to get some transparency
        dialog.style.boxShadow = '0px 0px 0px max(100vh, 100vw) color-mix(in srgb, var(--lightAccentColor) 50%, hsla(0, 0%, 0%, 0.5))';
        dialog.style.padding = '1em';
        dialog.style.backgroundColor = 'var(--white)';
        dialog.addEventListener('cancel', dialog.remove);
        return dialog;
    },
    MonthButton() {

    },
    Confirm(parent: HTMLElement, message: string): Promise<boolean> {
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
            div.textContent = message;
            const buttonDiv = document.createElement('div');
            buttonDiv.style.display = 'flex';
            buttonDiv.style.gap = '1em';
            buttonDiv.style.justifyContent = 'end';
            const okButton = UI.Button();
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
    }
};


// These don't need to be recreated
const navigationButtonDiv = document.createElement('div');
navigationButtonDiv.style.display = 'flex';
navigationButtonDiv.style.gap = '1em';
const nextButton = UI.Button();
const prevButton = UI.Button();
nextButton.textContent = '>';
prevButton.textContent = '<';
navigationButtonDiv.replaceChildren(prevButton, nextButton);
nextButton.addEventListener('click', () => {
    nextButton.style.filter = '';
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
    prevButton.style.filter = '';
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
addEventButton.textContent = 'Add Event';
addEventButton.addEventListener('click', (e) => {
    e.preventDefault();
    eventDialog();
});

const eventDialog = async (scheduledEvent?: ScheduledEvent) => {
    const dialog = UI.Dialog(scheduledEvent?.color ?? 'var(--primaryColor)');
    calendarContainer.append(dialog);
    const { form, getResult } = eventForm(scheduledEvent);
    dialog.append(form);
    dialog.showModal();
    const result = await getResult;
    if (!result) return dialog.remove();
    if (scheduledEvent) {
        CONTROLLER.updateEvent(scheduledEvent, result);
    }
    else {
        CONTROLLER.addEvent(result);
    }
    dialog.remove();
    const d = result.startTime;
    CONTROLLER.setCurrentDate(d);
    if (currentView === 'day') setDayView(d);
    else setMonthView(d.getFullYear() as Year, d.getMonth() + 1 as Month);
};

// Maybe pointless decoupling here though. Could just put this inside dialog with no cost
const eventForm = (scheduledEvent?: ScheduledEvent) => {
    // Clean pattern using withResolvers and a form and exporting them separately
    const { promise, resolve } = Promise.withResolvers<Omit<ScheduledEvent, 'color'> | null>();
    const form = document.createElement('form');
    form.style.display = 'flex';
    form.style.flexFlow = 'column';
    form.style.gap = '1em';

    const nameDiv = document.createElement('div');
    const nameLabel = UI.Label();
    const nameInput = UI.Textbox();
    nameDiv.style.display = 'grid';
    nameLabel.htmlFor = 'name-input';
    nameLabel.textContent = 'Name';
    nameInput.id = 'name-input';
    nameInput.required = true;
    nameInput.pattern = '\\S.*';
    const descriptionDiv = document.createElement('div');
    const descriptionLabel = UI.Label();
    const descriptionInput = UI.Textarea();
    descriptionDiv.style.display = 'grid';
    descriptionLabel.htmlFor = 'description-input';
    descriptionLabel.textContent = 'Description';
    descriptionInput.id = 'description-input';

    const defaultStart = CONTROLLER.getCurrentDate();
    const defaultEnd = new Date(defaultStart.getTime() + 3600000); // One hour
    const { datePickerEl: startDateEl, getDate: getStartTime, setDate: setStartTime, setCustomValidity } = datePicker('Start', scheduledEvent?.startTime ?? defaultStart);
    const { datePickerEl: endDateEl, getDate: getEndTime, setDate: setEndTime } = datePicker('End', scheduledEvent?.endTime ?? defaultEnd);

    // Some validation, still not right
    // This is really bad and hard to use. maybe just setValidity instead
    form.addEventListener('datechange', (e: Event) => {
        const startTime = Number(getStartTime());
        const endTime = Number(getEndTime());
        const isValid = endTime > startTime;
        setCustomValidity('');
        if (isValid) return;
        setCustomValidity('Start date must be before the end date.');
    });

    if (scheduledEvent) {
        nameInput.value = scheduledEvent.name ?? '';
        descriptionInput.value = scheduledEvent.description ?? '';
    }

    const okButton = UI.Button('submit');
    const cancelButton = UI.Button();
    okButton.textContent = 'OK';
    cancelButton.textContent = 'Cancel';
    const buttonDiv = document.createElement('div');
    buttonDiv.style.display = 'flex';
    buttonDiv.style.justifyContent = 'end';
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
        let dayState = Number(daySelect.value);
        // BUG
        const numberOfDays = CONTROLLER.getNumberOfDaysInMonth(new Date(Number(yearSelect.value), Number(monthSelect.value), 1));
        dayState = dayState > numberOfDays ? numberOfDays : dayState;
        daySelect.replaceChildren();
        for (let d = 1; d <= numberOfDays; d++) {
            daySelect.add(new Option(String(d), String(d)));
        }

        daySelect.value = String(dayState);
        fieldset.dispatchEvent(new CustomEvent('datechange', { bubbles: true }));
    });


    timeDiv.replaceChildren(hourSelect, ':', minuteSelect, amPmSelect)
    const dayDiv = document.createElement('div');
    dayDiv.style.display = 'flex';
    dayDiv.style.gap = '.5em';
    dayDiv.append(monthSelect, daySelect, yearSelect);
    fieldset.replaceChildren(legend, dayDiv, timeDiv);

    return {
        datePickerEl: fieldset,
        getDate,
        setDate,
        setCustomValidity: (error: string) => monthSelect.setCustomValidity(error)
    };
};


const goBackToMonthButton = UI.Button();
goBackToMonthButton.textContent = 'Back';
goBackToMonthButton.addEventListener('click', () => {
    goBackToMonthButton.style.filter = '';
    goBackToMonthButton.style.boxShadow = '';
    const date = CONTROLLER.getCurrentDate();
    setMonthView((date.getFullYear() as Year), ((date.getMonth() + 1) as Month), date.getDate() - 1);
});

const handleDayFocusIn = (e: Event) => (e.target as HTMLButtonElement).style.boxShadow = 'var(--insetBoxShadow)';
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
    const topDiv = document.createElement('div');
    topDiv.style.fontSize = '1.5em';
    topDiv.style.display = 'flex';
    topDiv.style.justifyContent = 'space-between';

    const dateHeader = document.createElement('div');
    dateHeader.textContent = day.toISOString().split('T')[0];

    // 96 is 24 * 4 (15 minute increments)
    const dayGrid = document.createElement('div');
    dayGrid.style.display = 'grid';
    dayGrid.style.rowGap = '2em';
    dayGrid.style.gridTemplateColumns = 'repeat(96, 1fr)';
    dayGrid.style.minHeight = '12em';
    dayGrid.style.padding = '.5em 0px';
    dayGrid.style.outline = 'var(--border)';

    let gridColumnStart = 1;
    for (const time of ['12AM', '4AM', '8AM', '12PM', '4PM', '8PM']) {
        const hourDiv = document.createElement('div');
        hourDiv.style.gridColumn = `${gridColumnStart} / span 16`;
        // Increment by 16 because we are dividing 96 into 6 equal parts
        gridColumnStart = gridColumnStart + 16;
        hourDiv.textContent = time;
        hourDiv.style.fontSize = '.8em';
        hourDiv.style.userSelect = 'none';
        dayGrid.append(hourDiv);
    }

    for (const event of CONTROLLER.getEventsForDay(day)) {
        const eventButton = document.createElement('button');
        eventButton.type = 'button';
        eventButton.style.border = 'unset';
        eventButton.style.outline = 'unset';
        eventButton.style.borderRadius = '0px';
        eventButton.style.display = 'grid';
        eventButton.style.placeItems = 'center';
        eventButton.style.height = '3em';
        eventButton.style.cursor = 'pointer';
        eventButton.style.backgroundColor = event.color ?? UI.getRandomColor();
        eventButton.style.gridColumn = getGridColumnForEvent(day, event);
        eventButton.textContent = event.name;
        eventButton.addEventListener('pointerenter', () => eventButton.style.filter = 'brightness(1.2)');
        eventButton.addEventListener('pointerleave', () => eventButton.style.filter = '');
        eventButton.addEventListener('dblclick', () => eventDialog(event));
        eventButton.addEventListener('keydown', (e) => {
            e.preventDefault();
            if (e.key === 'Enter') {
                eventDialog(event)
            }
            else if (e.key === 'Backspace' || e.key === 'Delete') {
                UI.Confirm(calendarContainer, `Delete this event: ${event.name}?`).then(bool => {
                    if (!bool) return;
                    CONTROLLER.removeEvent(event);
                    setDayView(day);
                });

            }
        });
        eventButton.addEventListener('focusin', handleDayFocusIn)
        eventButton.addEventListener('focusout', handleDayFocusOut);
        dayGrid.append(eventButton);
    }

    topDiv.append(goBackToMonthButton, dateHeader, navigationButtonDiv);
    return { dayGrid, topDiv }
};
// Add 1 here to adjust for 1 index in css grid
const getTimeAs15MinuteIncrement = (d: Date) => Math.floor(d.getHours() * 4) + Math.floor(d.getMinutes() / 15) + 1;
const getGridColumnForEvent = (currentDay: Date, event: ScheduledEvent): string => {
    // Event is assumed to be occuring on currentDay if we got here
    const isStartToday = CONTROLLER.isSameDay(event.startTime, currentDay);
    const isEndToday = CONTROLLER.isSameDay(event.endTime, currentDay);
    if (!isStartToday && !isEndToday) return '1 / -1';
    if (isStartToday && !isEndToday) return `${getTimeAs15MinuteIncrement(event.startTime)} / -1`;
    if (!isStartToday && isEndToday) return `1 / ${getTimeAs15MinuteIncrement(event.endTime)}`;
    return `${getTimeAs15MinuteIncrement(event.startTime)} / ${getTimeAs15MinuteIncrement(event.endTime)}`;
}


const getMonthView = (month: Date[]) => {

    const y = month[0].getFullYear();
    const m = month[0].getMonth();

    const topDiv = document.createElement('div');
    topDiv.style.fontSize = '1.5em';
    topDiv.style.display = 'flex';
    topDiv.style.justifyContent = 'space-between';

    const dateHeader = document.createElement('div');
    dateHeader.textContent = `${monthsOfTheYear[m]} ${y}`;

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
        dayButton.addEventListener('focusin', (e) => {
            handleDayFocusIn(e);
            CONTROLLER.setCurrentDate(day)
        })
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
            num.style.width = '1em';
            num.style.height = '1em';
            num.style.fontSize = '.8em';
            num.style.color = 'red';
            num.style.outline = '1px solid red';
            num.style.borderRadius = '50%';
            num.textContent = String(eventsForThisDay.size);
            dayButton.append(num);
        }
        return dayButton;
    });

    topDiv.append(dateHeader, navigationButtonDiv);
    monthGrid.append(...dayButtons);

    return {
        topDiv,
        monthGrid,
        dayButtons
    };
};


const setMonthView = (year: Year, month: Month, focusIndex?: number) => {
    currentView = 'month';
    //CONTROLLER.setCurrentDate(new Date(year, month - 1, 1));
    const { monthGrid, topDiv, dayButtons } = getMonthView(CONTROLLER.getMonth(year, month));
    header.replaceChildren(topDiv);
    main.replaceChildren(monthGrid);
    if (typeof focusIndex === 'number') {
        // Here I can work from the end easily using negative .at()
        dayButtons.at(focusIndex)?.focus();
    }
}
const setDayView = (day: Date) => {
    currentView = 'day';
    CONTROLLER.setCurrentDate(day);
    const { topDiv, dayGrid } = getDayView(day);
    header.replaceChildren(topDiv);
    main.replaceChildren(dayGrid);
};

const themeSelect = UI.Select();
for (const key in THEMES) {
    themeSelect.add(new Option(key, key))
}
themeSelect.addEventListener('change', () => UI.setTheme(themeSelect.value as keyof typeof THEMES ?? 'mint'));

const logButton = UI.Button();
logButton.textContent = 'Log Events';
logButton.addEventListener('click', () => console.log(CONTROLLER.exportEvents()));

const calendarContainer = document.createElement('div');
calendarContainer.style.width = 'min(700px, 100vw)';
calendarContainer.style.display = 'flex'
calendarContainer.style.flexFlow = 'column';
calendarContainer.style.gap = '2em';
calendarContainer.style.padding = '3em';
calendarContainer.style.boxShadow = 'var(--boxShadow)';
calendarContainer.style.backgroundColor = 'var(--secondaryColor)';
calendarContainer.style.font = 'var(--font)';

const header = document.createElement('header');
const main = document.createElement('main');
main.style.height = '15em';
const footer = document.createElement('footer');
footer.style.display = 'flex';
footer.style.justifyContent = 'space-evenly';
footer.style.height = 'max(3em, fit-content)';
footer.style.fontSize = '1.2em';
footer.append(addEventButton, logButton, themeSelect);
calendarContainer.replaceChildren(header, main, footer);
calendarContainer.dataset.name = 'sw-calendar';


// Init
UI.setTheme();
setMonthView(todayYear, todayMonth);
const body = document.body;
body.style.margin = '0px';
body.style.height = '100vh';
body.style.display = 'grid';
body.style.placeItems = 'center';
body.replaceChildren(calendarContainer);




// TODO
// Delete events
// Fix text stretching event
// Colored text
// UI for month button
// Offset time with negative marginLeft so it's more accurate

// Known bugs
// Event showing up on wrong day. I don't know why or when
// Switching months in date picker is messed up