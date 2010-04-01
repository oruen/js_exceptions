module JsExceptionsHelper
  def js_exceptions_options
    javascript_tag "ExceptionNotifierOptions = {logErrors: #{!controller.consider_all_requests_local}, sendHtml: false };"
  end
end
