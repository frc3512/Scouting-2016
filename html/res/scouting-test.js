var testset = {'f_matchNumber':'', 'f_teamNumber':'', 'f_1_portc':'', 'f_2_portc':'', 'f_1_cheval':'', 'f_2_cheval':'', 'f_1_moat':'', 'f_2_moat':'', 'f_1_ramparts':'', 'f_2_ramparts':'', 'f_1_bridge':'', 'f_2_bridge':'', 'f_1_sally':'', 'f_2_sally':'', 'f_1_rock':'', 'f_2_rock':'', 'f_1_lowbar':'', 'f_2_lowbar':'', 'f_numahigh':'', 'f_numalow':'', 'f_numamhigh':'', 'f_numamlow':'', 'f_numport':'', 'f_STUCKport':'', 'f_numcheval':'', 'f_STUCKcheval':'', 'f_nummoat':'', 'f_STUCKmoat':'', 'f_numramparts':'', 'f_STUCKramparts':'', 'f_numbridge':'', 'f_STUCKbridge':'', 'f_numsally':'', 'f_STUCKsally':'', 'f_numrock':'', 'f_STUCKrock':'', 'f_numrough':'', 'f_STUCKrough':'', 'f_numlowbar':'', 'f_STUCKlowbar':'', 'f_goalhigh':'', 'f_goallow':'', 'f_mgoalhigh':'', 'f_mgoallow':'', 'f_captured':'', 'f_scaled':'', 'f_fouls':'', 'f_tfouls':'', 'f_dead':'', 'f_disabled':'', 'f_tipped':'', 'f_fell':'', 'f_notes':''};

function test_doTest() {
    for(x = 0; x < 80; x++) {
        test_setFields(x);
        procForm(this.form);
    }
}

function test_setFields(index) {
    for(var key in testset[index]) {
        if(testset[index].hasOwnProperty(key)) {
            if(document.getElementsByName(key)[0].type == 'text'
                || document.getElementsByName(key)[0].type == 'number'
                || document.getElementsByName(key)[0].type == 'textarea') {
                document.getElementsByName(key)[0].value = testset[index][key];
            } else if (document.getElementsByName(key)[0].type == 'checkbox') {
                document.getElementsByName(key)[0].checked = testset[index][key];
            } else if (document.getElementsByName(key)[0].type == 'radio') {
                elms = document.getElementsByName(key);
                for(i = 0; i < elms.length; i++) {
                    if(testset[index][key] == elms[i].value) {
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
