function doGet(e) {
  const query = e.parameters.q
  const fields = e.parameters.fields

  const table = params.table
  const method = params.method
  const ids = params.ids
}

function doPost(e) {
  sLog(e.postData)
  return respond({"OK": 1})
}

function testo() {
  sLog({"test": 1})
}

function respond(response) {
    return ContentService
        .createTextOutput(response)
        .setMimeType(ContentService.MimeType.JSON)
}

function sLog(value) {
  const file = SpreadsheetApp.openById("1uE5sT_84Uv-qiUXdPDPkPJXN4VNEUG6OC3d4arFA-rM");
  const sheet = file.getSheetByName('post_log');
  sheet.appendRow([1,1])
  sheet.appendRow([new Date(), JSON.stringify(value)])
}

/**
 * q
 *  days
 *      now
 *      date
 *  weeks
 *      now
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
let url = 'https://script.google.com/macros/s/AKfycbzcVW64IuVbqsLCRec-QjszGlxzlrcZc392xpSDwsHEhPJWWO0JaZZhNM2IrOoorm61/exec'
let content = {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'no-cors', // no-cors, *cors, same-origin
        headers: {
            'Content-Type': 'application/json'

        },
        body: JSON.stringify({"hello":"1"}) // body data type must match "Content-Type" header
    }

fetch(url, content)
    .then(resp => console.log(resp))
 */