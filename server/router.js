function doGet(e) {
  const query = e.parameters.q
  const fields = e.parameters.fields

  if (query.length > 1 || fields.length > 1) {
    return response ({
      status: 400,
      message: "check query and field syntax"
    })
  }

  return response({
    "query": query[0],
    "fields": fields[0]
  })

  // route('GET', query, {"fields": fields})
}

function doPost(e) {
  sLog(e.postData)
  sLog(e.parameters)
  return response({"postData": e.postData, "postParams": e.parameters})
}

function response(obj) {
  console.log(obj)
  if (typeof(obj) === 'object' && obj !== null){
    return ContentService
      .createTextOutput(JSON.stringify(obj))
  } else {
    throw "invalid response, must be object"
  }
  
}

/**
 * q
 *  days
 *      today
 *      date
 *  weeks
 *      thisweek
 *      date
 * 
 * fields
 *  i.e
 *      id, year, month, day, steps, push-ups etc.. or *
 * 
 * LATER
 *  users
 *      name
 *      id
 * 
 * 
 */

/*
let url = 'https://script.google.com/macros/s/[ID]/exec'
let content = {
        method: 'POST',
        body: JSON.stringify({"hello":"1"})
    }
fetch(url, content)
    .then(resp => console.log(resp.json()))
 */