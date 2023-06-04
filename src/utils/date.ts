const displayINTL = new Intl.DateTimeFormat();
const displayINTLFull = new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
});

export const displayDate = (date: Date) => {
    return displayINTL.format(date);
}

export const displayDateFull = (date: Date) => {
    return displayINTLFull.format(date);
}

export const defaultValueDate = (date: Date | undefined) => {
    if (!date) return undefined
    return date.toISOString().split('T')[0];
}