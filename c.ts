type Year = 2000 | 2001 | 2002 | 2003 | 2004 | 2005 | 2006 | 2007 | 2008 | 2009 |
    2010 | 2011 | 2012 | 2013 | 2014 | 2015 | 2016 | 2017 | 2018 | 2019 |
    2020 | 2021 | 2022 | 2023 | 2024 | 2025 | 2026 | 2027 | 2028 | 2029 |
    2030 | 2031 | 2032 | 2033 | 2034 | 2035 | 2036 | 2037 | 2038 | 2039 |
    2040 | 2041 | 2042 | 2043 | 2044 | 2045 | 2046 | 2047 | 2048 | 2049 | 2050;
type Month = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
type DateObject = {
    [K in Year]: {
        [K in Month]: Date[];
    }
}
// This probably needs a timespan, do it later, maybe
type ScheduledEvent = {
    startTime: Date; // Here we use Date more like a timestamp. Then track back to the date in the calendar that it refers to. Since here we have month/day.
    endTime: Date;
    name: string;
    description: string;
}
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
        h1.textContent = dateTime; // This is super basic but we can run it through a function to look cool
        await new Promise(r => setTimeout(r, 1000));
    }
})();


const calendarController = (() => {
    const STARTYEAR = 2000;
    const ENDYEAR = 2050;
    const EVENTMAP: Map<Date, ScheduledEvent> = new Map();
    const currentTime = new Date();
    // Initializes where to start on the calendar
    let _currentYear = currentTime.getFullYear() as Year;
    let _currentMonth = (currentTime.getMonth() + 1) as Month;
    // Could just put these getters in returned object
    const CURRENT: { year: Year; month: Month } = {
        get year() {
            return _currentYear;
        },
        get month() {
            return _currentMonth;
        }
    };

    const dateObject: Partial<DateObject> = {};
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

    const addEvent = (year: Year, month: Month, day: number) => {

    };

    const goToMonth = (year: Year, month: Month) => {
        if (year > ENDYEAR) throw new Error();
        if (month < 1 || month > 12) throw new Error();
        _currentYear = year;
        _currentMonth = month;
        return CURRENT;
    };

    const goToNextMonth = () => {
        if (CURRENT.month >= 12) return goToMonth((CURRENT.year + 1 as Year), 1);
        return goToMonth(CURRENT.year, (CURRENT.month + 1 as Month));
    };

    const goToPrevMonth = () => {
        if (CURRENT.month <= 1) return goToMonth((CURRENT.year - 1 as Year), 12);
        return goToMonth(CURRENT.year, (CURRENT.month - 1 as Month));
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



const getMonthView = (month: Date[]) => {
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


const setMonthView = (year: Year, month: Month) => calendar.replaceChildren(getMonthView(calendarController.getMonth(year, month)));
setMonthView(2025, 10);

section.replaceChildren(buttonDiv, calendar);
main.replaceChildren(section);
body.replaceChildren(h1, main);