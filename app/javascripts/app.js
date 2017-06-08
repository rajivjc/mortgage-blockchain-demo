var accounts, ownerAccount, bankAccount, insurerAccount, irsAccount;
var defaultGas = 4700000;
var loanContractAddress;

function deployLoanContract() {
    Mortgage.new({ from: ownerAccount, gas: defaultGas }).then(
        function(loanInstance) {
            loanContractAddress = loanInstance.address;
            $('#sectionAAddress').html('<i class="fa fa-address-card"></i> ' +
                '<a  target="#" onclick="getLoanData(' + loanInstance.address + ');return false;" href="' + loanInstance.address +
                ' ">' + loanInstance.address + '</a>');
            $('#sectionBAddress').html('<i class="fa fa-address-card"></i> ' +
                '<a  target="#" onclick="getLoanData(' + loanInstance.address + ');return false;" href="' + loanInstance.address +
                ' ">' + loanInstance.address + '</a>');
            $('#sectionCAddress').html('<i class="fa fa-address-card"></i> ' +
                '<a  target="#" onclick="getLoanData(' + loanInstance.address + ');return false;" href="' + loanInstance.address +
                ' ">' + loanInstance.address + '</a>');
            $('#sectionDAddress').html('<i class="fa fa-address-card"></i> ' +
                '<a  target="#" onclick="getLoanData(' + loanInstance.address + ');return false;" href="' + loanInstance.address +
                ' ">' + loanInstance.address + '</a>');

            $('#sectionATxnHash').html('<i class="fa fa-list-alt"></i> ' + loanInstance.transactionHash);
        }).then(function() {
        getStatus();
    }).then(function() {
        var ct = Mortgage.at(loanContractAddress);
        ct.getBalance(ownerAccount).then(function(data) {
            $('#ownerBalance').html(data.c[0] / 100);
        });
    });
}

function getStatus() {
    var ct = Mortgage.at(loanContractAddress);
    ct.getLoanData().then(function(data) {
        if (data[7].c[0] == 0) {
            $('#sectionAStatus').html('Initiated');
            $('#sectionBStatus').html('Initiated');
            $('#sectionCStatus').html('Initiated');
            $('#sectionDStatus').html('Initiated');
        } else if (data[7].c[0] == 1) {
            $('#sectionAStatus').html('Submitted');
            $('#sectionBStatus').html('Submitted');
            $('#sectionCStatus').html('Submitted');
            $('#sectionDStatus').html('Submitted');
        } else if (data[7].c[0] == 2) {
            $('#sectionAStatus').html('Approved');
            $('#sectionBStatus').html('Approved');
            $('#sectionCStatus').html('Approved');
            $('#sectionDStatus').html('Approved');
        }

    });
}


function submitLoan() {
    var ct = Mortgage.at(loanContractAddress);
    var _addressOfProperty = $("#propertyAddress").val();
    var _purchasePrice = $("#purchasePrice").val() * 100;
    var _term = $("#YR").val() * 100;
    var _interest = $("#IR").val() * 100;
    var _loanAmount = $("#LA").val() * 100;
    var _annualTax = $("#AT").val() * 100;
    var _annualInsurance = $("#AI").val() * 100;
    var _monthlyPi = $("#PI").val() * 100;
    var _monthlyTax = $("#MT").val() * 100;
    var _monthlyInsurance = $("#MI").val() * 100;
    ct.submitLoan.sendTransaction(_addressOfProperty,
        _purchasePrice,
        _term,
        _interest,
        _loanAmount,
        _annualTax,
        _annualInsurance,
        _monthlyPi,
        _monthlyTax,
        _monthlyInsurance,
        bankAccount, 
        insurerAccount, 
        irsAccount, { from: ownerAccount, gas: defaultGas }
    ).then(function(txHash) {
        getStatus();
    }).then(function() {
        ct.getLoanData().then(function(data) {
            $('#totalBankBalance').html((data[8].c[0] / 100) * 12 * 30);
            $('#bankBalance').html('0');
            $('#outstandingBankBalance').html((data[8].c[0] / 100) * 12 * 30);

            $('#totalInsurerBalance').html((data[9].c[0] / 100) * 12 * 30);
            $('#insurerBalance').html('0');
            $('#outstandingInsurerBalance').html((data[9].c[0] / 100) * 12 * 30);

            $('#totalIrsBalance').html((data[10].c[0] / 100) * 12 * 30);
            $('#irsBalance').html('0');
            $('#outstandingIrsBalance').html((data[10].c[0] / 100) * 12 * 30);
        });
    }).catch(function(e) {
        console.log("catching---->" + e)
        if ((e + "").indexOf("invalid JUMP") || (e + "").indexOf("out of gas") > -1) {
            // We are in TestRPC
        } else if ((e + "").indexOf("please check your gas amount") > -1) {
            // We are in Geth for a deployment
        } else {
            throw e;
        }
    });
}

function approveLoan() {
    var ct = Mortgage.at(loanContractAddress);
    ct.approveRejectLoan.sendTransaction(2, { from: bankAccount, gas: defaultGas }).then(function(txHash) {
        getStatus();
    });
}

function getLoanData() {
    var ct = Mortgage.at(loanContractAddress);
    ct.getLoanData().then(function(data) {
        $('#propAddr').html(hex2string(data[0]));
        $('#purPrice').html(data[1].c[0] / 100);
        $('#termYrs').html(data[2].c[0] / 100);
        $('#intr').html(data[3].c[0] / 100);
        $('#loanAmt').html(data[4].c[0] / 100);
        $('#annTax').html(data[5].c[0] / 100);
        $('#annIns').html(data[6].c[0] / 100);

        $('#modalLoanDetails').modal({
            keyboard: true,
            backdrop: "static"
        });

    });
}

function getMonthlyPayment() {
    var ct = Mortgage.at(loanContractAddress);
    ct.getLoanData().then(function(data) {
        $('#valueMH').val(data[8].c[0] / 100);
        $('#valueIssurer').val(data[9].c[0] / 100);
        $('#valueIRS').val(data[10].c[0] / 100);
    });

}

function completePayment() {
    completeBank();
    completeInsurer();
    completeIrs();

}

function completeBank() {
    var ct = Mortgage.at(loanContractAddress);
    var bankBal;
    ct.getBalance(bankAccount).then(function(data) {
        bankBal = data.c[0] / 100;
    }).then(function() {
        ct.getLoanData().then(function(data) {
            $('#valueMH').val(((data[8].c[0] / 100) * 12 * 30) - bankBal);
        });

    });
}

function completeInsurer() {
    var ct = Mortgage.at(loanContractAddress);
    var insBal;
    ct.getBalance(insurerAccount).then(function(data) {
        insBal = data.c[0] / 100;
    }).then(function() {
        ct.getLoanData().then(function(data) {
            $('#valueIssurer').val(((data[9].c[0] / 100) * 12 * 30) - insBal);
        });

    });
}

function completeIrs() {
    var ct = Mortgage.at(loanContractAddress);
    var irsBal;
    ct.getBalance(irsAccount).then(function(data) {
        irsBal = data.c[0] / 100;
    }).then(function() {
        ct.getLoanData().then(function(data) {
            $('#valueIRS').val(((data[10].c[0] / 100) * 12 * 30) - irsBal);
        });

    });
}

function makePayment(value, address) {
    var ct = Mortgage.at(loanContractAddress);
    var bankBal, insBal, irsBal;
    ct.deposit.sendTransaction(address,
        value * 100, { from: ownerAccount, gas: defaultGas }
    ).then(function(txHash) {
        console.log(txHash);
    }).then(function() {
        ct.getBalance(ownerAccount).then(function(data) {
            $('#ownerBalance').html(data.c[0] / 100);
        });
    }).then(function() {
        ct.getBalance(address).then(function(data) {
            if (address == bankAccount) {
                $('#bankBalance').html(data.c[0] / 100);
                bankBal = data.c[0] / 100;
            } else if (address == insurerAccount) {
                $('#insurerBalance').html(data.c[0] / 100);
                insBal = data.c[0] / 100;
            } else if (address == irsAccount) {
                $('#irsBalance').html(data.c[0] / 100);
                irsBal = data.c[0] / 100;
            }
        });
    }).then(function() {
        ct.getLoanData().then(function(data) {
            if (address == bankAccount) {
                $('#outstandingBankBalance').html(((data[8].c[0] / 100) * 12 * 30) - bankBal);
            } else if (address == insurerAccount) {
                $('#outstandingInsurerBalance').html(((data[9].c[0] / 100) * 12 * 30) - insBal);
            } else if (address == irsAccount) {
                $('#outstandingIrsBalance').html(((data[10].c[0] / 100) * 12 * 30) - irsBal);
            }
        });
    });
}

function getBalance(address) {
    var ct = Mortgage.at(loanContractAddress);
    ct.getBalance(address).then(function(data) {
        return data.c[0] / 100;
    });
}

function hex2string(hex) {
    var str = '';
    for (var i = 0; i < hex.length; i += 2) {
        var v = parseInt(hex.substr(i, 2), 16);
        if (v) str += String.fromCharCode(v);
    }
    return str;
}

function truncateToDecimals(obj) {
    var num = obj.value;
    const calcDec = Math.pow(10, 2);
    obj.value = Math.trunc(num * calcDec) / calcDec;
}

function floor(number) {
    return Math.floor(number * Math.pow(10, 2) + 0.9) / Math.pow(10, 2);
}


function dosum() {
    var mi = $("#IR").val() / 1200;
    var base = 1;
    var mbase = 1 + mi;
    for (i = 0; i < $("#YR").val() * 12; i++) {
        base = base * mbase
    }

    $("#PI").val(floor($("#LA").val() * mi / (1 - (1 / base))));
    $("#MT").val(floor($("#AT").val() / 12));
    $("#MI").val(floor($("#AI").val() / 12));
    var dasum = $("#LA").val() * mi / (1 - (1 / base)) +
        $("#AT").val() / 12 + $("#AI").val() / 12;
    $("#MP").val(floor(dasum));
}


window.onload = function() {

    web3.eth.getAccounts(function(err, accs) {
        if (err != null) {
            alert("There was an error fetching your accounts.");
            return;
        }
        if (accs.length == 0) {
            alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
            return;
        }
        accounts = accs;
        ownerAccount = accounts[0];
        bankAccount = accounts[1];
        insurerAccount = accounts[2];
        irsAccount = accounts[3];
        $('#ownerAccount').html(ownerAccount);
        $('#bankAccount').html(bankAccount);
        $('#insurerAccount').html(insurerAccount);
        $('#irsAccount').html(irsAccount);

        $('#payMHaddress').val(bankAccount);
        $('#payIssureraddress').val(insurerAccount);
        $('#payIRSaddress').val(irsAccount);
    });

    $("#deployLoanContract").click(function() {
        deployLoanContract();
    });

    $("#submitLoan").click(function() {
        submitLoan();
    });

    $("#approveLoan").click(function() {
        approveLoan();
    });

    $("#getMonthlyPayment").click(function() {
        getMonthlyPayment();
    });

    $("#completePayment").click(function() {
        completePayment();
    });

    $("#modalClose").click(function() {
        $('#modalLoanDetails').modal('hide');
    });
};
