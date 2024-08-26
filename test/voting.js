const { ethers } = require('hardhat')
const { expect } = require('chai')

describe('VotingSystem', function () {
  async function deployVotingSystemFixture() {
    const candidateNames = ['Alice', 'Bob', 'Charlie']
    const [chairperson, voter1, voter2] = await ethers.getSigners()

    const VotingSystem = await ethers.getContractFactory('VotingSystem')
    const votingSystem = await VotingSystem.deploy(candidateNames)

    return { votingSystem, candidateNames, chairperson, voter1, voter2 }
  }

  describe('Deployment', function () {
    it('Should set the right chairperson', async function () {
      const { votingSystem, chairperson } = await deployVotingSystemFixture()
      expect(await votingSystem.chairperson()).to.equal(chairperson.address)
    })

    it('Should initialize the candidates correctly', async function () {
      const { votingSystem, candidateNames } = await deployVotingSystemFixture()
      for (let i = 0; i < candidateNames.length; i++) {
        const candidate = await votingSystem.candidates(i)
        expect(candidate.name).to.equal(candidateNames[i])
        expect(candidate.voteCount).to.equal(0)
      }
    })
  })

  describe('Voting Rights', function () {
    it('Should give the right to vote', async function () {
      const { votingSystem, voter1, chairperson } =
        await deployVotingSystemFixture()

      await expect(votingSystem.giveRightToVote(voter1.address))
        .to.emit(votingSystem, 'VoterRightGiven')
        .withArgs(voter1.address)

      expect(await votingSystem.isVoter(voter1.address)).to.be.true
    })

    it('Should only allow chairperson to give the right to vote', async function () {
      const { votingSystem, voter1, voter2 } = await deployVotingSystemFixture()
      await expect(
        votingSystem.connect(voter1).giveRightToVote(voter2.address)
      ).to.be.revertedWith('Only the Chairperson can give right to vote!')
    })

    it('Should prevent giving the right to vote twice', async function () {
      const { votingSystem, voter1, chairperson } =
        await deployVotingSystemFixture()
      await votingSystem.giveRightToVote(voter1.address)
      await expect(
        votingSystem.giveRightToVote(voter1.address)
      ).to.be.revertedWith('The voter already has the right to vote!')
    })
  })

  describe('Voting', function () {
    it('Should allow a voter to vote', async function () {
      const { votingSystem, voter1 } = await deployVotingSystemFixture()

      await votingSystem.giveRightToVote(voter1.address)
      await votingSystem.connect(voter1).vote(0)

      const candidate = await votingSystem.candidates(0)
      expect(candidate.voteCount).to.equal(1)
    })

    it('Should prevent a voter from voting without rights', async function () {
      const { votingSystem, voter1 } = await deployVotingSystemFixture()
      await expect(votingSystem.connect(voter1).vote(0)).to.be.revertedWith(
        'Has no right to vote.'
      )
    })

    it('Should prevent double voting', async function () {
      const { votingSystem, voter1 } = await deployVotingSystemFixture()

      await votingSystem.giveRightToVote(voter1.address)
      await votingSystem.connect(voter1).vote(0)

      await expect(votingSystem.connect(voter1).vote(0)).to.be.revertedWith(
        'The voter has already voted.'
      )
    })
  })

  describe('Winning Candidate', function () {
    it('Should return the correct winning candidate', async function () {
      const { votingSystem, voter1, voter2 } = await deployVotingSystemFixture()

      await votingSystem.giveRightToVote(voter1.address)
      await votingSystem.giveRightToVote(voter2.address)

      await votingSystem.connect(voter1).vote(1)
      await votingSystem.connect(voter2).vote(1)

      expect(await votingSystem.winningCandidate()).to.equal(1)
    })

    it('Should return the correct winner description', async function () {
      const { votingSystem, voter1, voter2 } = await deployVotingSystemFixture()

      await votingSystem.giveRightToVote(voter1.address)
      await votingSystem.giveRightToVote(voter2.address)

      await votingSystem.connect(voter1).vote(2)
      await votingSystem.connect(voter2).vote(2)

      expect(await votingSystem.winnerDescription()).to.equal('Charlie')
    })
  })
})
