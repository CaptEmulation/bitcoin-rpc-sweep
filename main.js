

var argv = require('minimist')(process.argv.slice(2));
var BitcoinRpc = require('./rpc').Class;
var Q = require('q');

var cmdLineErrors = [];

["address", "fee", "user", "password"].forEach(function assertOption(optionName) {
  if (!argv[optionName]) {
    cmdLineErrors.push('Missing --' + optionName + "= command line option");
  }
});

if (cmdLineErrors.length) {
  cmdLineErrors.forEach(function (error) {
    console.log(error);
  });
  process.exit();
}

var bitcoinRpc = new BitcoinRpc({
  host: argv.host || argv.h || 'localhost',
  port: argv.port || argv.p || 8332,
  user: argv.user || argv.u || 'rpc',
  password: argv.password || argv.p || '',
  timeout: parseInt((argv.timeout || argv.t || '30s').replace("s", "000"))
});

bitcoinRpc.listUnspent().then(function (unspents) {
  return Q.all(createRawTransactions(unspents).map(function (transaction) {
    console.log('Found ' + transaction.length + ' unspent transactions');
    return bitcoinRpc.createRawTransaction.apply(bitcoinRpc, transaction).then(function (hexTransaction) {
      console.log('Signing transaction');
      return bitcoinRpc.signRawTransaction(hexTransaction).then(function (signedResponse) {
        if (signedResponse.complete) {
          console.log('Sending transaction');
          return bitcoinRpc.sendRawTransaction(signedResponse.hex).then(function (transactionId) {
            console.log('Transaction sent');
            console.log(transactionId);
          }).fail(function (response) {
            console.error(response);
          });
        }
      });
    })
  }));
}).fail(function (response) {
  console.error(response);
});

createRawTransactions = function (unspent) {

  var transactions = [];
  var total = 0;

  unspent.forEach(function (t) {
    transactions.push({
      "txid": t.txid,
      "vout": t.vout
    });
    total += t.amount;
  });

  var rawTransaction = [ transactions, {
    address: argv.address,
    amount: total
  }];

  var rawTransactionStr = JSON.stringify(rawTransaction, null, 2);

  var numberOfTransactions = Math.ceil(rawTransactionStr.length / 245000);
  var numberOfTransactionsPerBlock = Math.ceil(transactions.length / numberOfTransactions);
  rawTransactions = [];
  for (var i = 0; i < numberOfTransactions; i++) {
      transactions = [];
      total = 0;
      for (var j = 0; j < numberOfTransactionsPerBlock; j++) {
        var t = unspent[(i * numberOfTransactionsPerBlock) + j];
        if (t) {
          transactions.push({
            "txid": t.txid,
            "vout": t.vout
          });
          total += t.amount;
        }
      }
      var output = {};
      output[argv.address] = parseFloat(parseFloat(total - argv.fee).toPrecision(8));
      rawTransactions.push([ transactions, output ]);
  }

  return rawTransactions;

}
