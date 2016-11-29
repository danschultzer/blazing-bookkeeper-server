module.exports = function (authenticate) {
  var express = require('express')
  var router = express.Router()
  var uuid = require('node-uuid')
  var Grid = require('gridfs-stream')
  var fs = require('fs')
  var multer = require('multer')
  var upload = multer({ dest: '/tmp/bug-reporter-uploads' })
  var BugReport = require('../models/bug_report')

  Grid.mongo = global.config.db.mongo
  var gfs = Grid(global.config.db.connection.db)

  /**
   * @api {post} /bug-report Create bug report
   * @apiName CreateCrashReport
   * @apiGroup CrashReport
   *
   * @apiParam {String} product Product name
   * @apiParam {String} version Product version
   * @apiParam {String} email Sender e-mail
   * @apiParam {String} comments Additional comments
   * @apiParam {String} report_json Report JSON object
   * @apiParam {File} document Image or PDF document
   *
   * @apiSuccess {Boolean} success
   * @apiError {String} error Message explaining what went wrong.
   */
  router.post('/bug-report', upload.single('document'), function (req, res, next) {
    var id = uuid.v4()
    var file
        if (error)
          { return next(error) }
    var cb = function (error) {

        res.send({ 'success': true })
        res.end()
      }

      // Save file if it exists
    if (req.file) {
      file = id + '-' + req.file.originalname
      var writeStream = gfs.createWriteStream({
        filename: file
      })
      writeStream.on('close', function (file) {
        saveReport(req, file, cb)
      })
      writeStream.on('error', function (error) {
        cb(error)
      })
      fs.createReadStream(req.file.path).pipe(writeStream)
    } else {
      saveReport(req, {}, cb)
    }
  })

    /**
     * @api {get} /bug-reports List bug reports
     * @apiName GetCrashReports
     * @apiGroup CrashReport
     *
     * @apiSuccess {Array} list
     * @apiSuccess {Integer} count
     */
  router.get('/bug-reports', authenticate, function (req, res, next) {
    BugReport.find(function (error, reports) {
      if (error)
          { return next(error) }

      var list = reports.reduce(function (list, item) {
        list[item._id] = item
        return list
      }, {})

      res.send({
        'list': list,
        'count': list.length
      })
      res.end()
    })
  })

  /**
   * @api {get} /bug-report/:id Return document
   * @apiName GetBugReport
   * @apiGroup BugReport
   *
   * @apiSuccess {Id}
   */
  router.get('/bug-report/:id', authenticate, function (req, res, next) {
    BugReport.findOne({ _id: req.params.id }, function (error, report) {
      if (error)
        { return next(error) }

      res.send(report)
      res.end()
    })
  })

  /**
   * @api {get} /bug-report/:id/file Return document
   * @apiName GetBugReportFile
   * @apiGroup BugReport
   *
   * @apiSuccess {File}
   */
  router.get('/bug-report/:id/file', authenticate, function (req, res, next) {
    BugReport.findOne({ _id: req.params.id }, function (error, report) {
      if (error)
        { return next(error) }

      var readStream = gfs.createReadStream({
        filename: report.file
      })

      readStream.on('error', function (error) {
        next(error)
      })

      readStream.pipe(res)
    })
  })

  function saveReport (req, file, cb) {
    var newReport = BugReport({
      sender: {
        ua: req.headers['user-agent'] || null,
        ip: (req.headers['x-forwarded-for'] || req.connection.remoteAddress)
      },
      product: req.body.product,
      version: req.body.version,
      email: req.body.email,
      commments: req.body.comments,
      report: req.body.report_json,
      file: file.filename
    })

    newReport.save(function (error) {
      if (error) {
        removeFile(file, function () {
          cb(error)
        })
      } else {
        cb()
      }
    })
  }

  function removeFile (file, cb) {
    if (file) {
      gfs.remove(file, function () {
        cb()
      })
    } else {
      cb()
    }
  }

  return router
}
