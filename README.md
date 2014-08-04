Bitcoin RPC Sweeper
========

Personal nodejs based rpc sweep script.  Should work with any bitcoin 0.7+ RPC compatible wallet.  Sweeps all unspent transaction in wallet to new address.

## Usage

```
node main.js --address={addressToSweepTo} --host=localhost -port=8332 --user=rpc --password=mysuperlongandrandombitcoinrpcpassword --timeout=60s
```
