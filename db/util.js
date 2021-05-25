// TODO regen IDs

function setDateToMidnight(inputDate, nextDay) {
    const [year, month, date] = [
        inputDate.getFullYear(),
        inputDate.getMonth(),
        inputDate.getDate()
    ]

    if (nextDay === false) {
        return new Date(year, month, date)
    } else if (nextDat === true) {
        const output =  new Date(year, month, date)
        output.setDate(output.getDate() + 1)
        return output
    }

}

function yearMonthDateMatch(dateA, dateB) {
    const [yearA, monthA, dayOfMonthA] = [
        dateA.getFullYear(),
        dateA.getMonth(),
        dateA.getDate()
    ]

    const [yearB, monthB, dayOfMonthB] = [
        dateB.getFullYear(),
        dateB.getMonth(),
        dateB.getDate()
    ]

    if (
        yearA === yearB &&
        monthA === monthB &&
        dayOfMonthA === dayOfMonthB
    ) return true

    return false
}