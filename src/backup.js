import { useState, useEffect } from 'react';
import { ethers, BigNumber, utils } from "ethers";
import abi from "./contracts/Bank.json";
/*
  1. connect meta mask
  2. wireup contract
  3. have getters and setters 
  4. have components
  5. clean up and organize code
*/

function App() {
  //log errors in our state variables
  const [errorMessage, setErrorMessage] = useState(null);
  const [defaultAccount, setDefaultAccount] = useState(null);
  const [connButtonText, setConnButtonText] = useState('Connect Wallet');

  const [currentContractVal, setCurrentContractVal] = useState(null);

  //ether js functions
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [depositMoney, setDeposityMoney] = useState(null);
  const [txs, setTxs] = useState([]);

  const CONTRACT_ADDRESS = '0x383445957F8d45ea0fD2Bd54E28CFd08453a7b95';
  const ContractABI = abi.abi;

  console.log('abi', ContractABI);

  const connectWalletHandler = () => {
    if (window.ethereum && window.ethereum.isMetaMask) {

      window.ethereum.request({ method: 'eth_requestAccounts' })
        .then(result => {
          accountChangedHandler(result[0]);
          setConnButtonText('Wallet Connected');
          console.log('Wallet Connected');
        })
        .catch(error => {
          setErrorMessage(error.message);

        });

    } else {
      console.log('Need to install MetaMask');
      setErrorMessage('Please install MetaMask browser extension to interact');
    }

  }

  // update account, will cause component re-render
  const accountChangedHandler = (newAccount) => {
    setDefaultAccount(newAccount);
    updateEthers();
  }

  const chainChangedHandler = () => {
    // reload the page to avoid any errors with chain change mid use of application
    window.location.reload();
  }


  // listen for account changes
  window.ethereum.on('accountsChanged', accountChangedHandler);
  window.ethereum.on('chainChanged', chainChangedHandler);

  const updateEthers = () => {
    let tempProvider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(tempProvider);


    let tempSigner = tempProvider.getSigner();
    setSigner(tempSigner);

    let tempContract = new ethers.Contract(CONTRACT_ADDRESS, ContractABI, tempSigner);
    setContract(tempContract);
  }

  const setHandler = (event) => {
    event.preventDefault();
    console.log('sending ' + event.target.setText.value + ' to the contract');
    contract.set(event.target.setText.value);
  }

  const getCurrentVal = async () => {
    let val = await contract.getBankBalance();
    val = utils.formatEther(val)
    setCurrentContractVal(val);
  }

  const deposityMoneyHandler = async (event) => {
    event.preventDefault();
    let deposit = event.target.depositMoney.value;
    //deposit = utils.parseEther(deposit);
    console.log('deposit', deposit);
    console.log('sending ' + event.target.depositMoney.value + ' to the contract');

    utils.getAddress(CONTRACT_ADDRESS);

    const tx = await signer.sendTransaction({
      to: CONTRACT_ADDRESS,
      value: utils.parseEther(deposit),
      gasLimit: 21000,
      gasPrice: BigNumber.from("20000000000")
    });

    await tx.await()
    console.log('tx hash', tx.hash);
  }

  console.log('proivder: ', provider);
  console.log('signer: ', signer);
  console.log('contract: ', contract);


  return (
    <div className=''>
      <h4> {"Get/Set Contract interaction"} </h4>
      <button onClick={connectWalletHandler}>{connButtonText}</button>
      <div>
        <h3>Address: {defaultAccount}</h3>
      </div>
      <form onSubmit={setHandler}>
        <input className='bg-indigo-500' id="setText" type="text" />
        <button type={"submit"}> Update Contract </button>
      </form>
      <div>
        <button onClick={getCurrentVal} style={{ marginTop: '5em' }}> Get Current Bank Total </button>
      </div>
      <div>
        {currentContractVal && currentContractVal}
        <br />
      </div>
      <div>
        <form onSubmit={deposityMoneyHandler}>
          <input className='bg-indigo-500' id="depositMoney" type="text" />
          <button type="submit"> Deposit Money </button>
        </form>

      </div>
      {errorMessage}
    </div>
  );
}

export default App;
