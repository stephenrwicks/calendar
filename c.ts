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

const currentTime = new Date();
const todayYear = currentTime.getFullYear() as Year;
const todayMonth = (currentTime.getMonth() + 1) as Month;
const todayDay = currentTime.getDate();
let currentView: 'month' | 'day' = 'month';

const CONTROLLER = (() => {
    const STARTYEAR = 2000;
    const ENDYEAR = 2050;


    // Initializes where to start on the calendar
    let _currentYear = todayYear;
    let _currentMonth = todayMonth;

    const dateObject: Partial<CalendarObject> = {};
    let d = new Date(STARTYEAR, 0, 1);
    while (d.getFullYear() <= ENDYEAR) {
        const year = d.getFullYear() as Year;
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
        const month = d.getMonth() + 1 as Month;
        const x = dateObject[year];
        if (x) x[month].push(new Date(d))
        d.setDate(d.getDate() + 1);
    }


    // This should return events for each day
    const getMonth = (year: Year, month: Month) => {
        const x = dateObject[year];
        if (x) return x[month];
        throw new Error('Invalid year/month');
    };

    const getDay = (year: Year, month: Month, day: number) => {
        const m = getMonth(year, month);
        // Subtract one to offset 0-index so we can actually look up by day
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
        // Find all dates that are affected based on time span
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




    const goToMonth = (year: Year, month: Month) => {
        if (year > ENDYEAR) throw new Error();
        if (month < 1 || month > 12) throw new Error();
        _currentYear = year;
        _currentMonth = month;
        return { year: _currentYear, month: _currentMonth };
    };

    // CURRENT object with the getters is probably overcomplicated. We can just return a new object
    const goToNextMonth = () => {
        if (_currentMonth >= 12) return goToMonth((_currentYear + 1 as Year), 1);
        return goToMonth(_currentYear, (_currentMonth + 1 as Month));
    };

    const goToPrevMonth = () => {
        if (_currentMonth <= 1) return goToMonth((_currentYear - 1 as Year), 12);
        return goToMonth(_currentYear, (_currentMonth - 1 as Month));
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


//const handle

const dayFocusIn = (e: FocusEvent) => (e.target as HTMLButtonElement).style.boxShadow = '0px 0px 0px 2px lightblue';
const dayFocusOut = (e: FocusEvent) => (e.target as HTMLButtonElement).style.boxShadow = '';


const getDayView = (day: Date) => {


};


const getMonthView = (month: Date[]) => {

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

    // Local arrays of buttons may make keyboard control very tricky
    const dayButtons = month.map((day, i) => {
        const dayButton = document.createElement('button');
        dayButton.type = 'button';
        //dayButton.tabIndex = 0;
        dayButton.style.backgroundColor = 'unset';
        dayButton.style.outline = 'unset';
        dayButton.style.border = 'unset';
        dayButton.style.borderRadius = '0px';
        dayButton.style.padding = '8px';
        dayButton.style.outline = '1px solid #ccc';
        dayButton.onclick = () => console.log(day);
        dayButton.addEventListener('focusin', dayFocusIn)
        dayButton.addEventListener('focusout', dayFocusOut);

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

const setMonthView = (year: Year, month: Month) => {
    currentView = 'month';
    calendar.replaceChildren(getMonthView(CONTROLLER.getMonth(year, month)));
}

// Init
setMonthView(todayYear, todayMonth);

section.replaceChildren(buttonDiv, calendar);
main.replaceChildren(section);
pageWrapper.replaceChildren(header, main);
body.replaceChildren(pageWrapper);

(async () => {
    while (true) {
        const dateTime = `${new Date().toLocaleString()}`;
        title.textContent = dateTime;
        h1.textContent = dateTime; // This is super basic but we can run it through a function to look cool
        await new Promise(r => setTimeout(r, 1000));
    }
})();
