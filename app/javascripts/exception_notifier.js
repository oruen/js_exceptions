(function() {
  window.ExceptionNotifier = {};
  $.extend(ExceptionNotifier, {
    notify: function (e) {
      if ( typeof(ExceptionNotifierOptions) !== 'undefined' && (typeof(ExceptionNotifierOptions.logErrors) !== 'undefined') && !ExceptionNotifierOptions.logErrors ) { return; }
      e = this.transformError(e);
      $.extend(e, {
        'Browser': navigator.userAgent,
        'Page': location.href
      });
      if (typeof(ExceptionNotifierOptions.sendHtml) === 'undefined' || ExceptionNotifierOptions.sendHtml ) {
        e['HTML Content'] = document.documentElement.innerHTML.replace(/\n/g, "\n     ").replace(/\t/g, "     ");
      }
      if (Error && new Error().stack) { e.Stack = new Error().stack; }
      if (!e.subject) { e.subject = 'ApplicationError on: ' + window.location.href; }
      this.promtAndSend(e);
      return false;
    },
    transformError: function (error) {
      if (typeof error == 'string') {
        var old = error;
        error = {
          toString: function () {
            return old;
          }
        };
        error.message = old;
      }
      if ($.browser.opera && error.message) {
        var error_arr = error.message.match('Backtrace');
        if (error_arr) {
          var message = error.message;
          error.message = message.substring(0, error_arr.index);
          error.backtrace = message.substring(error_arr.index + 11, message.length);
        }
      }
      return error;
    },
    errorHandler: function (msg, url, l) {
      var e = {
        message: msg,
        fileName: url,
        lineNumber: l
      };
      ExceptionNotifier.notify(e);
      return false;
    },
    promtAndSend: function (error) {
      this.createSendFunction(error);
      this.send();
    },
    createSendFunction: function (error) {
      this.send = function (event) {
        var params = {
          error: {}
        },
            description;
        params.error.subject = error.subject;
        if ((description = document.getElementById('_error_text'))) {
          error['User Description'] = description.value;
        }

        this.create(error);
      };
    },
    send: function () { },
    create: function (params) {
      $.ajax({
        url: "/js_exceptions",
        type: "POST",
        dataType: "text/html",
        data: $.param(params)
      });
    },
    generateContent: function (params) {
      var content = [];
      for (var attr in params) {
        if (params.hasOwnProperty(attr) && attr != 'toString' && attr != 'HTML Content') { content.push(attr + ':\n     ' + params[attr]); }
      }
      if (params['HTML Content']) { content.push('HTML Content' + ':\n     ' + params['HTML Content']); }
      return content.join('\n');
    },
    generateMessage: function (error) {
      return error.message ? error.message : "";
    },
    killEvent: function (event) {
      if (!event) { return; }
      event.cancelBubble = true;
      if (event.stopPropagation) { event.stopPropagation(); }
      if (event.preventDefault) { event.preventDefault(); }
    }
  });
  window.onerror = ExceptionNotifier.errorHandler;
})();

