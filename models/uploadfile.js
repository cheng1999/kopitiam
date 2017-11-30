const formidable = require('formidable'),
      fs = require('fs');

// reference: https://coligo.io/building-ajax-file-uploader-with-node/
module.exports.forrestore = (req, path, filename)=>{
  return new Promise(function(resolve, reject){
    // create an incoming form object
    var form = new formidable.IncomingForm();

    // specify that we want to allow the user to upload multiple files in a single request
    form.multiples = true;

    // store all uploads in the /uploads directory
    form.uploadDir = path; 

    // every time a file has been uploaded successfully,
    // rename it to it's orignal name
    form.on('file', function(field, file) {
      fs.rename(file.path, path+filename);
    });

    // log any errors that occur
    form.on('error', function(err) {
      console.log('An error has occured: \n' + err);
    });

    // once all the files have been uploaded, send a response to the client
    form.on('end', function() {
      resolve();
    });

    // parse the incoming request containing the form data
    form.parse(req);
  });
}
