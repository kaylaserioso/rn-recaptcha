import React from 'react';
import { WebView } from 'react-native-webview';
import PropTypes from 'prop-types';

// fix https://github.com/facebook/react-native/issues/10865
const patchPostMessageJsCode = `(${String(function() {
  var originalPostMessage = window.postMessage;
  var patchedPostMessage = function(message, targetOrigin, transfer) {
    originalPostMessage(message, targetOrigin, transfer);
  };
  patchedPostMessage.toString = function() {
    return String(Object.hasOwnProperty).replace('hasOwnProperty', 'postMessage');
  };
//   window.postMessage = patchedPostMessage;
  window.postMessage = function(patchedPostMessage) {
    window.ReactNativeWebView.postMessage(patchedPostMessage);
  }
})})();`;

const generateTheWebViewContent = (siteKey, language) => {
  var recaptchaSource = "https://recaptcha.google.cn/recaptcha/api.js";
  if (language != null) {
    recaptchaSource = "https://recaptcha.google.cn/recaptcha/api.js?hl='" + language + "'";
    console.log("heeerrreee");
    console.log(recaptchaSource);
  } else {
    console.log("no language specified")
  }

  const originalForm =
    '<!DOCTYPE html><html><head>' +
    '<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="ie=edge">' +
    '<script src=' + recaptchaSource + '></script>' +
    '<script type="text/javascript"> var onloadCallback = function() { }; ' +
    'var onDataCallback = function(response) { console.log(response); window.postMessage(response);  }; ' +
    'var onDataExpiredCallback = function(error) {  window.postMessage("expired"); }; ' +
    'var onDataErrorCallback = function(error) {  window.postMessage("error"); } </script>' +
    '</head><body>' +
    '<div style="text-align: center"><div class="g-recaptcha" style="display: inline-block"' +
    'data-sitekey="' +
    siteKey +
    '" data-callback="onDataCallback" ' +
    'data-expired-callback="onDataExpiredCallback" ' +
    'data-error-callback="onDataErrorCallback"></div></div></body></html>';
  return originalForm;
};

const RNReCaptcha = ({ onMessage, siteKey, style, url, language }) => (
  <WebView
    originWhitelist={['*']}
    mixedContentMode={'always'}
    onMessage={onMessage}
    javaScriptEnabled
    injectedJavaScript={patchPostMessageJsCode}
    automaticallyAdjustContentInsets
    style={[{ backgroundColor: 'transparent', width: '100%' }, style]}
    source={{
      html: generateTheWebViewContent(siteKey, language),
      baseUrl: `${url}`,
    }}
  />
);

RNReCaptcha.propTypes = {
  onMessage: PropTypes.func,
  siteKey: PropTypes.string.isRequired,
  style: PropTypes.any,
  url: PropTypes.string,
  language: PropTypes.string
};

RNReCaptcha.defaultProps = {
  onMessage: () => {},
  url: '',
  language: ''
};

export default RNReCaptcha;
