'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link'; // Add Link
//import { useAuth } from '../../../lib/authContext';
import ProtectedRoute from '../../../components/ProtectedRoute';

interface Project {
  id: number;
  title: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  deadline: string;
  buyer: { id: number; name: string; email: string };
  createdAt: string;
}

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState('');
  //const { user } = useAuth();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Not authenticated. Please log in.');
          return;
        }

        const response = await axios.get(`${API_URL}/project`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProjects(response.data.projects);
      } catch (err) {
        const error = err as { response?: { data?: { error: string } } };
        setError(error.response?.data?.error || 'Failed to fetch projects');
      }
    };

    fetchProjects();
  });

  return (
    <ProtectedRoute requireAuth={true} redirectTo="/login">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Available Projects</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {projects.length === 0 ? (
          <p>No projects available.</p>
        ) : (
          <div className="grid gap-4">
            {projects.map((project) => (
              <div key={project.id} className="bg-white p-4 rounded-lg shadow-md">
                <Link href={`/project/${project.id}`}>
                  <h2 className="text-xl font-bold text-blue-500 hover:underline">
                    {project.title}
                  </h2>
                </Link>
                <p className="text-gray-600">{project.description}</p>
                <p className="mt-2">
                  <strong>Budget:</strong> ${project.budgetMin} - ${project.budgetMax}
                </p>
                <p>
                  <strong>Deadline:</strong> {new Date(project.deadline).toLocaleDateString()}
                </p>
                <p>
                  <strong>Posted by:</strong> {project.buyer.name} ({project.buyer.email})
                </p>
                <p>
                  <strong>Created:</strong> {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}