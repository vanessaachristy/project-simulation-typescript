
export const getLocaleISOString = (): string => {
    let utcDate = new Date()
    let localTs = utcDate.getTime() - utcDate.getTimezoneOffset() * 60 * 1000;
    let localDate = new Date(localTs)
    let localIsoString = new Date(localDate).toISOString()
    return localIsoString
}

