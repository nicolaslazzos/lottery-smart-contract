import React from 'react';
import getWeb3 from './web3';
import getLottery from './lottery';

let web3;
let lottery;

class App extends React.Component {
  state = {
    manager: '',
    players: [],
    balance: '',
    value: '',
    message: '',
    winner: ''
  };

  async componentDidMount() {
    web3 = await getWeb3();
    lottery = await getLottery();

    this.getData();
  }

  getData = async () => {
    if (web3 && lottery) {
      const manager = await lottery.methods.manager().call();
      const players = await lottery.methods.getPlayers().call();
      const balance = await web3.eth.getBalance(lottery.options.address);

      this.setState({
        manager,
        players,
        balance: web3.utils.fromWei(balance, 'ether')
      });
    }
  }

  onSubmit = async e => {
    e.preventDefault();

    const accounts = await web3.eth.getAccounts();

    this.setState({ message: 'Waiting on transaction success...' });

    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei(this.state.value, 'ether')
    });

    this.setState({ value: '', message: 'You have been entered!' });

    this.getData();
  }

  onClick = async () => {
    const accounts = await web3.eth.getAccounts();

    if (accounts[0] !== this.state.manager) {
      return this.setState({ message: 'Only the manager can pick a winner' });
    }

    this.setState({ message: 'Waiting on transaction success...' });

    await lottery.methods.pickWinner().send({ from: accounts[0] });

    this.setState({ value: '', message: 'A winner has been picked!' });
    
    this.getData();
  }

  render() {
    return (
      <div>
        <h2>Lottery Contract</h2>
        <p>
          This contract is managed by {this.state.manager}.<br />
          There are currently {this.state.players.length} people entered competing to win {this.state.balance} ether!
        </p>
        <hr />
        <form onSubmit={this.onSubmit}>
          <h3>Enter the lottery here!</h3>
          <div>
            <label>Amount of ether to enter (minimum 0.01 ether)</label>
            <br />
            <input
              placeholder="0.01"
              name="value"
              value={this.state.value}
              onChange={e => this.setState({ [e.target.name]: e.target.value })}
            />
            <button type="submit">Enter</button>
          </div>
        </form>
        <hr />
        <h3>Ready to pick a winner?</h3>
        <button onClick={this.onClick}>Pick a winner!</button>
        <hr />
        <h3>{this.state.message}</h3>
      </div>
    );
  }
}

export default App;
