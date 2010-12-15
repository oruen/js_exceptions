class JsExceptionsGenerator < Rails::Generators::Base
  source_root File.expand_path("../../../../generators/js_exceptions/templates", __FILE__)
  
  def install
      %w(exception_notifier.js notifying_start.js notifying_stop.js).each do |name|
        copy_file name, "public/javascripts/" + name
      end
  end
end