// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

let submitButton = document.getElementById('submit'), domain;

// On click action
submitButton.onclick = function(element) {
    var value = document.getElementsByName('experimentBackend')[0].value + '@' + document.getElementsByName('variantBackend')[0].value;

    //Get cookie expiration date
    var date = new Date();
    date.setDate(365);

    //Handle backend cookie
    chrome.cookies.set({
        url: domain,
        name: 'laquesis',
        value: value,
        expirationDate: Math.round(date.getTime()/1000)
    }, function (cookie) {
        window.close();
    });
};

// Execute on every Popup Load
window.onload = function() {
    // BACKEND
    chrome.tabs.getSelected(null, function(tab) {
        //Get domain
        var currentURL = tab.url,
            domainParsed,
            value,
            valueParsed;

        domainParsed = currentURL.match(/^http[s]?:\/\/([^\/]+)/gm);

        if (domainParsed && (domainParsed.length === 1)) {
            domain = domainParsed[0];
        }

        if (!domain) {
            return;
        }

        chrome.runtime.getBackgroundPage(function(eventPage) {
            //Handle backend cookie
            chrome.cookies.get({
                url: domain,
                name: 'laquesis'
            }, function (cookie) {
                if (!cookie) {
                    document.getElementsByName('experimentBackend')[0].setAttribute('value', '');
                    document.getElementsByName('variantBackend')[0].setAttribute('value', '');
                    return;
                }

                value = cookie.value;

                //Extract only first experiment and variation11
                const regex = /[#]?([^@]+)@{1,}([^#]+)/gm;

                valueParsed = regex.exec(value);

                if (!valueParsed || (valueParsed.length !== 3)) {
                    document.getElementsByName('experimentBackend')[0].setAttribute('value', '');
                    document.getElementsByName('variantBackend')[0].setAttribute('value', '');
                    return;
                }

                //Populate popup with experiment and variation
                document.getElementsByName('experimentBackend')[0].setAttribute('value', valueParsed[1].toLowerCase());
                document.getElementsByName('variantBackend')[0].setAttribute('value', valueParsed[2].toLowerCase());
            });
        });
    });
};
