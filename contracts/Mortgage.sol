pragma solidity ^0.4.4;

contract Mortgage{
    
    /* This is the constructor which will deploy the contract on the blockchain.
    We will initialize with the loan status as 'Initiated' and for test purposes
    we will initialize the loan applicant's balance to 1000000. Note since solidity 
    does not support float or double at this point, we will store the actual value 
    multipled by 100 in the contract, and will be divide the value retrieved from 
    the contract by 100, when we have to represent the balance in the UI    
    */
    function Mortgage()
    {
        loanApplicant = msg.sender;
        loan.status = STATUS_INITIATED;
        balances[msg.sender] = 100000000;
    }
    
    /* address of the loan applicant */
    address loanApplicant;
    
    // Events - publicize actions to external listeners
    event LienReleased(address _owner);
    event LienTrasferred (address _owner);
    event LoanStatus (int _status);
   
    int constant STATUS_INITIATED = 0;
    int constant STATUS_SUBMITTED = 1;
    int constant STATUS_APPROVED  = 2;
    int constant STATUS_REJECTED  = 3;
    
    
    /* struct datatype to store the property details */
    struct Property {
      bytes32  addressOfProperty;
      uint32 purchasePrice;
      address owner;
    }
    
    /* struct datatype to store the loan terms */
    struct LoanTerms{
      uint32 term;
      uint32 interest;
      uint32 loanAmount;
      uint32 annualTax;
      uint32 annualInsurance;
    }

    /* struct datatype to store the monthly payment structure */
    struct MonthlyPayment{
        uint32 pi;
        uint32 tax;
        uint32 insurance;
    }
    
    /* struct datatype to store the details of the loan contract */
    struct Loan {
      LoanTerms loanTerms;
      Property property;
      MonthlyPayment monthlyPayment;
      ActorAccounts actorAccounts;
      int   status; // values: SUBMITTED, APPROVED, REJECTED
    }
    
    struct ActorAccounts {
      address mortgageHolder;
      address insurer;
      address irs;
    }
    
    Loan loan;
    LoanTerms loanTerms;
    Property property;
    MonthlyPayment monthlyPayment;
    ActorAccounts actorAccounts;
    
   /* mapping is equivalent to an associate array or hash
   Maps addresses of the actors in the mortgage contract with their balances
   */
   mapping (address => uint256) public balances;
   
   /* This means that if the mortgage holder calls this function, the
    function is executed and otherwise, an exception is thrown */
    modifier bankOnly {
      if(msg.sender != loan.actorAccounts.mortgageHolder) {
         throw;
      }
      _;
   }
    
   /* deposit into actor accounts and will return the balance of the user 
    after the deposit is made */
   function deposit(address receiver, uint amount) returns(uint256) {
        if (balances[msg.sender] < amount) return;
        balances[msg.sender] -= amount;
        balances[receiver] += amount;
        checkMortgagePayoff();
        return balances[receiver];
    }

    /* 'constant' prevents function from editing state variables; */
    function getBalance(address receiver) constant returns(uint256){
        return balances[receiver];
    }
    
    /* check if mortgage payment if complete, if complete, then release the property 
        lien to the homeowner */
    function checkMortgagePayoff(){
        if(balances[loan.actorAccounts.mortgageHolder]
                ==loan.monthlyPayment.pi*12*loan.loanTerms.term &&
            balances[loan.actorAccounts.insurer]
                ==loan.monthlyPayment.tax*12*loan.loanTerms.term &&
            balances[loan.actorAccounts.irs]
                ==loan.monthlyPayment.insurance*12*loan.loanTerms.term
        ){
            loan.property.owner = loanApplicant;
             LienReleased(loan.property.owner);
        }
    }
    
    
    /* Add loan details into the contract */
    function submitLoan(
            bytes32 _addressOfProperty,
            uint32 _purchasePrice,
            uint32 _term,
            uint32 _interest,
            uint32 _loanAmount,
            uint32 _annualTax,
            uint32 _annualInsurance, 
            uint32 _monthlyPi,
            uint32 _monthlyTax,
            uint32 _monthlyInsurance,
            address _mortgageHolder,
            address _insurer,
            address _irs
    ){
        loan.property.addressOfProperty = _addressOfProperty;
        loan.property.purchasePrice = _purchasePrice;
        loan.loanTerms.term=_term;
        loan.loanTerms.interest=_interest;
        loan.loanTerms.loanAmount=_loanAmount;
        loan.loanTerms.annualTax=_annualTax;
        loan.loanTerms.annualInsurance=_annualInsurance;
        loan.monthlyPayment.pi=_monthlyPi;
        loan.monthlyPayment.tax=_monthlyTax;
        loan.monthlyPayment.insurance=_monthlyInsurance;
        loan.actorAccounts.mortgageHolder = _mortgageHolder;
        loan.actorAccounts.insurer = _insurer;
        loan.actorAccounts.irs = _irs;
        loan.status = STATUS_SUBMITTED;
    }
    
    /* Gets loan details from the contract */
    function getLoanData() constant returns (
            bytes32 _addressOfProperty,
            uint32 _purchasePrice,
            uint32 _term,
            uint32 _interest,
            uint32 _loanAmount,
            uint32 _annualTax,
            uint32 _annualInsurance,
            int _status,
            uint32 _monthlyPi,
            uint32 _monthlyTax,
            uint32 _monthlyInsurance)
    {
        _addressOfProperty = loan.property.addressOfProperty;
        _purchasePrice=loan.property.purchasePrice;
        _term=loan.loanTerms.term;
        _interest=loan.loanTerms.interest;
        _loanAmount=loan.loanTerms.loanAmount;
        _annualTax=loan.loanTerms.annualTax;
        _annualInsurance=loan.loanTerms.annualInsurance;
        _monthlyPi=loan.monthlyPayment.pi;
        _monthlyTax=loan.monthlyPayment.tax;
        _monthlyInsurance=loan.monthlyPayment.insurance;
        _status = loan.status;
    }
    
    /* Approve or reject loan */
    function approveRejectLoan(int _status) bankOnly {
        //if(msg.sender == loanApplicant) throw;
        loan.status = _status ;
        /* if status is approved, transfer the lien of the property 
        to the mortgage holder */
        if(_status == STATUS_APPROVED)
        {
            loan.property.owner  = msg.sender;
            LienTrasferred(loan.property.owner);
        }
        LoanStatus(loan.status);
    }
}