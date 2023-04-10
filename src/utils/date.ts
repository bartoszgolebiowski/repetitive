
const dayWeekINTL = new Intl.DateTimeFormat("pl-PL", {
    weekday: "long"
});

const displayINTL = new Intl.DateTimeFormat("pl-PL", {
    hourCycle: "h23",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    day: "numeric",
    month: "numeric",
});

const remaningMinutesINTL = new Intl.NumberFormat("pl-PL")

export const displayDate = (date: Date) => {
    return displayINTL.format(date);
}

export const displayRemaining = (from: Date, to: Date) => {
    const diff = to.getTime() - from.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return remaningMinutesINTL.formatRange(hours * 60 + minutes, hours * 60 + minutes);
}

export const displayDayWeek = (day: number) => {
    return dayWeekINTL.format(new Date(2021, 1, day));
}

export const compensateTimezone = (date: Date) => {
    const clone = new Date(date.getTime());
    clone.setHours(clone.getHours() - clone.getTimezoneOffset() / 60);
    return clone;
}

export const getMonday = (date: Date) => {
    const clone = new Date(date.getTime());
    const day = clone.getDay();
    const diff = clone.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(clone.setDate(diff))
}

export const getSunday = (date: Date) => {
    const clone = new Date(date.getTime());
    const day = clone.getDay();
    const diff = clone.getDate() - day + (day === 0 ? 0 : 7);
    return new Date(clone.setDate(diff))
}

export const getNextDay = (date: Date) => {
    const clone = new Date(date.getTime());
    return new Date(clone.setDate(date.getDate() + 1));
}

export const getPrevDay = (date: Date) => {
    const clone = new Date(date.getTime());
    return new Date(clone.setDate(date.getDate() - 1));
}

export const substract24Hours = (date: Date) => {
    const clone = new Date(date.getTime());
    clone.setHours(clone.getHours() - 24);
    return clone;
}

export const add24Hours = (date: Date) => {
    const clone = new Date(date.getTime());
    clone.setHours(clone.getHours() + 24);
    return clone;
}

export const getBeginningOfDay = (date: Date) => {
    const clone = new Date(date.getTime());
    clone.setHours(0, 0, 0, 0);
    clone.setMinutes(clone.getMinutes() - clone.getTimezoneOffset());
    return clone;
}

export const getEndOfDay = (date: Date) => {
    const clone = new Date(date.getTime());
    clone.setHours(0, 0, 0, 0);
    clone.setDate(clone.getDate() + 1);
    clone.setMinutes(clone.getMinutes() - clone.getTimezoneOffset());
    // UTC 
    return clone;
}

export const compensateDate = (date: Date, timezoneOffsetFromBrowser: number) => {
    const clone = new Date(date.getTime());
    clone.setMinutes(clone.getMinutes() + timezoneOffsetFromBrowser);
    return clone;
}

export const getMondayAndSunday = (date: Date): [Date, Date] => {
    const monday = getMonday(date);
    const sunday = getSunday(date);
    return [monday, sunday];
}

export const getFromMondayToSunday = (date: Date): [Date, Date, Date, Date, Date, Date, Date] => {
    const [monday, sunday] = getMondayAndSunday(date);
    return [
        monday,
        getNextDay(monday),
        getNextDay(getNextDay(monday)),
        getNextDay(getNextDay(getNextDay(monday))),
        getNextDay(getNextDay(getNextDay(getNextDay(monday)))),
        getNextDay(getNextDay(getNextDay(getNextDay(getNextDay(monday))))),
        sunday
    ];
}

export const HOURS = Array.from({ length: 24 }, (_, i) => i);
export const DAYS = {
    1: displayDayWeek(1),
    2: displayDayWeek(2),
    3: displayDayWeek(3),
    4: displayDayWeek(4),
    5: displayDayWeek(5),
    6: displayDayWeek(6),
    0: displayDayWeek(7),
};

const now = new Date();
export const stableNow = now 