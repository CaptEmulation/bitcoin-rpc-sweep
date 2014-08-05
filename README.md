Bitcoin RPC Sweeper
========

Personal nodejs based rpc sweep script.  Should work with any bitcoin 0.7+ RPC compatible wallet.  Sweeps all unspent transaction in wallet to new address.

## Usage

```
# node main.js --address={addressToSweepTo} --user=rpc --password=mysuperlongandrandombitcoinrpcpassword --timeout=60s --fee=0.005
Found 2 unspent transactions
Signing transaction
Sending transaction
Transaction sent
05365c5eb61c9db13e4e282af197288ddf8f421e082893e3b5d032ecdafea91a
```
