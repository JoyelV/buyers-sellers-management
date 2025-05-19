"use client";

import { useState, FormEvent, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../lib/authContext";
import ProtectedRoute from "../../../components/ProtectedRoute";
import toast from "react-hot-toast";

export default function CreateProject() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState("");
  const { user } = useAuth();
  const router = useRouter();

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    if (user && user.role !== "BUYER") {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!API_URL) {
      setError(
        "API URL is not defined. Please check your environment variables."
      );
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Not authenticated. Please log in.");
        return;
      }

      const response = await axios.post(
        `${API_URL}/project/create`,
        {
          title,
          description,
          budgetMin: parseFloat(budgetMin),
          budgetMax: parseFloat(budgetMax),
          deadline,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log(response, "response");

      if (!response) {
        throw new Error("Failed to create project");
      }

      toast.success("Project created successfully!", {
        duration: 2000,
        position: "top-right",
        style: {
          background: "#059669",
          color: "#fff",
          border: "1px solid #047857",
        },
        icon: "🎉",
      });
      router.push("/project/list");
    } catch (err) {
      const error = err as { response?: { data?: { error: string } } };
      setError(error.response?.data?.error || "Failed to create project");
      toast.error("Failed to create project. Please try again.");
    }
  };

  return (
    <ProtectedRoute requireAuth={true} redirectTo="/login">
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Create a New Project
          </h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {user && user.role === "BUYER" ? (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  rows={4}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Budget Range (Min)
                </label>
                <input
                  type="number"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  min="0"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Budget Range (Max)
                </label>
                <input
                  type="number"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  min={budgetMin || 0}
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1">
                  Deadline
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
              >
                Create Project
              </button>
            </form>
          ) : (
            <p className="text-red-500 text-center">
              Only buyers can create projects.
            </p>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
