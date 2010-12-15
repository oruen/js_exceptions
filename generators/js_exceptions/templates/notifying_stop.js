} catch (e) {
  if (/Opera|Webkit/.test(navigator.userAgent)) {
    ExceptionNotifier.notify(e);
  }
  throw(e);
}
