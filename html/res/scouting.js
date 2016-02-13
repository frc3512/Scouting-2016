var fieldNames = {'f_matchNumber':'', 'f_teamNumber':'', 'f_numAutoZone':'0', 'f_numStageBin':'0', 'f_numStepBin':'0', 'f_robotAuton':'', 'f_toteAuton':'', 'f_numOnStep':'0', 'f_disabled':'', 'f_ramp':'', 'f_fouls':'0', 'f_stacks':'0', 'f_dead':'', 'f_tipped':'', 'f_tippedOtherRobot':'', 'f_morePlayerStation':'true', 'f_notes':''};

function supports_html5_storage() {
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
    return false;
  }
}

function marshalData() {
    var map = {};

    map['timestamp'] = Date.now();
    for(var key in fieldNames) {
        if(fieldNames.hasOwnProperty(key)) {

            if(document.getElementsByName(key)[0].type == 'text'
                || document.getElementsByName(key)[0].type == 'number'
                || document.getElementsByName(key)[0].type == 'textarea') {
                map[key] = document.getElementsByName(key)[0].value;
            } else if (document.getElementsByName(key)[0].type == 'checkbox') {
                map[key] = document.getElementsByName(key)[0].checked;
            } else if(document.getElementsByName(key)[0].type == 'radio') {
                elms = document.getElementsByName(key);
                for(i = 0; i < elms.length; i++) {
                    if(elms[i].checked) {
                        map[key] = elms[i].value;
                    }
                }
            }
        }
    }

    for(i = 1; i < 6; i++) {
        map['f_' + i + '_litter'] = document.getElementsByName('f_' + i + '_litter')[0].checked;
        map['f_' + i + '_can'] = document.getElementsByName('f_' + i + '_can')[0].checked;

        elms = document.getElementsByName('f_' + i + '_ntotes');
        for(n = 0; n < elms.length; n++) {
            if(elms[n].checked) {
                map['f_' + i + '_ntotes'] = elms[n].value;
            }
        }
    }

    map['f_scoutName'] = document.getElementsByName('f_scoutName')[0].value;
    return map;
}

function uiResetLocalStorage() {
    var confirmDelete = prompt('Are you sure? If you\'re absolutely sure you know what you\'re doing, enter "DELETE" below to clear the stored data.', '');
    if(confirmDelete == 'DELETE') {
        resetLocalStorage();
        document.getElementById('statusText').innerHTML = 'Cleared local storage';
    } else {
        document.getElementById('statusText').innerHTML = 'Clearing local storage cancelled';
    }
    window.scrollTo(0, 0);
}

function uiClearFields() {
    var clearConfirm = confirm("Are you sure you want to clear the form?");
    if(clearConfirm == true) {
        clearFields();
    }
}

function clearFields() {
    for(var key in fieldNames) {
        if(fieldNames.hasOwnProperty(key)) {
            if(document.getElementsByName(key)[0].type == 'text'
                || document.getElementsByName(key)[0].type == 'number'
                || document.getElementsByName(key)[0].type == 'textarea') {
                document.getElementsByName(key)[0].value = fieldNames[key];
            } else if (document.getElementsByName(key)[0].type == 'checkbox') {
                document.getElementsByName(key)[0].checked = fieldNames[key];
            } else if (document.getElementsByName(key)[0].type == 'radio') {
                elms = document.getElementsByName(key);
                for(i = 0; i < elms.length; i++) {
                    if(fieldNames[key] == elms[i].value) {
                        elms[i].checked = true;
                    }
                }
            }
        }
    }

    for(i = 1; i < 6; i++) {
        document.getElementsByName('f_' + i + '_litter')[0].checked = '';
        document.getElementsByName('f_' + i + '_can')[0].checked = '';

        elms = document.getElementsByName('f_' + i + '_ntotes');
        for(n = 0; n < elms.length; n++) {
            if(elms[n].value == '0') {
                elms[n].checked = true;
            }
        }
    }
}

function getLocalStorageArr() {
    try {
        arr = JSON.parse(localStorage.getItem("scoutingData3512"));
    }catch(e){
        arr = ["magic v0.2"];
    }
    if(Array.isArray(arr)) {
        if(arr[0] !== "magic v0.2") {
            arr = ["magic v0.2"];
        }
    }else{
        arr = ["magic v0.2"];
    }

    return arr;
}

function procForm() {
    if(supports_html5_storage() == false) {
        document.getElementById('statusText').innerHTML = "Your browser is not supported!";
        return;
    }

    var arr;
    arr = getLocalStorageArr();

    data = marshalData();
    arr.push(data);
    try {
        localStorage.setItem("scoutingData3512", JSON.stringify(arr));
    } catch (error) {
        document.getElementById('statusText').innerHTML = "Storing data failed!";
        return false;
    }
    clearFields();

    document.getElementById('statusText').innerHTML = "Data recorded";
}

function resetLocalStorage() {
    if(supports_html5_storage() == false) {
        document.getElementById('statusText').innerHTML = "Your browser is not supported!";
        return;
    }

    localStorage.setItem("scoutingData3512", "");
}

function uiSendData() {
    if(supports_html5_storage() == false) {
        document.getElementById('statusText').innerHTML = "Your browser is not supported!";
        return;
    }

    submitData(JSON.stringify(getLocalStorageArr()));
    window.scrollTo(0, 0);
}

function submitData(str) {
    document.getElementById('statusText').innerHTML = "Sending ...";
    xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange=function()
    {
        if (xmlhttp.readyState == 4) {
            if(xmlhttp.status == 200 && xmlhttp.responseText == 'OK\n') {
                document.getElementById('statusText').innerHTML = "Data sent!";
                resetLocalStorage();                
            } else {
                document.getElementById('statusText').innerHTML = "Sending failed";
            }
        }
    }
    xmlhttp.open("POST", getSubmitURL(), true);
    xmlhttp.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
    xmlhttp.send(str);
}

function displayJSON() {
    nwin=window.open();
    ndoc=nwin.document;
    ndoc.write("<pre>" + localStorage.getItem('scoutingData3512') + "</pre>");
    ndoc.close();
}

function onLoad() {
    document.getElementById('versionString').innerHTML = g_versionString;
    if(supports_html5_storage() == false) {
        alert("WARNING!\nYour platform is not supported. This application will not work.");
    }
    clearFields();
}

function getSubmitURL() {
    var remoteHost = localStorage.getItem('remoteHost3512');
    if(remoteHost == '' || remoteHost == null) {
        remoteHost = "/write";
    }

    return remoteHost;
}

function uiSetRemoteHost() {
    var remoteHost = getSubmitURL();

    remoteHost = prompt('Enter the URL to POST data to', remoteHost);
    if(remoteHost != null) {
        localStorage.setItem('remoteHost3512', remoteHost);
    }
}

function uiFlipFlopDisplay() {
    if(document.getElementById('showContent').style.display != 'block') {
        document.getElementById('showLabel').innerHTML = 'Show less';
        document.getElementById('showContent').style.display = 'block';
    } else {
        document.getElementById('showLabel').innerHTML = 'Show more';
        document.getElementById('showContent').style.display = 'none';
    }
}

/* function uiReloadAppcache() {
    var appCache = window.applicationCache;

    appCache.addEventListener('updateready', function(e) {
        if (appCache.status == window.applicationCache.UPDATEREADY) {
            appCache.swapCache(); //replaces the old cache with the new one.
            window.location.reload();
        }
    })

    document.getElementById('statusText').innerHTML = "Reloading appcache..";
    appCache.update(); //this will attempt to update the users cache and changes the application cache status to 'UPDATEREADY'.
} */

