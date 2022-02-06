import React, { Component } from "react";
import Vesting from "./abis/Vesting.json";
import detectEthereumProvider from '@metamask/detect-provider';
import Web3 from 'web3';
import { Grid, Button, Form, Input, Label } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';

import "./App.css";

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      account: '',
      totalSupply: 0,
      contract: null,
      beneficiary: "",
      address: "",
      loading: false,
      error: "",
      success: "",
      name: "",
      owner: "",
      symbol: "",
      ownerBalance: 0,
      value: "",
      balance: 0,
      index: 0,
      addressToAdd: ""
    }
  }

  async componentDidMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  // first up is to detect ethereum provider
  async loadWeb3() {
    const provider = await detectEthereumProvider();

    // modern browsers
    if (provider) {
      console.log('Ethereum wallet is connected');

      window.web3 = new Web3(provider);
    } else {
      console.log('No ethereum wallet detected');
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3;
    const accounts = await window.web3.eth.getAccounts();
    this.setState({ account: accounts[0] })

    const networkId = await web3.eth.net.getId();
    const networkData = Vesting.networks[networkId];
    if (networkData) {
      const abi = Vesting.abi;
      const address = networkData.address;
      const contract = new web3.eth.Contract(abi, address);
      this.setState({ contract });

      const totalSupply = await contract.methods.totalSupply().call();
      this.setState({ totalSupply });

      const name = await contract.methods.name().call();
      this.setState({ name });

      const owner = await contract.methods.owner().call();
      this.setState({ owner });

      const symbol = await contract.methods.symbol().call();
      this.setState({ symbol });

      const ownerBalance = await contract.methods.balanceOf(owner).call();
      this.setState({ ownerBalance });


    } else {
      window.alert('Smart contract not deployed!')
    }

  }

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value
    })
  }

  getBalance = async () => {
    let { address } = this.state;
    let balance = await this.state.contract.methods.balanceOf(address).call();
    this.setState({ balance });
  }

  getBeneficiary = async () => {
    let { index } = this.state;
    let beneficiary;
    beneficiary = await this.state.contract.methods.beneficiaries(index).call();
    if (beneficiary) {
      this.setState({ beneficiary });
    }
  }

  addBeneficiary = async () => {
    let { addressToAdd } = this.state;
    await this.state.contract.methods.addBeneficiaries(addressToAdd).send({ from: this.state.account })
  }

  vesting = async () => {
    await this.state.contract.methods.tokenVesting().send({ from: this.state.account })
  }

  render() {
    return (
      <div className="App">
        <h1>Token Vesting</h1>
        <Grid divided='vertically'>
          <Grid.Row columns={2}>
            <Grid.Column>
              <p>Total number of tokens: {this.state.totalSupply}</p>
              <p>Token name: {this.state.name} ({this.state.symbol})</p>
              <p>Owner: {this.state.owner}</p>
              <p>Balance of owner: {this.state.ownerBalance}</p>

              Get balance for address: <Input type="text" name="address" value={this.state.address} onChange={this.handleInputChange}></Input>
              <Button type="button" onClick={this.getBalance}>Get balance</Button>
              <p>Balance of {this.state.address}: {this.state.balance}</p>

              Get beneficiary (index): <Input type="int" name="index" value={this.state.index} onChange={this.handleInputChange}></Input>
              <Button type="button" onClick={this.getBeneficiary}>Get beneficiary</Button>
              {this.state.beneficiary}

            </Grid.Column>
            <Grid.Column>

              Add beneficiary: <Input type="text" name="addressToAdd" value={this.state.addressToAdd} onChange={this.handleInputChange}></Input>
              <Button type="button" onClick={this.addBeneficiary}>Add beneficiary</Button>

              <br></br>

              <Button type="button" onClick={this.vesting} style={{ margin: "20px" }}>Disperse tokens (vesting)</Button>

            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div >
    );
  }
}

export default App;


