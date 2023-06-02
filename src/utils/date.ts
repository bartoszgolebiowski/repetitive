const displayINTL = new Intl.DateTimeFormat("pl-PL", {
    hourCycle: "h23",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    day: "numeric",
    month: "numeric",
});

export const displayDate = (date: Date) => {
    return displayINTL.format(date);
}

export const defaultValueDate = (date: Date | undefined) => {
    if (!date) return undefined
    return date.toISOString().split('T')[0];
}