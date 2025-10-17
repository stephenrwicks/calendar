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
// This probably needs a timespan
type ScheduledEvent = {
    startTime: Date; // Here we use Date more like a timestamp. Then track back to the date in the calendar that it refers to. Since here we have month/day.
    endTime: Date;
    name: string;
    description: string;
}

// It would have been fun to use the new Temporal API for this project but it's not widely available yet ~October 2025

let LIVETIME: Date;
const initTime = new Date();
const todayYear = initTime.getFullYear() as Year;
const todayMonth = (initTime.getMonth() + 1) as Month;
const todayDay = initTime.getDate();
let currentView: 'month' | 'day' = 'month';

const CONTROLLER = (() => {
    const STARTYEAR = 2000;
    const ENDYEAR = 2050;

    // Initializes where to start on the calendar
    let _currentYear = todayYear;
    let _currentMonth = todayMonth;
    let _currentDay = todayDay;

    const CALENDAROBJECT: Partial<CalendarObject> = {};
    let d = new Date(STARTYEAR, 0, 1);
    while (d.getFullYear() <= ENDYEAR) {
        const year = d.getFullYear() as Year;
        CALENDAROBJECT[year] ??= {
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
        const month = d.getMonth() + 1 as Month;
        const x = CALENDAROBJECT[year];
        if (x) x[month].push(new Date(d))
        d.setDate(d.getDate() + 1);
    }

    // Month is 1 indexed
    const getMonth = (year: Year, month: Month) => {
        const x = CALENDAROBJECT[year];
        if (x) return x[month];
        throw new Error('Invalid year/month');
    };

    const getDay = (year: Year, month: Month, day: number) => {
        const m = getMonth(year, month);
        // Subtract one to offset 0-index so we can actually look up by day 
        // (day 1 gets position 0 in array)
        const d = m[day - 1];
        if (!d) throw new Error('Invalid day');
        return d;
    };

    const isSameDay = (start: Date, end: Date) => {
        const isYearSame = end.getFullYear() === start.getFullYear();
        const isMonthSame = end.getMonth() === start.getMonth();
        const isDaySame = end.getDate() === start.getDate();
        return (isYearSame && isMonthSame && isDaySame);
    }
    const getDatesBetweenStartAndEnd = (start: Date, end: Date): Date[] => {
        if (Number(end) > Number(start)) throw new Error('End time is before start time?');
        if (isSameDay(start, end)) return [];
        const dates: Date[] = [];
        let d = end;
        // Just walk backward one day and push until you get the start day
        while (true) {
            d.setDate(d.getDate() - 1);
            if (d.getFullYear() < STARTYEAR) break;
            if (isSameDay(start, d)) break;
            dates.push(new Date(d));
        }
        return dates;
    };

    // Start/end
    const addEvent = (event: ScheduledEvent) => {
        // Find all dates that are affected based on time span,
        // then add them to the map. That way we can look them up individually
        // e.g. Day X has no start/end events but has 3 events running through it
        const timeSpan = () => {

        };

        eventMap.set(event.startTime, event);
    };
    const removeEvent = () => {

    };

    const getEventsByDay = () => {
        // Need a way to look backward for time span? We have end dates, so...
        // You can loop, but seems like there is a better way, like just add to each day
    };

    // We need it so that any given day can look up itself, however
    // days with events spanning across them will not see with this, so maybe time span actually works best
    // if I'm in a "timespan" day, how do I get events related to it? That means every timespanned day must immediately get mapped.
    const eventMap: Map<Date, ScheduledEvent> = new Map();

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
        if (year > ENDYEAR || year < STARTYEAR) throw new Error();
        if (month < 1 || month > 12) throw new Error();
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
        setCurrentDate,
        getCurrentDate,
        getMonth,
        goToNextMonth,
        goToPrevMonth,
        goToNextDay,
        goToPrevDay,
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
    // This always goes to "tomorrow" because current day is not set to day view
    const date = CONTROLLER.goToNextDay();
    //const date = CONTROLLER.getCurrentDate();
    //const monthArray = CONTROLLER.getMonth((date.getFullYear() as Year), (date.getMonth() + 1 as Month))
    setDayView(date);
});
prevDayButton.addEventListener('click', () => {
    const date = CONTROLLER.goToPrevDay();
    //const date = CONTROLLER.getCurrentDate();
    //const monthArray = CONTROLLER.getMonth((date.getFullYear() as Year), (date.getMonth() + 1 as Month))
    setDayView(date);
});

const addEventButton = document.createElement('button');
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

const calendar = document.createElement('section');

const daysOfTheWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const monthsOfTheYear = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const handleDayFocusIn = (e: Event) => (e.target as HTMLButtonElement).style.boxShadow = '0px 0px 0px 2px inset darkblue';
const handleDayFocusOut = (e: Event) => (e.target as HTMLButtonElement).style.boxShadow = '';
const handleDayMouseIn = (e: Event) => (e.target as HTMLButtonElement).style.backgroundColor = '#fafafa';
const handleDayMouseOut = (e: Event) => (e.target as HTMLButtonElement).style.backgroundColor = 'unset'; // isToday breaks


const handleDayKeydown = (e: KeyboardEvent, i: number, day: Date, dayButtons: HTMLButtonElement[]) => {
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
    // Let's pass in the month so we can easily get back?
    // You probably don't need month here if we have controller handling that (and it's cleaner that way)
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
        if (i % 4 !== 0) return hourDiv;
        hourDiv.textContent = `${i}:00`;
        hourDiv.style.textAlign = 'center';
        hourDiv.style.fontSize = '.8em';
        return hourDiv;
    }));

    const eventDivs = Array.from({ length: 10 }, () => {
        const div = document.createElement('div');
        // This isn't quite good because the hour borders can't go down. Unless we don't care
        div.style.gridColumn = 'span 24';
        div.style.height = '40px';
        return div;
    })

    dayGrid.append(...eventDivs);



    topDiv.append(dateHeader, addEventButton, dayNavigationButtonDiv);
    wrapper.append(topDiv, dayGrid);
    return wrapper;

};


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
        const dayButton = document.createElement('button');
        dayButton.type = 'button';
        dayButton.style.backgroundColor = 'unset';
        dayButton.style.outline = 'unset';
        dayButton.style.border = 'unset';
        dayButton.style.borderRadius = '0px';
        dayButton.style.padding = '8px';
        dayButton.style.outline = '1px solid #ccc';
        //dayButton.onclick = () => console.log(day);
        dayButton.addEventListener('focusin', handleDayFocusIn)
        dayButton.addEventListener('focusout', handleDayFocusOut);
        dayButton.addEventListener('pointerenter', handleDayMouseIn);
        dayButton.addEventListener('pointerleave', handleDayMouseOut);
        dayButton.addEventListener('dblclick', () => setDayView(day));
        dayButton.addEventListener('keydown', (e) => handleDayKeydown(e, i, day, dayButtons));

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

    topDiv.append(dateHeader, monthNavigationButtonDiv);
    monthGrid.append(...dayButtons);
    wrapper.append(topDiv, monthGrid);
    // Maybe want to return an object containing the element and days
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
        // array.prototype.at() is widely available at this point. Why are we not using negative indices always?
        // Here I can work from the end if I need to easily.
        dayButtons.at(focusIndex)?.focus();
    }
}
const setDayView = (day: Date) => {
    currentView = 'day';
    CONTROLLER.setCurrentDate(day);
    calendar.replaceChildren(getDayView(day));
};

// Init
setMonthView(todayYear, todayMonth);

main.replaceChildren(calendar);
pageWrapper.replaceChildren(header, main);
body.replaceChildren(pageWrapper);

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
