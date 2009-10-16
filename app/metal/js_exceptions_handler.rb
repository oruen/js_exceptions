# Allow the metal piece to run in isolation
require(File.dirname(__FILE__) + "/../../config/environment") unless defined?(Rails)

class JsExceptionsHandler
  def self.call(env)
    if env["PATH_INFO"] =~ /^\/js_exceptions/
      request = Rack::Request.new(env)
      JsExceptions::Notifier.deliver_exception_notification request, request.params
      [200, {"Content-Type" => "text/html"}, ["ok"]]
    else
      [404, {"Content-Type" => "text/html"}, ["Not Found"]]
    end
  end
end
