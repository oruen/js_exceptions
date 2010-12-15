class JsExceptionsGenerator < Rails::Generator::Base
  def manifest
    record do |m|
      %w(exception_notifier.js notifying_start.js notifying_stop.js).each do |name|
        m.template name, 'public/javascripts/' + name
      end
    end
  end
end
