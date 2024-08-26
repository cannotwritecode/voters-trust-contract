import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import VotingABI from '../../artifacts/contracts/Voting.sol/VotingSystem.json'

const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'

const VotingApp = () => {
  const [candidates, setCandidates] = useState([])
  const [winner, setWinner] = useState('')
  const [hasVoted, setHasVoted] = useState(false)
  const [voterAddress, setVoterAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [contract, setContract] = useState(null)

  useEffect(() => {
    if (window.ethereum) {
      const abi = VotingABI.abi
      const newProvider = new ethers.BrowserProvider(window.ethereum)
      newProvider.send('eth_requestAccounts', [])
      const newContract = new ethers.Contract(
        contractAddress,
        abi,
        newProvider.getSigner()
      )
      console.log(newContract)
      setContract(newContract)
      loadCandidates(newContract)
    } else {
      console.error('Please install MetaMask!')
    }
  }, [])

  const loadCandidates = async (contract) => {
    setLoading(true)
    const candidatesCount = await contract.candidates.length
    const candidatesArray = []
    for (let i = 0; i < candidatesCount; i++) {
      const candidate = await contract.interface.encodeFunctionData(
        'candidates',
        [i]
      )
      candidatesArray.push(candidate)
    }
    setCandidates(candidatesArray)
    setLoading(false)
  }

  const castVote = async (candidateId) => {
    try {
      const transaction = await contract.vote(candidateId)
      await transaction.wait()
      setHasVoted(true)
      loadCandidates(contract) // Reload candidates to update vote counts
    } catch (error) {
      console.error('Error casting vote:', error)
    }
  }

  const handleGiveRightToVote = async () => {
    try {
      const transaction = await contract.interface.encodeFunctionData(
        'giveRightToVote',
        [voterAddress]
      )
      console.log(transaction)
      // await transaction.wait()
      alert(`Voting right given to address: ${voterAddress}`)
      setVoterAddress('') // Reset input field
    } catch (error) {
      console.error('Error giving right to vote:', error)
    }
  }

  const getWinner = async () => {
    try {
      const winnerName = await contract.winnerDescription()
      setWinner(winnerName)
    } catch (error) {
      console.error('Error fetching winner:', error)
    }
  }

  return (
    <div>
      <h1>Voting System</h1>
      {loading ? (
        <p>Loading candidates...</p>
      ) : (
        <div>
          <h2>Candidates</h2>
          <ul>
            {candidates.map((candidate, index) => (
              <li key={index}>
                {candidate.name} - Votes: {candidate.voteCount}
                {!hasVoted && (
                  <button onClick={() => castVote(candidate.id)}>Vote</button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div>
        <input
          type="text"
          value={voterAddress}
          onChange={(e) => setVoterAddress(e.target.value)}
          placeholder="Enter voter address"
        />
        <button onClick={handleGiveRightToVote}>Give Right to Vote</button>
      </div>

      {hasVoted && (
        <div>
          <button onClick={getWinner}>Show Winner</button>
          <p>Winner: {winner}</p>
        </div>
      )}
    </div>
  )
}

export default VotingApp
