import React, { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { parseEther } from 'viem';

// 1. Make sure you have your ABI in this file
import GuestbookABI from './abi.json';

// 2. Paste your deployed contract address here
const contractAddress = '0x28f067915af9a65547e0A74a1873856315143d3f';

// Define a TypeScript type for your signature struct
interface Signature {
  owner: `0x${string}`;
  message: string;
  timestamp: bigint;
}

// Main App Component (Container)
export function App() {
  const { address, isConnected } = useAccount();

  return (
    <div className="container">
      <h1>On-Chain Guestbook</h1>
      <ConnectWallet />
      {isConnected && address && <Guestbook userAddress={address} />}
    </div>
  );
}

// Wallet Connection Component
function ConnectWallet() {
  const { isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <div className="wallet-info">
        <p>You are connected!</p>
        <button onClick={() => disconnect()}>Disconnect</button>
      </div>
    );
  }
  return <button onClick={() => connect({ connector: injected() })}>Connect Wallet</button>;
}

// Main Guestbook Interaction Component
function Guestbook({ userAddress }: { userAddress: `0x${string}` }) {
  const [message, setMessage] = useState('');

  // Hook to WRITE to your contract's `Sign` function
  const { data: hash, writeContract } = useWriteContract();

  // Hook to READ from your contract's `ShowSignatures` function
  const { data: signatures, isLoading: isReading, refetch } = useReadContract({
    address: contractAddress,
    abi: GuestbookABI,
    functionName: 'ShowSignatures',
  });

  // Hook to wait for the transaction to be confirmed
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // NEW: Use useEffect to run code after transaction is confirmed
  useEffect(() => {
    if (isConfirmed) {
      // When the transaction succeeds, refetch the signatures and clear the input
      refetch();
      setMessage('');
    }
  }, [isConfirmed, refetch]); // This effect runs when `isConfirmed` or `refetch` changes

  // Function to handle the form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message) return;
    writeContract({
      address: contractAddress,
      abi: GuestbookABI,
      functionName: 'Sign',
      args: [message],
      value: parseEther('0.0001'), // Fee from your contract
    });
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="form">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your message..."
          disabled={isConfirming}
        />
        <button type="submit" disabled={isConfirming}>
          {isConfirming ? 'Signing...' : 'Sign Guestbook (0.0001 ETH)'}
        </button>
      </form>

      {hash && <div className="status-message">Transaction Hash: {hash.slice(0, 10)}...</div>}
      {isConfirming && <div className="status-message">Waiting for confirmation...</div>}
      {isConfirmed && <div className="status-message success">Signature added!</div>}

      <h2>Signatures</h2>
      {isReading ? (
        <div>Loading signatures...</div>
      ) : (
        <ul className="signatures-list">
          {Array.isArray(signatures) &&
            [...signatures].reverse().map((sig: Signature, index) => (
              <li key={index} className="signature-item">
                <p className="message">"{sig.message}"</p>
                <p className="address">
                  - {sig.owner.toLowerCase() === userAddress.toLowerCase() ? 'You' : `${sig.owner.slice(0, 6)}...${sig.owner.slice(-4)}`}
                </p>
                <p className="timestamp">{new Date(Number(sig.timestamp) * 1000).toLocaleString()}</p>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
