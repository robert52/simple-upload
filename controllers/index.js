//Dependencies
var fs = require('fs');
var path = require('path');
var uid = require('uid2');
var mime = require('mime');

//Constants
var TARGET_PATH = path.resolve(__dirname, '../writable/');
var IMAGE_TYPES = ['image/jpeg', 'image/png'];

module.exports = {
  index: function(req, res, next) {
    res.render('index');
  },
  upload: function(req, res, next) {
    var is;
    var os;
    var targetPath;
    var targetName;
    var tempPath = req.files.file.path;
    //get the mime type of the file
    var type = mime.lookup(req.files.file.path);
    //get the extenstion of the file
    var extension = req.files.file.path.split(/[. ]+/).pop();

    //check to see if we support the file type
    if (IMAGE_TYPES.indexOf(type) == -1) {
      return res.send(415, 'Supported image formats: jpeg, jpg, jpe, png.');
    }

    //create a new name for the image
    targetName = uid(22) + '.' + extension;

    //determin the new path to save the image
    targetPath = path.join(TARGET_PATH, targetName);

    //create a read stream in order to read the file
    is = fs.createReadStream(tempPath);

    //create a write stream in order to write the a new file
    os = fs.createWriteStream(targetPath);

    is.pipe(os);

    //handle error
    is.on('error', function() {
      if (err) {
        return res.send(500, 'Something went wrong');
      }
    });

    //if we are done moving the file
    is.on('end', function() {

      //delete file from temp folder
      fs.unlink(tempPath, function(err) {
        if (err) {
          return res.send(500, 'Something went wrong');
        }

        //send something nice to user
        res.render('image', {
          name: targetName,
          type: type,
          extension: extension
        });

      });//#end - unlink
    });//#end - on.end
  }
};

