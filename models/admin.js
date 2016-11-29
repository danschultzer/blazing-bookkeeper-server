var mongoose = require('mongoose'),
  Schema = mongoose.Schema

var adminSchema = new Schema({
  email: { type: String, required: true, unique: true },
  github_id: { type: String, required: true, unique: true },
  access_token: { type: String, required: true, unique: true },
  created_at: Date,
  updated_at: Date
})

adminSchema.pre('save', function (next) {
  // get the current date
  var currentDate = new Date()

  // change the updated_at field to current date
  this.updated_at = currentDate

  // if created_at doesn't exist, add to that field
  if (!this.created_at)
    { this.created_at = currentDate }

  next()
})

var Admin = mongoose.model('Admin', adminSchema)

module.exports = Admin
