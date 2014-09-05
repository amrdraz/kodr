/* globals moduleForModel,test,visit,andThen,stubEndpointForHttpRequest,equal,find,$,setResolver,emq,wait */
App.setupForTesting();
App.injectTestHelpers();

emq.globalize();
setResolver(Ember.DefaultResolver.create({
    namespace: App
}));

function loginUser(username, password) {
    visit('/login')
        .fillIn('#identification', username)
        .fillIn('#password', password)
        .click('.submit');
}

function logout() {
    var session = App.__container__.lookup('session:custom');
    if (session.get('isAuthenticated')) {
        session.invalidate();
    }
}

Ember.Test.registerHelper('selectFrom',
    function(app, selector, value, description) {
        // choose an option
        find(selector).val(value);
        // trigger the change
        find(selector).change();
        // assert the selected option
        equal(find(selector + " option:selected").val(), value, description || "makes the selection");
        // promise
        return wait();
    }
);

function exists(selector) {
    return !!find(selector).length;
}

function stubEndpointForHttpRequest(url, json) {
    $.mockjax({
        url: url,
        dataType: 'json',
        responseText: json
    });
}

$.mockjaxSettings.logging = false;
$.mockjaxSettings.responseTime = 0;
