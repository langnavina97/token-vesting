const { assert, expect } = require('chai');
const Vesting = artifacts.require('./Vesting');

require('chai').use(require('chai-as-promised')).should();

contract('Vesting', (accounts) => {
    let contract;

    before(async () => {
        contract = await Vesting.deployed();
    });

    describe('deployment', async () => {
        it('deploys successfully', async () => {
            const address = contract.address;
            assert.notEqual(address, '');
            assert.notEqual(address, null);
            assert.notEqual(address, undefined);
            assert.notEqual(address, 0x0);
        });

        // could write more tests here


    });

});