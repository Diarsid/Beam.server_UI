var $ = require('jquery');

var storage =
    require("./../../state/store/app-local-storage.js");
var resources =
    require("./../resources/resources.js");

// ----------------------

function ajaxLog(message) {
    console.log("[APP] [AJAX CALL] [JWT REFRESH] " + message);
}

function refreshJwtCall(callbacks) {
    ajaxLog("starts...");
    $.ajax({
        url : resources.jwtRefresh.url,
        method : resources.jwtRefresh.method,
        cache: false,
        beforeSend: function ( xhr ) {
            xhr.setRequestHeader('Authentication', 'Bearer ' + storage.getJwt());
        },
        statusCode : {
            200 : function ( data, statusText, xhr ) {
                ajaxLog("...new jwt: " + xhr.getResponseHeader("jwt"));
                callbacks.onSuccess(xhr.getResponseHeader("jwt"));
            },
            401 : function ( xhr, statusText, errorThrown ) {
                callbacks.onUnauthenticated();
            },
            404 : function ( xhr, statusText, errorThrown ) {
                callbacks.onFail("Resource not found.");
            }
        }
    });
}

module.exports = refreshJwtCall;

