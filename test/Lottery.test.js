const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const { interface, bytecode } = require('../compile');

// web3 allows us to interact with the deployed contract in our test ethereum network
// to do this we need to pass it a provider from ganache, the library that creates the network
const provider = ganache.provider();
const web3 = new Web3(provider);

let accounts;
let lottery;

beforeEach(async () => {
  // get a list of all accounts to use uno of them to deploy the contract
  accounts = await web3.eth.getAccounts();

  lottery = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode })
    .send({ from: accounts[0], gas: '1000000' });

  lottery.setProvider(provider);
});

describe('lottery', () => {
  it('deploys a contract', () => {
    assert.ok(lottery.options.address);
  });

  it('sets the sender as the lottery manager', async () => {
    const manager = await lottery.methods.manager().call();

    assert.equal(accounts[0], manager);
  });

  it('allows one player to enter the lottery', async () => {
    await lottery.methods.enter().send({ from: accounts[0], value: web3.utils.toWei('0.02', 'ether') });

    const players = await lottery.methods.getPlayers().call();

    assert.equal(accounts[0], players[0]);
    assert.equal(1, players.length);
  });

  it('allows multiple players to enter the lottery', async () => {
    await lottery.methods.enter().send({ from: accounts[0], value: web3.utils.toWei('0.02', 'ether') });
    await lottery.methods.enter().send({ from: accounts[1], value: web3.utils.toWei('0.02', 'ether') });
    await lottery.methods.enter().send({ from: accounts[2], value: web3.utils.toWei('0.02', 'ether') });

    const players = await lottery.methods.getPlayers().call();

    assert.equal(accounts[0], players[0]);
    assert.equal(accounts[1], players[1]);
    assert.equal(accounts[2], players[2]);

    assert.equal(3, players.length);
  });

  it('requires a minimum amount of ether to enter', async () => {
    try {
      await lottery.methods.enter().send({ from: accounts[2], value: 0 });

      assert(false);
    } catch (error) {
      assert(error);
    }
  });

  it('only the manager can call the function to pick a winner', async () => {
    try {
      await lottery.methods.enter().send({ from: accounts[0], value: web3.utils.toWei('0.02', 'ether') });
      await lottery.methods.pickWinner().send({ from: accounts[1] });
      
      assert(false);
    } catch (error) {
      assert(error);
    }
  });

  it('sends money yo the winner and resets the players array', async () => {
    await lottery.methods.enter().send({ from: accounts[0], value: web3.utils.toWei('2', 'ether') });

    const initialBalance = await web3.eth.getBalance(accounts[0]);
    await lottery.methods.pickWinner().send({ from: accounts[0] });
    const finalBalance = await web3.eth.getBalance(accounts[0]);
    const difference = finalBalance - initialBalance;

    const players = await lottery.methods.getPlayers().call();
    
    assert(difference > web3.utils.toWei('1.8', 'ether'));
    assert(!players.length);
  });
});