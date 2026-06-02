const contractAddress = process.env.CHAIN_CONTRACT_ADDRESS || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
const chainAddress = process.env.CHAIN_URL || 'http://localhost:8545';

export const config = {
    contractAddress,
    networkAddress: chainAddress,
    offchainConfig: {
        accessPrice: 10,
        favoritePrice: 10,
        renamePrice: 10000,
        rewardInterval: 86400,
        rewardAmount: 1000,
        moderatorIds: [

        ]
    }
}