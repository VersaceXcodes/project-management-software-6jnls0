import React, { useState, useEffect, ChangeEvent } from "react";
import axios from "axios";
import { Link, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/main";
import { motion } from "framer-motion";

const UV_Dashboard: React.FC = () => {
  // Get global variables from redux store
  const { auth_token, global_search_query } = useSelector((state: RootState) => state.global);
  
  // useSearchParams for reading/updating URL query parameters
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  // Local state definitions
  const [project_list, setProjectList] = useState<any[]>([]);
  const [search_query, setSearchQuery] = useState<string>(initialSearch);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);  // Effect: Sync local search_query with global search query if global changes
  useEffect(() => {
    if (global_search_query !== search_query) {
      setSearchQuery(global_search_query);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [global_search_query]);

  // Function: Fetch projects from the backend using GET /api/projects
  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      // Build endpoint using VITE_API_BASE_URL from environment variables
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
      // Sending also a search parameter, even though backend officially supports "archived"
      const response = await axios.get(`${baseUrl}/api/projects`, {
        headers: { Authorization: `Bearer ${auth_token}` },
        params: { archived: 0, search: search_query }
      });
      setProjectList(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setIsLoading(false);
    }
  };
  // Effect: Fetch projects on mount, on search_query change, or if auth_token changes
  useEffect(() => {
    if (auth_token) {
      fetchProjects();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search_query, auth_token]);

  // Handle search input changes: update local state and URL parameters and re-fetch projects
  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setSearchQuery(newQuery);
    setSearchParams({ search: newQuery });
    // No need to call fetchProjects here explicitly because useEffect will catch the updated search_query
  };

  // Function to simulate the opening of the Create Project modal
  const openCreateProjectModal = () => {
    // In a real scenario, this would trigger showing the UV_CreateProjectModal.
    // For now, we just log a message.
    console.log("Create Project modal should be triggered here.");
    alert("Create Project modal triggered.");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -250 }}
        animate={{ x: sidebarOpen ? 0 : -250 }}
        transition={{ duration: 0.3 }}
        className="bg-blue-800 text-white w-64 p-6 fixed h-full z-20"
      >
        <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
        <nav>
          <ul className="space-y-2">
            <li><a href="#" className="block py-2 px-4 hover:bg-blue-700 rounded">Projects</a></li>
            <li><a href="#" className="block py-2 px-4 hover:bg-blue-700 rounded">Tasks</a></li>
            <li><a href="#" className="block py-2 px-4 hover:bg-blue-700 rounded">Team</a></li>
            <li><a href="#" className="block py-2 px-4 hover:bg-blue-700 rounded">Analytics</a></li>
          </ul>
        </nav>
      </motion.div>

      {/* Main content */}
      <div className={`flex-1 p-10 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold text-gray-800">Project Dashboard</h1>
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Search projects..."
                value={search_query}
                onChange={handleSearch}
                className="border border-gray-300 p-2 rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={openCreateProjectModal}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105"
              >
                Create Project
              </button>
            </div>
          </div>        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : project_list.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No projects</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new project.</p>
            <div className="mt-6">
              <button
                type="button"
                onClick={openCreateProjectModal}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                New Project
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {project_list.map((project) => (
              <Link key={project.id} to={`/projects/${project.id}`} className="block">
                <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1">
                  <h3 className="text-xl font-bold mb-2 text-gray-800">{project.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Deadline: {new Date(project.end_date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    Milestones: {project.milestones ? project.milestones.length : 0}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${project.progress || 0}%` }}
                    ></div>
                  </div>
                  <p className="text-right text-sm font-medium text-blue-600">
                    {project.progress || 0}% Complete
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );};

export default UV_Dashboard;