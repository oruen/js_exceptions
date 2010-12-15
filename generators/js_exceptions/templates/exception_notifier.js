(function() {
  // Cross-browser javascript stacktrace generator
  // https://github.com/emwendelin/javascript-stacktrace
  function printStackTrace(options){var ex=(options&&options.e)?options.e:null;var guess=options?!!options.guess:true;var p=new printStackTrace.implementation();var result=p.run(ex);return(guess)?p.guessFunctions(result):result;}
  printStackTrace.implementation=function(){};printStackTrace.implementation.prototype={run:function(ex){ex=ex||(function(){try{var _err=__undef__<<1;}catch(e){return e;}})();var mode=this._mode||this.mode(ex);if(mode==='other'){return this.other(arguments.callee);}else{return this[mode](ex);}},mode:function(e){if(e['arguments']){return(this._mode='chrome');}else if(window.opera&&e.stacktrace){return(this._mode='opera10');}else if(e.stack){return(this._mode='firefox');}else if(window.opera&&!('stacktrace'in e)){return(this._mode='opera');}
  return(this._mode='other');},instrumentFunction:function(context,functionName,callback){context=context||window;context['_old'+functionName]=context[functionName];context[functionName]=function(){callback.call(this,printStackTrace());return context['_old'+functionName].apply(this,arguments);};context[functionName]._instrumented=true;},deinstrumentFunction:function(context,functionName){if(context[functionName].constructor===Function&&context[functionName]._instrumented&&context['_old'+functionName].constructor===Function){context[functionName]=context['_old'+functionName];}},chrome:function(e){return e.stack.replace(/^[^\(]+?[\n$]/gm,'').replace(/^\s+at\s+/gm,'').replace(/^Object.<anonymous>\s*\(/gm,'{anonymous}()@').split('\n');},firefox:function(e){return e.stack.replace(/(?:\n@:0)?\s+$/m,'').replace(/^\(/gm,'{anonymous}(').split('\n');},opera10:function(e){var stack=e.stacktrace;var lines=stack.split('\n'),ANON='{anonymous}',lineRE=/.*line (\d+), column (\d+) in ((<anonymous function\:?\s*(\S+))|([^\(]+)\([^\)]*\))(?: in )?(.*)\s*$/i,i,j,len;for(i=2,j=0,len=lines.length;i<len-2;i++){if(lineRE.test(lines[i])){var location=RegExp.$6+':'+RegExp.$1+':'+RegExp.$2;var fnName=RegExp.$3;fnName=fnName.replace(/<anonymous function\:?\s?(\S+)?>/g,ANON);lines[j++]=fnName+'@'+location;}}
  lines.splice(j,lines.length-j);return lines;},opera:function(e){var lines=e.message.split('\n'),ANON='{anonymous}',lineRE=/Line\s+(\d+).*script\s+(http\S+)(?:.*in\s+function\s+(\S+))?/i,i,j,len;for(i=4,j=0,len=lines.length;i<len;i+=2){if(lineRE.test(lines[i])){lines[j++]=(RegExp.$3?RegExp.$3+'()@'+RegExp.$2+RegExp.$1:ANON+'()@'+RegExp.$2+':'+RegExp.$1)+' -- '+lines[i+1].replace(/^\s+/,'');}}
  lines.splice(j,lines.length-j);return lines;},other:function(curr){var ANON='{anonymous}',fnRE=/function\s*([\w\-$]+)?\s*\(/i,stack=[],fn,args,maxStackSize=10;while(curr&&stack.length<maxStackSize){fn=fnRE.test(curr.toString())?RegExp.$1||ANON:ANON;args=Array.prototype.slice.call(curr['arguments']);stack[stack.length]=fn+'('+this.stringifyArguments(args)+')';curr=curr.caller;}
  return stack;},stringifyArguments:function(args){for(var i=0;i<args.length;++i){var arg=args[i];if(arg===undefined){args[i]='undefined';}else if(arg===null){args[i]='null';}else if(arg.constructor){if(arg.constructor===Array){if(arg.length<3){args[i]='['+this.stringifyArguments(arg)+']';}else{args[i]='['+this.stringifyArguments(Array.prototype.slice.call(arg,0,1))+'...'+this.stringifyArguments(Array.prototype.slice.call(arg,-1))+']';}}else if(arg.constructor===Object){args[i]='#object';}else if(arg.constructor===Function){args[i]='#function';}else if(arg.constructor===String){args[i]='"'+arg+'"';}}}
  return args.join(',');},sourceCache:{},ajax:function(url){var req=this.createXMLHTTPObject();if(!req){return;}
  req.open('GET',url,false);req.setRequestHeader('User-Agent','XMLHTTP/1.0');req.send('');return req.responseText;},createXMLHTTPObject:function(){var xmlhttp,XMLHttpFactories=[function(){return new XMLHttpRequest();},function(){return new ActiveXObject('Msxml2.XMLHTTP');},function(){return new ActiveXObject('Msxml3.XMLHTTP');},function(){return new ActiveXObject('Microsoft.XMLHTTP');}];for(var i=0;i<XMLHttpFactories.length;i++){try{xmlhttp=XMLHttpFactories[i]();this.createXMLHTTPObject=XMLHttpFactories[i];return xmlhttp;}catch(e){}}},isSameDomain:function(url){return url.indexOf(location.hostname)!==-1;},getSource:function(url){if(!(url in this.sourceCache)){this.sourceCache[url]=this.ajax(url).split('\n');}
  return this.sourceCache[url];},guessFunctions:function(stack){for(var i=0;i<stack.length;++i){var reStack=/\{anonymous\}\(.*\)@(\w+:\/\/([\-\w\.]+)+(:\d+)?[^:]+):(\d+):?(\d+)?/;var frame=stack[i],m=reStack.exec(frame);if(m){var file=m[1],lineno=m[4];if(file&&this.isSameDomain(file)&&lineno){var functionName=this.guessFunctionName(file,lineno);stack[i]=frame.replace('{anonymous}',functionName);}}}
  return stack;},guessFunctionName:function(url,lineNo){try{return this.guessFunctionNameFromLines(lineNo,this.getSource(url));}catch(e){return'getSource failed with url: '+url+', exception: '+e.toString();}},guessFunctionNameFromLines:function(lineNo,source){var reFunctionArgNames=/function ([^(]*)\(([^)]*)\)/;var reGuessFunction=/['"]?([0-9A-Za-z_]+)['"]?\s*[:=]\s*(function|eval|new Function)/;var line="",maxLines=10;for(var i=0;i<maxLines;++i){line=source[lineNo-i]+line;if(line!==undefined){var m=reGuessFunction.exec(line);if(m&&m[1]){return m[1];}else{m=reFunctionArgNames.exec(line);if(m&&m[1]){return m[1];}}}}
  return'(?)';}};


  // Small ajax library
  // http://borisding.com/bajax
  var bajax=(function(){var action={init:function(option){attr=option;this.checkURL();this.initAjax();},checkURL:function(){if(typeof attr.url=="undefined"){alert(error.e002);return false;}else if(attr.url==null||attr.url==""){alert(error.e003);return false;}},filteredData:function(){var data;if(typeof attr.data!="undefined"){if(attr.data!=""){data=attr.data+"&rid="+Math.random();}else{data="rid="+Math.random();}}else{data="rid="+Math.random();}
  return data;},checkType:function(){var type;switch(attr.type){case"xml":case"json":return attr.type;break;default:return"text";}},postMethod:function(){var url=attr.url;var data=this.filteredData();xhr.open("POST",url,true);xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");xhr.send(data);},getMethod:function(){var url=attr.url+"?"+this.filteredData();if(this.checkType()=="xml"){if(xhr.overrideMimeType){xhr.overrideMimeType("text/xml");}}
  xhr.open("GET",url,true);xhr.send(null);},retrieveResult:function(){if(xhr.readyState==4){if(xhr.status==404){alert(error.e404);}
  if(xhr.status==408){alert(error.e408);}
  if(xhr.status==200||xhr.status==304){var responseData;if(typeof attr.type!="undefined"&&bajax.checkType()=="xml"){responseData=xhr.responseXML;}else if(typeof attr.type!="undefined"&&bajax.checkType()=="json"){responseData=eval("("+xhr.responseText+")");}
  else{responseData=xhr.responseText;}
  attr.callback(responseData);}}},decideMethod:function(){xhr.onreadystatechange=this.retrieveResult;if(typeof attr.method!="undefined"){switch(attr.method){case"POST":this.postMethod();break;default:this.getMethod();}}else{this.getMethod();}},initAjax:function(){xhr=this.createXHR();if(xhr==null){alert(error.eoo4);return false;}else if(xhr.readyState!=0){xhr.abort();}
  this.decideMethod();},createXHR:function(){var XHR=null;if(typeof XMLHttpRequest!="undefined"){XHR=new XMLHttpRequest();return XHR;}else if(window.ActiveXObject){var arrayMSXml=["MSXML2.XMLHttp.6.0","MSXML2.XMLHttp.3.0"];var i=0;var lengthMSXml=arrayMSXml.length;while(i<lengthMSXml){try{XHR=new ActiveXObject(arrayMSXml[i]);return XHR;}catch(xhrError){}
  i++;}}
  throw new Error("Failed to create XHR object!");},loader:function(tagID,loader){document.getElementById(tagID).innerHTML=loader;},clearLoader:function(tagID){document.getElementById(tagID).innerHTML="";},serialized:function(formId){var arrayInput=Array();var form=document.getElementById(formId);var i=0;while(i<form.elements.length){var field=form.elements[i];switch(field.type){case"button":case"submit":case"reset":break;case"text":case"hidden":case"password":arrayInput.push(this.encodeValue(field.name,field.value));break;case"radio":case"checkbox":if(!field.checked){break;}
  default:if(field.type=="select-one"){arrayInput.push(this.encodeValue(field.name,field.options[field.selectedIndex].value));}else if(field.type=="select-multiple"){var mSn=0;for(var j=0;j<form.elements[field.name].length;j++){if(form.elements[field.name].options[j].selected==true){mSn++;var mName=field.name+mSn;arrayInput.push(this.encodeValue(mName,form.elements[field.name].options[j].value));}}}else{arrayInput.push(this.encodeValue(field.name,field.value));}}
  i++;}
  return arrayInput.join("&");},encodeValue:function(name,val){var input=encodeURIComponent(name);input+="=";input+=encodeURIComponent(val);return input;}};return action;})();var error={e404:"ERROR 404: Page was not found!",e408:"ERROR 408: Request Timeout! Please try again.",e000:"ERROR: 'id' is undefined!",e001:"ERROR: 'id' is null or empty!",e002:"ERROR: 'url' is undefined!",e003:"ERROR: 'url' is null or empty!",eoo4:"ERROR: Your browser does not support XHR object!"};var attr=null;var xhr=null;

  window.ExceptionNotifier = {};
  $.extend(ExceptionNotifier, {
    notify: function (e) {
      if ( typeof(ExceptionNotifierOptions) !== 'undefined' && (typeof(ExceptionNotifierOptions.logErrors) !== 'undefined') && !ExceptionNotifierOptions.logErrors ) { return; }

      e = this.formatStringError(e);
      e['Browser'] = navigator.userAgent;
      e['Page'] = location.href;

      // Format stack trace
      e.Stack = printStackTrace({e: e, guess: false}).join("\n");

      this.send(e);
      return false;
    },

    send: function(error) {
      var params = [];
      for (var attr in error) {
        params.push(attr + "=" + encodeURIComponent(error[attr]) + '');
      }

      bajax.init({ url: "/js_exceptions", data: params.join("&"), method: "POST"});
    },

    // If error is a string, convert it to a stub of error object
    formatStringError: function (error) {
      if (typeof error == 'string') {
        var old = error;
        error = {
          toString: function () { return old; }
        };
        error.message = old;
      }
      return error;
    },

    // Listens window.onError
    errorHandler: function(msg, url, l) {
      var e = {
        message: msg,
        fileName: url,
        lineNumber: l
      };
      ExceptionNotifier.notify(e);
      return false;
    },

    // Removes listener
    killEvent: function (event) {
      if (!event) { return; }
      event.cancelBubble = true;
      if (event.stopPropagation) { event.stopPropagation(); }
      if (event.preventDefault) { event.preventDefault(); }
    }
  });
  window.onerror = ExceptionNotifier.errorHandler;
})();

