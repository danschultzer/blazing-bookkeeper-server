module.exports = function () {
  var express = require('express')
  var router = express.Router()
  var multer = require('multer')
  var crypto = require('crypto')
  var mime = require('mime')
  var scanner = require('receipt-scanner')

  var storage = multer.diskStorage({
      destination: '/tmp/receipt-uploads',
      filename: function (req, file, cb) {
        crypto.pseudoRandomBytes(16, function (err, raw) {
          cb(null, err ? undefined : (raw.toString('hex') + '.' + mime.extension(file.mimetype)))
        })
      }
    }),
    upload = multer({
      storage: storage,
      fileFilter: function (req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|pdf|tiff|bmp)$/)) {
          return cb(new Error('Only image or pdf files are allowed!'))
        }
        cb(null, true)
      }
    })

  /**
   * @api {post} /receipt Extract information from uploaded file
   * @apiName CreateReceipt
   * @apiGroup Receipt
   *
   * @apiParam {File} document Image or PDF document
   *
   * @apiSuccess {Boolean} success
   * @apiError {String} error Message explaining what went wrong.
   */
  router.post('/receipt', upload.single('document'), function (req, res, next) {
    if (!req.file) {
      throw new Error('Missing file attachment')
    }

    console.log(req.file.path)

    scanner(req.file.path)
      .parse(function (error, results) {
        if (error) {
          return next(error)
        }

        res.send({ 'success': true, 'results': results })
        res.end()
      })
  })

  return router
}
