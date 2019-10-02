# mortgage-blockchain-demo
An illustrative DApp to address a potential use case in the mortgage space; Smart contracts can automate mortgage contracts by automatically connecting the parties, providing for a frictionless and less error-prone process. The smart contract can automatically process payment and release liens from land records when the loan is paid.

They can also improve record visibility for all parties and facilitate payment tracking and verification. They reduce errors and costs associated with manual processes.

## Setup 
- npm install -g ethereumjs-testrpc 
- npm install -g truffle
- mkdir demo
- cd demo
- git clone https://github.com/rajivjc/mortgage-blockchain-demo.git
- cd mortgage-blockchain-demo
- npm install
- truffle build
- truffle serve

- Access application - http://localhost:8080

Alternatively you can run the following docker images -

- docker run -p 8545:8545 -d rajivjc/testrpc
- docker run -p 8080:8080 -d rajivjc/mortgage-blockchain-demo

## Alternatively you can run the above in the droplet created on digital ocean

## Addtional Documentation
Check out this [blog](https://medium.com/@rajiv.cheriyan/lets-get-started-with-your-first-ethereum-dapp-f09feb59dd78) for more details
