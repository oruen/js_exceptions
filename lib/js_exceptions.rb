class JsExceptions
  VERSION = "0.3"
  cattr_accessor :config
  
  class Configuration
    attr_accessor :sender_address
    attr_accessor :exception_recipients
    attr_accessor :email_prefix
    attr_accessor :handler
    
    def initialize
      @sender_address = %("JS Exception Notifier" <jsexception.notifier@default.com>)
      @exception_recipients = []
      @email_prefix = "[ERROR] "
      @handler = :email
    end
  end
  
  def self.configure(&block)
    self.config ||= Configuration.new
    block.call(config)
  end
  
  def self.notify(request, exception, data = {})
    case config.handler
    when :email
      Notifier.deliver_exception_notification(request, exception, data)
    when :hoptoad
      JsHoptoadNotifier.notify(request, exception, data)
    end
  end
  
  class Notifier < ActionMailer::Base
    self.template_root = "#{File.dirname(__FILE__)}/views"

    def self.reloadable?() false end
    def exception_notification request, exception, data = {}
      content_type "text/plain"

      subject    "#{JsExceptions.config.email_prefix.strip} #{exception["message"].strip}"

      recipients JsExceptions.config.exceptions_recipients
      from       JsExceptions.config.sender_address

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
  
  class JsHoptoadNotifier
    class BacktraceLine
      attr_accessor :file
      attr_accessor :line
      attr_accessor :method
      attr_accessor :valid
      
      def initialize(text)
        if match = text.match(/\((.+)\)@(.+)\:(.+)/)
          @method = match[1]
          @file = match[2]
          @line = match[3]
          @valid = true
        end
      end
    end
    
    def self.parse_stack(text)
      text.split("\n").map {|l| BacktraceLine.new(l) }.select {|b| b.valid }
    end
    
    def self.notify(request, exception, data)
      xml = Builder::XmlMarkup.new(:indent => 0)
      xml.instruct!
      result = xml.notice(:version => HoptoadNotifier::API_VERSION) do |b|
        b.tag!("api-key", HoptoadNotifier.configuration.api_key)
        b.notifier do
          b.name "JS Exceptions Notifier"
          b.version JsExceptions::VERSION
          b.url "http://github.com/over/js_exceptions"
        end
        b.error do
          b.class "JS Error"
          b.message exception["message"]
          if exception["Stack"]
            b.backtrace do
              parse_stack(exception["Stack"]).each do |bl|
                b.line(:method => bl.method, :file => bl.file, :number => bl.line)
              end
            end
          end
        end
        b.request do
          b.component
          b.action
          b.url exception["Page"]
          b.tag!("cgi-data") do
            b.var(:key => "browser") { b.text!(exception["Browser"]) }
          end
        end
        b.tag!("server-environment") do
          b.tag!("environment-name", RAILS_ENV)
        end
      end
      
      sender = HoptoadNotifier::Sender.new(HoptoadNotifier.configuration)
      sender.send_to_hoptoad(result.to_s)
    end
  end
  
end
