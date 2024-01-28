
// variable and class declaration
var account = [];
var transactions = [];
class Account {
    constructor(accountId, productId, totalProductBalance) {
        this.accountId = accountId;
        this.productId = productId;
        this.totalProductBalance = totalProductBalance;
    }
}
class Transaction {
    constructor(accountId, transactionId, productId, transactionType, amount) {
        this.accountId = accountId;
        this.transactionId = transactionId;
        this.productId = productId;
        this.transactionType = transactionType;
        this.amount = amount;
    }
}

const fs = require("fs");
const csv = require('csv-parser');

// Reads account.csv file
function processCSVBalances() {
    fs.createReadStream("account.csv")
        .pipe(csv())
        .on('data', function (data) {
            try {
                account.push(new Account(parseInt(data.account_id), parseInt(data.product_id), parseInt(data.total_product_balance)));
            }
            catch (err) {
                console.log("Cannot process account.csv file");
            }
        })
        .on('end', function () {
            processTransaction();
        });
}

// Reads transactions.csv file
function processTransaction() {

    fs.createReadStream("transactions.csv")
        .pipe(csv())
        .on('data', function (data) {
            try {
                transactions.push(new Transaction(parseInt(data.account_id), parseInt(data.transaction_id), parseInt(data.product_id), data.transaction_type, parseInt(data.amount)));
            }
            catch (err) {
                console.log("Cannot process transactions.csv file");
            }
        })
        .on('end', function () {
            verifyBalances();
        });
}

// compares the values from account.csv and transactions.csv
function verifyBalances() {

    let calculatedBalance = 0;
    let AUDollar = new Intl.NumberFormat('en-AU', { style:'currency', currency:'AUD'});

    // loop through account and trasanction values and
    // add the 'deposits' and subtract the 'withdrawals'
    console.log(`===== Fund Balance Report =====`);
    for (let i = 0; i < account.length; i++) {
        for (let j = 0; j < transactions.length; j++) {
            if ((account[i].accountId === transactions[j].accountId) && (account[i].productId === transactions[j].productId)) {
                if (transactions[j].transactionType === "deposit") {
                    calculatedBalance += transactions[j].amount;
                }
                else if (transactions[j].transactionType === "withdrawal") {
                    calculatedBalance -= transactions[j].amount;
                }
            }
        }

        //produce report that compares account 
        if (account[i].totalProductBalance === calculatedBalance) {
            console.log(`For Account ID ${account[i].accountId} and Product ID ${account[i].productId}, the holding balance is ${AUDollar.format(account[i].totalProductBalance)}. This matches the total transaction value is ${AUDollar.format(calculatedBalance)}.`);
        }
        else {
            console.log(`For Account ID ${account[i].accountId} and Product ID ${account[i].productId}, the holding balance is ${AUDollar.format(account[i].totalProductBalance)}. However, the total transaction value is ${AUDollar.format(calculatedBalance)}.`);
        }
        calculatedBalance = 0;
    }
    console.log(`===============================`);


}


//main execution function
processCSVBalances();
