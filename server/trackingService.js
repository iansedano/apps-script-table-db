function trackingService(method, path, body) {

    switch (path[0]) {
        case "date":
            switch (method){
                case "GET":
                    return getDate(body.date)
                case "POST":
                    return postDate(body)
            }
                
        case "week":
            switch (method){
                case "GET":
                    return getWeek(body.weekNumber)
                case "POST":
                    throw "can't POST week, POST dates instead"
            }
        default:
            throw "invalid path"
    }

}


function getDate(date) {
    const table = new Table("Tracking")

    const [y, m, d] = getYMDComponentsFromDate(date)

    const [yearIndex, monthIndex, dateIndex] = [
        table.headers.indexOf("year"),
        table.headers.indexOf("month"),
        table.headers.indexOf("day")
    ]

    const output = table.data.filter(row => {
        if (
            y === row[yearIndex] &&
            m === row[monthIndex] &&
            d === row[dateIndex]
        ) return true
        return false
    })

    if (output.length > 1) throw "duplicate result for date!"

    return output
}

function postDate(body){

    const table = new Table("Tracking")

    const [y, m, d] = getYMDComponentsFromDate(body.date)

    const [yearIndex, monthIndex, dateIndex] = [
        table.headers.indexOf("year"),
        table.headers.indexOf("month"),
        table.headers.indexOf("day")
    ]

    if (body.hasOwnProperty("id")) {
        const row = table.getRow(body.id)

        table.headers.forEach((header, i)=> {
            if (body.hasOwnProperty(header)){
                row[i] = body[header]
            }
        })
        table.updateRow(row)
    } else {
        const newRow = table.headers.map(header => {
            if (body.hasOwnProperty(header)) {
                return body[header]
            } else {
                return ""
            }
        })
        table.addRow(newRow)
    }
}


function getWeek(date) {
    
    const table = new Table("Tracking")

    const output = {
        headers: table.headers,
        metadata: table.metadata,
        data:[]
    }

    const weekList = getWeekList(date)

    const weekComponentList = weekList.map(date => {
        return getYMDComponentsFromDate(date)
    })

    const [yearIndex, monthIndex, dateIndex] = [
        table.headers.indexOf("year"),
        table.headers.indexOf("month"),
        table.headers.indexOf("day")
    ]

    output.data = table.data.filter(row => {

        for (let i=0; i!= weekComponentList.length; i++) {
            if (
                row[yearIndex] === date[0] &&
                row[monthIndex] === date[1] &&
                row[dateIndex] === date[2]
            ) return true
        }

        return false

    })

    return output

}