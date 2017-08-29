module.exports.getpost = (req) => {
    return new Promise((resolve, reject) => {
        //POST data's three stages of metamorphosis : chunks-->data-->post
        var data =[];   //this is in querystring format...
        req.on('data', (chunk) => { //metamorphosis...
            data += chunk;  //chunks build up data
        })
        req.on('end', () => {       //requests process done, write into database
            //turn querystring to JSON format, a readable POST, format will be like {"username":"idiot","password":"hallo"}
            //var post = querystring.parse(data);
            resolve(data);
        });
        req.on('error', (err) => {
            throw err;
        });
    });
}
