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

    
    
    table.data.filter(row => {

    })

}

function postDate(body){
    //TODO
}


function getWeek(weekNumber) {
    // TODO
}