const contractAddress = process.env.CHAIN_CONTRACT_ADDRESS || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
const chainAddress = process.env.CHAIN_URL || 'http://localhost:8545';

export const config = {
    contractAddress,
    networkAddress: chainAddress,
}