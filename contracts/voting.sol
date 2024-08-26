// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

contract VotingSystem {
  struct Candidate {
    uint id;
    string name;
    uint voteCount;
  }

  struct Voter {
    bool voted;
    uint votes;
  }
  address public chairperson;
  mapping (address => Voter) public voters;
  mapping (address => bool) public isVoter;
  Candidate[] public candidates;
  event VoterRightGiven(address voter);

  constructor(string[] memory candidateNames ) {
    chairperson = msg.sender;
    for(uint i = 0; i < candidateNames.length; i++){
      candidates.push(Candidate({
        id: i,
        name: candidateNames[i],
        voteCount: 0
      }));
    }
  }

  modifier onlyChairPerson() {
    require(msg.sender == chairperson, "Only the Chairperson can give right to vote!" );
    _;
  }
  modifier nonVoter(address _voter) {
    require(!isVoter[_voter], "The voter already has the right to vote!");
    _;
  }
  modifier aVoter() {
    require(isVoter[msg.sender], "Has no right to vote.");
    _;
  }
  function giveRightToVote(address voter) public onlyChairPerson nonVoter(voter) {
    isVoter[voter] = true;
    emit VoterRightGiven(voter);
  }
  function vote(uint _candidate) public aVoter {
    require(!voters[msg.sender].voted, "The voter has already voted.");
    voters[msg.sender].voted = true;
    candidates[_candidate].voteCount += 1;
  }

  function winningCandidate() public view returns (uint _winningCandidate){
    uint winnigVotecount = 0;
    for(uint p = 0; p < candidates.length; p++){
      if(candidates[p].voteCount > winnigVotecount){
        winnigVotecount = candidates[p].voteCount;
        _winningCandidate = p;
      }
    }
  }
  function winnerDescription() public view returns (string memory _winnerDescription){
    _winnerDescription = candidates[winningCandidate()].name;
  }
}
