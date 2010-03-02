module JsExceptions
  class Notifier < ActionMailer::Base
    @@sender_address = %("JS Exception Notifier" <jsexception.notifier@default.com>)
    cattr_accessor :sender_address
  
    @@exception_recipients = []
    cattr_accessor :exception_recipients
  
    @@email_prefix = "[ERROR] "
    cattr_accessor :email_prefix
  
    self.template_root = "#{File.dirname(__FILE__)}/../views"
  
    def self.reloadable?() false end
  
    def exception_notification request, exception, data = {}
      content_type "text/plain"
  
      subject    "#{email_prefix} #{exception["subject"]}"
  
      recipients exception_recipients
      from       sender_address
  
      body       data.merge({ 
                    :exception => exception, :host => (request.env["HTTP_X_FORWARDED_HOST"] || request.env["HTTP_HOST"]),
                    :backtrace => exception["content"], :remote_ip => request.ip,
                    :rails_root => rails_root, :data => data,
                 })
    end
  
    private
  
      def sanitize_backtrace(trace)
        re = Regexp.new(/^#{Regexp.escape(rails_root)}/)
        trace.map { |line| Pathname.new(line.gsub(re, "[RAILS_ROOT]")).cleanpath.to_s }
      end
  
      def rails_root
        @rails_root ||= Pathname.new(RAILS_ROOT).cleanpath.to_s
      end
  
  end
end
