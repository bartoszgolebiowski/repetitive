const displayINTL = new Intl.DateTimeFormat();

export const displayDate = (date: Date) => {
    return displayINTL.format(date);
}

export const defaultValueDate = (date: Date | undefined) => {
    if (!date) return undefined
    return date.toISOString().split('T')[0];
}