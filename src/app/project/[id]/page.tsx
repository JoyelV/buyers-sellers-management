'use client';

import { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { useAuth } from '../../../lib/authContext';
import ProtectedRoute from '../../../components/ProtectedRoute';

interface Project {
  id: number;
  title: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  deadline: string;
  buyer: { id: number; name: string; email: string };
  bids: Bid[];
  createdAt: string;
}

interface Bid {
  id: number;
  amount: number;
  message: string;
  seller: { id: number; name: string; email: string };
  createdAt: string;
}

export default function ProjectDetails() {
  const [project, setProject] = useState<Project | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidMessage, setBidMessage] = useState(''); // Add state for message
  const [editingBid, setEditingBid] = useState<Bid | null>(null); // Track if editing a bid
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useAuth();
  //const router = useRouter();
  const params = useParams();
  const projectId = params.id;

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  // Fetch project details
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Not authenticated. Please log in.');
          return;
        }

        const response = await axios.get(`${API_URL}/project/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProject(response.data.project);

        // Check if the current user has already placed a bid
        if (user) {
          const existingBid = response.data.project.bids.find(
            (bid: Bid) => bid.seller.id === user.id
          );
          if (existingBid) {
            setEditingBid(existingBid);
            setBidAmount(existingBid.amount.toString());
            setBidMessage(existingBid.message);
          }
        }
      } catch (err) {
        const error = err as { response?: { data?: { error: string } } };
        setError(error.response?.data?.error || 'Failed to fetch project');
      }
    };

    fetchProject();
  }, [projectId, user]);

  // Handle bid submission (create or update)
  const handleBidSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!user || user.role !== 'SELLER') {
      setError('Only sellers can place bids.');
      return;
    }

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid bid amount greater than 0.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not authenticated. Please log in.');
        return;
      }

      let response;
      if (editingBid) {
        // Update existing bid
        response = await axios.put(
          `${API_URL}/project/bid`,
          { bidId: editingBid.id, amount, message: bidMessage },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('Bid updated successfully!');
      } else {
        // Create new bid
        response = await axios.post(
          `${API_URL}/project/bid`,
          { projectId: parseInt(projectId as string), amount, message: bidMessage },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('Bid placed successfully!');
      }
      console.log(response,"response from bid post")
      setBidAmount('');
      setBidMessage('');

      // Refresh project data to show the updated/new bid
      const updatedProject = await axios.get(`${API_URL}/project/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProject(updatedProject.data.project);

      // Update editing state if a new bid was placed
      if (!editingBid) {
        const newBid = updatedProject.data.project.bids.find(
          (bid: Bid) => bid.seller.id === user.id
        );
        if (newBid) {
          setEditingBid(newBid);
          setBidAmount(newBid.amount.toString());
          setBidMessage(newBid.message);
        }
      }
    } catch (err) {
      const error = err as { response?: { data?: { error: string } } };
      setError(error.response?.data?.error || editingBid ? 'Failed to update bid' : 'Failed to place bid');
    }
  };

  // Cancel editing and reset form
  const handleCancelEdit = () => {
    setEditingBid(null);
    setBidAmount('');
    setBidMessage('');
  };

  if (!project) {
    return (
      <div className="container mx-auto p-4">
        {error ? <p className="text-red-500">{error}</p> : <p>Loading...</p>}
      </div>
    );
  }

  const deadlineDate = new Date(project.deadline);
  const isBiddingOpen = deadlineDate > new Date();

  return (
    <ProtectedRoute requireAuth={true} redirectTo="/login">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">{project.title}</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}

        {/* Project Details */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <p className="text-gray-600">{project.description}</p>
          <p className="mt-2">
            <strong>Budget:</strong> ${project.budgetMin} - ${project.budgetMax}
          </p>
          <p>
            <strong>Deadline:</strong> {deadlineDate.toLocaleDateString()}
          </p>
          <p>
            <strong>Posted by:</strong> {project.buyer.name} ({project.buyer.email})
          </p>
          <p>
            <strong>Created:</strong> {new Date(project.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Bidding Form for Sellers */}
        {user && user.role === 'SELLER' && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-bold mb-4">{editingBid ? 'Edit Your Bid' : 'Place a Bid'}</h2>
            {isBiddingOpen ? (
              <form onSubmit={handleBidSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Your Bid Amount ($)</label>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    min="1"
                    step="0.01"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Message (Optional)</label>
                  <textarea
                    value={bidMessage}
                    onChange={(e) => setBidMessage(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    rows={3}
                    placeholder="Add a message to the buyer (e.g., why you're the best fit for this project)"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
                  >
                    {editingBid ? 'Update Bid' : 'Submit Bid'}
                  </button>
                  {editingBid && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="w-full bg-gray-500 text-white p-2 rounded-md hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            ) : (
              <p className="text-red-500">Bidding is closed for this project.</p>
            )}
          </div>
        )}

        {/* List of Bids */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Bids</h2>
          {project.bids.length === 0 ? (
            <p>No bids have been placed yet.</p>
          ) : (
            <div className="grid gap-4">
              {project.bids.map((bid) => (
                <div key={bid.id} className="border p-4 rounded-md">
                  <p>
                    <strong>Amount:</strong> ${bid.amount}
                  </p>
                  {bid.message && (
                    <p>
                      <strong>Message:</strong> {bid.message}
                    </p>
                  )}
                  <p>
                    <strong>Placed by:</strong> {bid.seller.name} ({bid.seller.email})
                  </p>
                  <p>
                    <strong>Placed on:</strong>{' '}
                    {new Date(bid.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}