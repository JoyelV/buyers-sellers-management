'use client';

import { useState, useEffect, FormEvent, ChangeEvent, useRef } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/authContext';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { ClipLoader } from 'react-spinners';

interface Project {
  id: number;
  title: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  deadline: string;
  buyer: { id: number; name: string; email: string };
  bids: Bid[];
  status: string;
  selectedBid?: Bid | null;
  deliverables?: Deliverable[]; // Make deliverables optional
  createdAt: string;
}

interface Bid {
  id: number;
  amount: number;
  message: string;
  seller: { id: number; name: string; email: string };
  createdAt: string;
}

interface Deliverable {
  id: number;
  fileUrl: string;
  seller: { id: number; name: string; email: string };
  createdAt: string;
}

export default function ProjectDetails() {
  const [project, setProject] = useState<Project | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidMessage, setBidMessage] = useState('');
  const [editingBid, setEditingBid] = useState<Bid | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const projectId = params.id;
  const fileInputRef = useRef<HTMLInputElement>(null);
  console.log('User:', user);
  console.log('Project:', project);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
  }, [projectId, user,API_URL]);

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
        response = await axios.put(
          `${API_URL}/project/bid`,
          { bidId: editingBid.id, amount, message: bidMessage },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('Bid updated successfully!');
      } else {
        response = await axios.post(
          `${API_URL}/project/bid`,
          { projectId: parseInt(projectId as string), amount, message: bidMessage },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('Bid placed successfully!');
      }
      console.log(response,"response from bid")
      setBidAmount('');
      setBidMessage('');

      const updatedProject = await axios.get(`${API_URL}/project/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProject(updatedProject.data.project);

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

  const handleDeleteBid = async (bidId: number) => {
    if (!confirm('Are you sure you want to delete your bid?')) return;

    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not authenticated. Please log in.');
        return;
      }

      await axios.delete(`${API_URL}/project/bid`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { bidId },
      });

      setSuccess('Bid deleted successfully!');
      setEditingBid(null);
      setBidAmount('');
      setBidMessage('');

      const updatedProject = await axios.get(`${API_URL}/project/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProject(updatedProject.data.project);
    } catch (err) {
      const error = err as { response?: { data?: { error: string } } };
      setError(error.response?.data?.error || 'Failed to delete bid');
    }
  };

  const handleSelectBid = async (bidId: number) => {
    if (!confirm('Are you sure you want to select this bid? This will assign the project to the seller.')) return;

    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not authenticated. Please log in.');
        return;
      }

      await axios.post(
        `${API_URL}/project/select-bid`,
        { projectId: parseInt(projectId as string), bidId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess('Bid selected successfully! The seller has been notified.');
      
      const updatedProject = await axios.get(`${API_URL}/project/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProject(updatedProject.data.project);
    } catch (err) {
      const error = err as { response?: { data?: { error: string } } };
      setError(error.response?.data?.error || 'Failed to select bid');
    }
  };

const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {
      setFile(null);
      setError('');
      return;
    }
    if (selectedFile.type !== 'application/pdf') {
      setError('Please upload a PDF file.');
      setFile(null);
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError(`File size (${(selectedFile.size / (1024 * 1024)).toFixed(1)}MB) exceeds 10MB limit.`);
      setFile(null);
      return;
    }
    setError('');
    setFile(selectedFile);
  };

  const handleDeliverableSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not authenticated. Please log in.');
        router.push('/login');
        return;
      }

      const formData = new FormData();
      formData.append('projectId', projectId as string);
      formData.append('file', file!);
      console.log('FormData contents:');
      for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
      const response = await axios.post(`${API_URL}/project/deliver`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setUploadProgress(percentCompleted);
        },
      });
      console.log(response,"response in posting deliverables")
      setSuccess('Deliverable submitted successfully!');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      const updatedProject = await axios.get(`${API_URL}/project/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProject(updatedProject.data.project);
    } catch (err) {
      const error = err as { response?: { data?: { error: string } } };
      setError(error.response?.data?.error || 'Failed to submit deliverable');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleCompleteProject = async () => {
    if (!confirm('Are you sure you want to mark this project as completed?')) return;

    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not authenticated. Please log in.');
        return;
      }

      await axios.post(
        `${API_URL}/project/complete`,
        { projectId: parseInt(projectId as string) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess('Project marked as completed! Both parties have been notified.');

      const updatedProject = await axios.get(`${API_URL}/project/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProject(updatedProject.data.project);
    } catch (err) {
      const error = err as { response?: { data?: { error: string } } };
      setError(error.response?.data?.error || 'Failed to complete project');
    }
  };

  const handleCancelEdit = () => {
    setEditingBid(null);
    setBidAmount('');
    setBidMessage('');
  };

if (!user) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <ClipLoader color="#3498db" size={50} />
    </div>
  );
}

if (!project) {
  return (
    <div className="container mx-auto p-4 flex justify-center items-center">
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <ClipLoader color="#3498db" size={50} aria-label="Loading project details" />
      )}
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
          <p>
            <strong>Status:</strong> {project.status}
          </p>
          {project.selectedBid && (
            <div className="mt-2 p-4 bg-green-100 rounded-md">
              <p>
                <strong>Selected Bid:</strong> ${project.selectedBid.amount} by {project.selectedBid.seller.name} ({project.selectedBid.seller.email})
              </p>
            </div>
          )}
        </div>

        {/* Deliverable Upload for Sellers */}
        {user && user.role === 'SELLER' && project.status === 'ASSIGNED' && project.selectedBid?.seller.id === user.id && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-bold mb-4">Submit Deliverable</h2>
            <form onSubmit={handleDeliverableSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Upload PDF (Max 10MB)</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="w-full p-2 border rounded-md"
                  ref={fileInputRef}
                />
              </div>
              {isUploading && (
                <div className="mt-2">
                  <progress value={uploadProgress} max="100" className="w-full" />
                  <p>{uploadProgress}%</p>
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 disabled:bg-gray-300"
                disabled={isUploading || !file}
              >
                {isUploading ? 'Uploading...' : 'Submit Deliverable'}
              </button>
            </form>
          </div>
        )}

        {/* Bidding Form for Sellers */}
        {user && user.role === 'SELLER' && project.status === 'OPEN' && (
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

        {/* List of Deliverables */}
<div className="bg-white p-6 rounded-lg shadow-md mb-6">
  <h2 className="text-xl font-bold mb-4">Deliverables</h2>
  {project.deliverables && project.deliverables.length > 0 ? (
    <div className="grid gap-4">
      {project.deliverables.map((deliverable) => (
        <div key={deliverable.id} className="border p-4 rounded-md">
          <p>
            <strong>File:</strong>{' '}
            <a
              href={deliverable.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              View PDF
            </a>
          </p>
          <p>
            <a
              href={deliverable.fileUrl}
                            target="_blank"

              download
              className="text-green-500 hover:underline"
            >
              Download PDF
            </a>
          </p>
          <p>
            <strong>Submitted by:</strong> {deliverable.seller.name} ({deliverable.seller.email})
          </p>
          <p>
            <strong>Submitted on:</strong>{' '}
            {new Date(deliverable.createdAt).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  ) : (
    <p>No deliverables have been submitted yet.</p>
  )}
</div>

        {/* Complete Project for Buyers */}
        {user && user.role === 'BUYER' && user.id === project.buyer.id && project.status === 'ASSIGNED' && project.deliverables && project.deliverables.length > 0  && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-bold mb-4">Complete Project</h2>
            <button
              onClick={handleCompleteProject}
              className="w-full bg-green-500 text-white p-2 rounded-md hover:bg-green-600"
            >
              Mark Project as Completed
            </button>
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
                <div key={bid.id} className="border p-4 rounded-md relative">
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
                  {user && user.id === bid.seller.id && isBiddingOpen && project.status === 'OPEN' && (
                    <button
                      onClick={() => handleDeleteBid(bid.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600"
                    >
                      Delete Bid
                    </button>
                  )}
                  {user && user.role === 'BUYER' && user.id === project.buyer.id && project.status === 'OPEN' && (
                    <button
                      onClick={() => handleSelectBid(bid.id)}
                      className="absolute bottom-2 right-2 bg-green-500 text-white px-2 py-1 rounded-md hover:bg-green-600"
                    >
                      Select Bid
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}