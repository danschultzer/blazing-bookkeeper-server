(function () {
  var files = []

  function init () {
    var fileListComponent = Vue.extend({}) // eslint-disable-line no-undef
    new Vue({ // eslint-disable-line no-new, no-undef
      el: '#receiptWindow',
      data: {
        files: files,
        highlight: false
      },
      components: {
        'file-list-component': fileListComponent
      }
    })

    document.body.querySelector('#try-demo').addEventListener('click', function (event) {
      event.preventDefault()
      SmoothScrolling.eventHandler(event)
    })

    document.body.querySelectorAll('form[data-remote]').forEach(function (form) {
      var submit = function () {
        if (form.getAttribute('data-submitting')) {
          console.log('Form is already being submitted')
          return false
        }

        if (form.querySelector('[name="document"]').files[0]) {
          form.setAttribute('data-submitting', 'true')

          var formData = new window.FormData(form)
          var request = new window.XMLHttpRequest()
          var file = {
            index: 0,
            file: {
              name: form.querySelector('[name="document"]').files[0].name
            },
            done: false,
            progressBar: 0,
            result: {}
          }
          files.splice(0, 1, file)
          var interval = setInterval(function () {
            if (file.progressBar < 50) {
              file.progressBar += Math.random() * (5 - 0) + 0
            } else {
              clearInterval(interval)
            }
          }, 200)
          request.onreadystatechange = function () {
            if (request.readyState === request.DONE) {
              file.done = true
              file.progressBar = 100
              form.removeAttribute('data-submitting')
              try {
                var json = JSON.parse(request.responseText)
                if (json.success) {
                  file.result.parsed = json.results
                } else {
                  file.result.error = json.error
                }
              } catch (error) {
                window.alert(error.message)
              }
            }
          }
          request.open('POST', form.action)
          request.send(formData)
        }
      }

      form.querySelector('[type="file"]').addEventListener('change', function () {
        submit()
      })

      form.addEventListener('submit', function (event) {
        event.preventDefault()
        submit()
      })
    })
  }

  if (['complete', 'loaded', 'interactive'].indexOf(document.readyState)) {
    init()
  } else {
    window.addEventListener('DOMContentLoaded', init, false)
  }
})()

var SmoothScrolling = {
  last_event_interval: false,
  tween_distance: 30,

  configureEventHandlers: function () {
    var links = document.getElementsByTagName('a')
    for (var i = 0; i < links.length; i++) {
      var link = links[i]
      if (link.href && link.href.indexOf('#') > -1) {
        link.addEventListener('click', SmoothScrolling.eventHandler)
      }
    }
  },

  eventHandler: function (event) {
    var destinationHash = event.target.hash.substr(1)
    var destinationElement = document.getElementById(destinationHash)

    if (!destinationElement) return

    clearInterval(SmoothScrolling.last_event_interval)

    var destinationY = destinationElement.getBoundingClientRect().top + window.page_y_offset
    var tweenDistance = SmoothScrolling.tween_distance
    var interval = 'SmoothScrolling.scrollViewport(' +
                      tweenDistance + ', ' +
                      destinationY + ', ' +
                      '\'' + destinationHash + '\')'
    SmoothScrolling.last_event_interval = setInterval(interval, 10)

    event.preventDefault()
    event.stopPropagation()
  },

  scrollViewport: function (distance, destinationY, destinationHash) {
    var priorPositionY = window.page_y_offset

        // Don't scroll too far
    if ((priorPositionY + distance) > destinationY) {
      distance = (priorPositionY + distance) - destinationY
    }

    window.scrollTo(0, priorPositionY + distance)

        // If we're there or can't get any closer because of the viewport's
        // size, stop!
    if ((window.page_y_offset >= destinationY) || (window.page_y_offset === priorPositionY)) {
      clearInterval(SmoothScrolling.last_event_interval)
      window.location.hash = destinationHash
    }
  }
}
