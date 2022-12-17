const { google } = require("googleapis");

const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });

numToChar = function (number) {
    var numeric = (number - 1) % 26;
    var letter = chr(65 + numeric);
    var number2 = parseInt((number - 1) / 26);
    if (number2 > 0) {
        return numToChar(number2) + letter;
    } else {
        return letter;
    }
}
chr = function (codePt) {
    if (codePt > 0xFFFF) {
        codePt -= 0x10000;
        return String.fromCharCode(0xD800 + (codePt >> 10), 0xDC00 + (codePt & 0x3FF));
    }
    return String.fromCharCode(codePt);
}


dt = function(){
    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let hours = date_ob.getHours();
    let minutes = date_ob.getMinutes();
    let seconds = date_ob.getSeconds();
    return year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
}


async function getLastMsg(spreadsheetId, sheetName) {
    var sendMsgObj = null;
    try {        
        const client = await auth.getClient();
        const googleSheets = google.sheets({
        version: "v4",
        auth: client
        });
        const getRows = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: sheetName,
        });
        let values = getRows.data.values;
    
        let rows = getRows.data.values[0];
    
        if (values.length > 0) {
            let f = rows.indexOf("STATUS");
            let f1 = rows.indexOf("DATE_SENT");
            let i = values.findIndex(x=>x[f] == "PENDING");
            let val = values[i];
            console.log(f, val);
            let k = i + 1;
            if(val){
                if(val[f] == 'PENDING'){
                    let p = rows.indexOf("MOBILE_NO");
                    let d = rows.indexOf("MESSAGE");
                    let m = rows.indexOf("MEDIA_URL");
                    let b = rows.indexOf("BUTTONS");
                    const l = numToChar(f + 1);
                    const l1 = numToChar(f1 + 1);
                    const df = dt();
                    let mob_no = val[p];
                    let msg_p = val[d];
                    let media_url = val[m];
                    var buttons = val[b];
    
                    sendMsgObj = {
                        number: mob_no.toString(),
                        message: msg_p,
                        media_url: media_url,
                        buttons: buttons,
                        srno: `messages!${l}${k}:${l1}${k}`,
                        dt: df
                    }              
                }  
            }             
        }
    } catch (error) {
       console.log(error, 'error');
    }
    return sendMsgObj;
}


async function updateSheet(spreadsheetId, msg, st) {
    try { 
        console.log(st, 'message status');
        var s = 'PENDING';
        if(st.success){
            s = 'SENT';
        }else{
            if(st.message == 'The receiver number is not exists.'){
                s = 'INVALID MOB';
            }
            if(st.message == 'Failed to send the message.'){
                s = 'FAILED';
            }
        }
        const client = await auth.getClient();
        const googleSheets = google.sheets({
        version: "v4",
        auth: client
        });
        googleSheets.spreadsheets.values.update({
            auth,
            spreadsheetId,
            range: msg.srno,
            valueInputOption: "USER_ENTERED",
            resource: {
                values: [
                    [s, msg.dt]
                ]
            },
        });
    } catch (error) {
        console.log(error);        
    }
}


module.exports = {
    getLastMsg,
    updateSheet
}

