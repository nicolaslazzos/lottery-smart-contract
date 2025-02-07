const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const { interface, bytecode } = require('./compile');
const { mnemonic, rinkeby } = require('./env');

const provider = new HDWalletProvider(mnemonic, rinkeby);

const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log('deploying contract from account', accounts[0]);

  const inbox = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode })
    .send({ from: accounts[0], gas: '1000000' });

  console.log(interface);
  console.log('contract deployed at address', inbox.options.address);

  // contract address 0x7d1df5333113a81A2Af3960ccf39fDF9f157e6eF
}

deploy();