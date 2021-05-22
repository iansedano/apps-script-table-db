function doGet(e) {
  sLog("GET received")
  sLog(e.parameters)
  const query = e.parameters.q
  const fields = e.parameters.fields

  if (query.length > 1 || fields.length > 1) {
    return response ({
      status: 400,
      message: "check query and field syntax"
    })
  }

  result = route('GET', query, {"fields": fields})

  return response({
    "query": query[0],
    "fields": fields[0]
  })
}

function doPost(e) {
  sLog("POST received")
  sLog(e.postData)
  sLog(e.parameters)

  const query = e.parameters.q[0]
  if (typeof(query) !== 'string') {
    sLog("ERROR: invalid query")
    throw  "invalid query"
  }
  const payload = JSON.parse(e.postData.contents)

  result = route('POST', query, payload)

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
// https://github.com/tanaikech/taking-advantage-of-Web-Apps-with-google-apps-script#corsinwebapps
// https://x-team.com/blog/google-apps-script-rest/