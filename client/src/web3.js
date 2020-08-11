import Web3 from 'web3';

const getWeb3 = async () => {
  let web3;

  // modern dapp browsers
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    try {
      await window.ethereum.enable();
    } catch (error) {
      console.error(error);
    }
  }
  // legacy dapp browsers
  else if (window.web3) {
    web3 = new Web3(window.web3.currentProvider);
  }
  // non-dapp browsers
  else {
    console.log('non-ethereum browser detected. you should consider trying metamask!');
  }

  return web3;
}

export default getWeb3;