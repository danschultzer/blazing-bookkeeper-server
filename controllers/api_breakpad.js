module.exports = function (db, authenticate) {
  var express = require('express'),
    router = express.Router(),
    uuid = require('node-uuid'),
    Grid = require('gridfs-stream'),
    fs = require('fs'),
    multer = require('multer'),
    upload = multer({ dest: '/tmp/crash-reporter-uploads' }),
    CrashReport = require('../models/crash_report');

  Grid.mongo = db.mongo;
  var gfs = Grid(db.connection.db);

  /**
   * @api {post} /crash-report Create crash report
   * @apiName CreateCrashReport
   * @apiGroup CrashReport
   *
   * @apiParam {String} prod Product name
   * @apiParam {String} ver Product version
   * @apiParam {File} upload_file_minidump Minidump file
   *
   * @apiSuccess {Boolean} success
   */
  router.post('/crash-report', upload.single('upload_file_minidump'), function(req, res, next) {
    var id = uuid.v4(),
      writeStream = gfs.createWriteStream({
        filename: id
      }),
      cb = function(error) {
        if (error)
          return next(error);

        res.send({ "success": true });
        res.end();
      };

      fs.createReadStream(req.file.path).pipe(writeStream);

      writeStream.on("close", function(file) {
        saveReport(req, file, cb);
      });

      writeStream.on("error", function(error) {
        cb(error);
      });
  });

  /**
   * @api {get} /crash-reports List crash reports
   * @apiName GetCrashReports
   * @apiGroup CrashReport
   *
   * @apiSuccess {Array} list
   * @apiSuccess {Integer} count
   */
  router.get('/crash-reports', authenticate, function(req, res, next) {
    CrashReport.find(function(error, reports) {
      if (error)
        return next(error);

      var list = reports.reduce(function(list, item) {
        list[item._id] = item;
        return list;
      }, {});

      res.send({
        "list": list,
        "count": list.length
      });
      res.end();
    });
  });

  /**
   * @api {get} /crash-report/:id Return crash report
   * @apiName GetCrashReport
   * @apiGroup CrashReport
   *
   * @apiSuccess {Id}
   */
  router.get('/crash-report/:id', authenticate, function(req, res, next) {
    CrashReport.findOne({ _id: req.params.id }, function(error, report) {
      if (error)
        return next(error);

      res.send(report);
      res.end();
    });
  });

  /**
   * @api {get} /crash-report/:id/file Return minidump for crash report
   * @apiName GetCrashReportFile
   * @apiGroup CrashReport
   *
   * @apiSuccess {File}
   */
  router.get('/crash-report/:id/file', authenticate, function(req, res, next) {
    CrashReport.findOne({ _id: req.params.id }, function(error, report) {
      if (error)
        return next(error);

      var readStream = gfs.createReadStream({
        filename: report.file
      });

      readStream.on('error', function (error) {
        next(error);
      });

      readStream.pipe(res);
    });
  });

  function saveReport(req, file, cb) {
    var newReport = CrashReport({
      sender: {
        ua: req.headers['user-agent'],
        ip: (req.headers['x-forwarded-for'] || req.connection.remoteAddress)
      },
      product: req.body.prod,
      version: req.body.ver,
      fields: req.body,
      file: file.filename
    });

    newReport.save(function(error) {
      if (error) {
        removeFile(file, function() {
          cb(error);
        });
      } else {
        cb();
      }
    });
  }

  function removeFile(file, cb) {
    if (file) {
      gfs.remove(file, function() {
        cb();
      });
    } else {
      cb();
    }
  }

  return router;
};
