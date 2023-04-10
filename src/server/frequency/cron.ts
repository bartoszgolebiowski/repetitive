type HOURS = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "13" | "14" | "15" | "16" | "17" | "18" | "19" | "20" | "21" | "22" | "23";
type DAYS = "0" | "1" | "2" | "3" | "4" | "5" | "6";

const MINUTES_IN_HOUR = 60;
const ZERO_HOUR = 0;
const TWENTY_FOUR_HOURS = 24;

const isHourNegative = (hour: number) => hour < ZERO_HOUR;
const isHourPositive = (hour: number) => !isHourNegative(hour);
const isHourOver23 = (hour: number) => hour >= TWENTY_FOUR_HOURS;
const isHourUnder23 = (hour: number) => !isHourOver23(hour)
const add24Hours = (hour: number) => hour + TWENTY_FOUR_HOURS;
const subtract24Hours = (hour: number) => hour - TWENTY_FOUR_HOURS;

const NUMBER_TO_DAY = {
    "0": "SUN",
    "1": "MON",
    "2": "TUE",
    "3": "WED",
    "4": "THU",
    "5": "FRI",
    "6": "SAT",
}

export const isHours = (value: unknown): value is HOURS[] => {
    if (!Array.isArray(value)) {
        return false;
    }
    for (const item of value) {
        if (!isHour(item)) {
            return false;
        }
    }
    if (value.length === 0) return false;
    return true;
}

const isHour = (value: unknown): value is HOURS => {
    return typeof value === "string" && /^(0?[0-9]|1[0-9]|2[0-3])$/.test(value);
}

export const isDays = (value: unknown): value is DAYS[] => {
    if (!Array.isArray(value)) {
        return false;
    }
    for (const item of value) {
        if (!isDay(item)) {
            return false;
        }
    }
    if (value.length === 0) return false;
    return true;
}

const isDay = (value: unknown): value is DAYS => {
    if (typeof value !== "string") return false;
    return Object.keys(NUMBER_TO_DAY).includes(value);
}

export const convertCronToUTC = (hours: HOURS[], days: DAYS[], timezoneOffset: number): string[] => {
    const offset = timezoneOffset / MINUTES_IN_HOUR;

    const hoursNumber = hours.map((hour) => parseInt(hour));
    const daysNumber = days.map((day) => parseInt(day));

    const hoursUTCNumber = hoursNumber.map((hour) =>
        hour + offset
    );

    const isSomeHourNegative = hoursUTCNumber.some(isHourNegative);
    const isSomeHourOver24 = hoursUTCNumber.some(isHourOver23);

    // it means that Local Date with offset compenstation is in the prev day
    if (isSomeHourNegative) {
        // here we store all positive hours
        const positiveHours = hoursUTCNumber.filter(isHourPositive);
        // here we store all negative hours and add 24 hours to them 
        const negativeHoursPlus24 = hoursUTCNumber.filter(isHourNegative).map(add24Hours);
        // here we store all hours ([positive] and [negative + 24 hours])
        const allHours = [...positiveHours, ...negativeHoursPlus24];
        const lowestDay = Math.min(...daysNumber);
        const lowestDayMinus1 = lowestDay === 0 ? 6 : lowestDay - 1;

        // remove duplicates from negativeHoursPlus24 and positiveHours
        const hoursForFirstDay = negativeHoursPlus24.filter((hour) => !positiveHours.includes(hour));
        // store duplicates from negativeHoursPlus24 and positiveHours
        const hoursForLastDay = allHours.filter((hour) => !negativeHoursPlus24.includes(hour))

        if (negativeHoursPlus24.length) {
            return [
                createCron(hoursForFirstDay, [lowestDayMinus1]),
                createCron(allHours, filterHighestDay(days)),
                createCron(hoursForLastDay, getHighestDay(days)),
            ].filter(Boolean) as string[];
        }

        return [
            createCron(negativeHoursPlus24, [lowestDayMinus1]),
            createCron(allHours, days),
        ].filter(Boolean) as string[];
    }

    // it means that Local Date with offset compenstation is in the next day
    if (isSomeHourOver24) {
        // here we store all hours that are over 24 hours and subtract 24 hours from them
        const hoursOver24Minus24 = hoursUTCNumber.filter(isHourOver23).map(subtract24Hours);
        // here we store all hours that are under 24 hours
        const hoursUnder24 = hoursUTCNumber.filter(isHourUnder23)
        // here we store all hours ([over 24 hours - 24 hours] and [under 24 hours])
        const allHours = [...hoursOver24Minus24, ...hoursUnder24]
        const highestDay = Math.max(...daysNumber);
        const highestDayPlus1 = highestDay === 6 ? 0 : highestDay + 1;

        // remove duplicates from hoursOver24Minus24 and hoursUnder24
        const hoursForFirstDay = hoursOver24Minus24.filter((hour) => !hoursUnder24.includes(hour));
        // store duplicates from hoursOver24Minus24 and hoursUnder24
        const hoursForLastDay = allHours.filter((hour) => !hoursOver24Minus24.includes(hour));

        if (hoursOver24Minus24.length) {
            return [
                createCron(hoursForLastDay, getLowestDay(days)),
                createCron(allHours, filterLowestDay(days)),
                createCron(hoursForFirstDay, [highestDayPlus1]),
            ].filter(Boolean) as string[];
        }

        return [
            createCron(hoursOver24Minus24, [highestDayPlus1]),
            createCron(allHours, days),
        ].filter(Boolean) as string[];
    }

    return [createCron(hoursUTCNumber, days)].filter(Boolean) as string[];
}

const createCron = (hours: string[] | number[], days: string[] | number[]) => {
    if (hours.length === 0 || days.length === 0) return null;
    const dayNames = days.map((day) => NUMBER_TO_DAY[day as keyof typeof NUMBER_TO_DAY]);
    return `0 0 ${hours.join(",")} ? * ${dayNames.join(",")} *`
}

const filterHighestDay = (days: DAYS[]) => {
    const daysNumber = days.map((day) => parseInt(day));
    const highestDay = Math.max(...daysNumber);
    return days.filter((day) => day !== String(highestDay));
}

const getHighestDay = (days: DAYS[]) => {
    const daysNumber = days.map((day) => parseInt(day));
    const highestDay = Math.max(...daysNumber);
    return days.filter((day) => day === String(highestDay))
}

const filterLowestDay = (days: DAYS[]) => {
    const daysNumber = days.map((day) => parseInt(day));
    const lowestDay = Math.min(...daysNumber);
    return days.filter((day) => day !== String(lowestDay));
}

const getLowestDay = (days: DAYS[]) => {
    const daysNumber = days.map((day) => parseInt(day));
    const lowestDay = Math.min(...daysNumber);
    return days.filter((day) => day === String(lowestDay));
}