import React, { Component } from "react";
import Vesting from "./abis/Vesting.json";
import detectEthereumProvider from '@metamask/detect-provider';
import Web3 from 'web3';
import { Grid, Button, Form, Input, Label, Card, Header } from 'semantic-ui-react';
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
    let ownerBalance = await this.state.contract.methods.balanceOf(this.state.owner).call();
    this.setState({ ownerBalance });
  }

  render() {
    return (
      <div className="App">
        <Header as='h1'>Token Vesting</Header>
        <Grid divided='vertically'>
          <Grid.Row columns={2} style={{ margin: "20px" }}>
            <Grid.Column>

              <Card.Group>
                <Card style={{ width: "900px" }}>
                  <Card.Content>
                    <Card.Header>{this.state.name} ({this.state.symbol})</Card.Header>
                    <Card.Meta>Total number of Tokens</Card.Meta>
                    <Card.Description>
                      {this.state.totalSupply}
                    </Card.Description>
                  </Card.Content>

                  <Card.Content>
                    <Card.Header>Owner Info</Card.Header>
                    <Card.Meta>Address: {this.state.owner}</Card.Meta>
                    <Card.Description>
                      Balance: {this.state.ownerBalance}
                    </Card.Description>
                  </Card.Content>

                  <Card.Content>
                    <Card.Header>Get balance for address: <Input type="text" name="address" value={this.state.address} onChange={this.handleInputChange}></Input></Card.Header>
                    <Card.Meta><Button type="button" onClick={this.getBalance} style={{ margin: "20px" }}>Get balance</Button></Card.Meta>
                    <Card.Description>
                      Balance of {this.state.address}: {this.state.balance}
                    </Card.Description>
                  </Card.Content>

                  <Card.Content>
                    <Card.Header>Get beneficiary (index): <Input type="int" name="index" value={this.state.index} onChange={this.handleInputChange}></Input></Card.Header>
                    <Card.Meta><Button type="button" onClick={this.getBeneficiary} style={{ margin: "20px" }}>Get beneficiary</Button></Card.Meta>
                    <Card.Description>
                      {this.state.beneficiary}
                    </Card.Description>
                  </Card.Content>
                </Card>
              </Card.Group>
            </Grid.Column>


            <Grid.Column>
              <Card.Group>
                <Card style={{ width: "900px" }}>
                  <Card.Content>
                    <Card.Header>Add beneficiary</Card.Header>
                    <Card.Meta><Input type="text" name="addressToAdd" value={this.state.addressToAdd} onChange={this.handleInputChange} style={{ width: "400px" }}></Input></Card.Meta>
                    <Card.Description>
                      <Button type="button" onClick={this.addBeneficiary}>Add beneficiary</Button>
                    </Card.Description>
                  </Card.Content>

                  <Card.Content>
                    <Card.Header>Vesting</Card.Header>
                    <Card.Meta>Disperse the tokens to the beneficiaries</Card.Meta>
                    <Card.Description>
                      <Button type="button" onClick={this.vesting} style={{ margin: "20px" }}>Disperse tokens (vesting)</Button>
                    </Card.Description>
                  </Card.Content>

                </Card>
              </Card.Group>

            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div >
    );
  }
}

export default App;


