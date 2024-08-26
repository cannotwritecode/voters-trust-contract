// Import the `buildModule` function from the Hardhat Ignition library.
const { buildModule } = require('@nomicfoundation/hardhat-ignition/modules')

// Export the module using the `buildModule` function.
// The module is named "VotingSystemModule", and `m` is a module builder object provided by Ignition.
module.exports = buildModule('VotingSystemModule', (m) => {
  // Get the `candidateNames` parameter from the module, or provide default candidate names.
  // This array of strings represents the names of candidates to be added to the voting system.
  const candidateNames = m.getParameter('candidateNames', [
    'Alice',
    'Bob',
    'Charlie',
  ])

  // Deploy the `VotingSystem` contract, passing the `candidateNames` array as a constructor argument.
  const votingSystem = m.contract('VotingSystem', [candidateNames])

  // Return an object with the deployed `votingSystem` contract.
  // This allows other modules or scripts to access the deployed contract instance.
  return { votingSystem }
})
