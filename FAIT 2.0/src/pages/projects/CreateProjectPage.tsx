import React from 'react';
import { motion } from 'framer-motion';
import CreateProject from '../../components/projects/CreateProject';

const CreateProjectPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-semibold text-gray-900">Create New Project</h1>
        <p className="mt-1 text-sm text-gray-600">
          Fill out the form below to create a new project.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <CreateProject />
      </motion.div>
    </div>
  );
};

export default CreateProjectPage;
