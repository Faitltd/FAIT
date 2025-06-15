import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { ProjectManagementService } from '../../services/project/ProjectManagementService';

interface ChatMessage {
  id: string;
  type: 'bot' | 'user' | 'form';
  content: string | React.ReactNode;
  timestamp: Date;
}

interface FormData {
  projectType: string;
  description: string;
  deadline: string;
  budget: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  preferredSkills: string[];
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const chatRef = useRef<HTMLDivElement>(null);
  const projectService = ProjectManagementService.getInstance();

  const { register, handleSubmit, watch, setValue } = useForm<FormData>();

  const steps = [
    {
      question: "Hi! I'm here to help you create a work request. What type of project are you looking to start?",
      options: ['Website Development', 'Mobile App', 'Design Work', 'Consulting', 'Other'],
      field: 'projectType'
    },
    {
      question: "Great! Could you describe what you need done?",
      type: 'text',
      field: 'description'
    },
    {
      question: "When would you like this completed?",
      type: 'date',
      field: 'deadline'
    },
    {
      question: "What's your budget for this project?",
      type: 'number',
      field: 'budget'
    },
    {
      question: "How urgent is this project?",
      options: ['Low', 'Medium', 'High', 'Urgent'],
      field: 'priority'
    }
  ];

  useEffect(() => {
    if (messages.length > 0 && chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    setMessages(prev => [...prev, {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date()
    }]);
  };

  const handleOptionSelect = (option: string) => {
    setValue(steps[currentStep].field as keyof FormData, option.toLowerCase());
    addMessage({ type: 'user', content: option });
    
    if (currentStep < steps.length - 1) {
      setTimeout(() => {
        addMessage({ type: 'bot', content: steps[currentStep + 1].question });
        setCurrentStep(prev => prev + 1);
      }, 500);
    } else {
      showSummary();
    }
  };

  const showSummary = () => {
    const formData = watch();
    addMessage({
      type: 'form',
      content: (
        <ProjectSummary
          data={formData}
          onConfirm={handleProjectSubmit}
          onEdit={() => setCurrentStep(0)}
        />
      )
    });
  };

  const handleProjectSubmit = async (data: FormData) => {
    try {
      const project = await projectService.createProject({
        title: `${data.projectType} Project`,
        description: data.description,
        priority: data.priority,
        deadline: new Date(data.deadline),
        budget: data.budget,
        requiredSkills: parseSkills(data.preferredSkills),
      });

      addMessage({
        type: 'bot',
        content: (
          <div className="success-message">
            <h3>Project Created Successfully!</h3>
            <p>Project ID: {project.id}</p>
            <p>We'll be in touch soon with next steps.</p>
          </div>
        )
      });
    } catch (error) {
      addMessage({
        type: 'bot',
        content: "I'm sorry, there was an error creating your project. Please try again."
      });
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white rounded-lg shadow-xl w-96 h-[600px] flex flex-col"
          >
            <div className="p-4 bg-blue-600 text-white rounded-t-lg flex justify-between items-center">
              <h2 className="text-lg font-semibold">Project Assistant</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200"
              >
                <span className="sr-only">Close</span>
                <XIcon className="h-6 w-6" />
              </button>
            </div>

            <div
              ref={chatRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {messages.map(message => (
                <ChatMessage key={message.id} message={message} />
              ))}
            </div>

            <div className="p-4 border-t">
              {currentStep < steps.length && (
                <ChatOptions
                  step={steps[currentStep]}
                  onSelect={handleOptionSelect}
                  register={register}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg flex items-center justify-center"
      >
        <ChatIcon className="h-6 w-6" />
        <span className="sr-only">Open Chat</span>
      </button>
    </div>
  );
}

function ChatMessage({ message }: { message: ChatMessage }) {
  const { type, content } = message;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${type === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`
          max-w-[80%] rounded-lg p-3
          ${type === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}
          ${type === 'form' ? 'w-full bg-white border' : ''}
        `}
      >
        {content}
      </div>
    </motion.div>
  );
}

function ChatOptions({ 
  step, 
  onSelect, 
  register 
}: { 
  step: any; 
  onSelect: (option: string) => void;
  register: any;
}) {
  if (step.options) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {step.options.map((option: string) => (
          <button
            key={option}
            onClick={() => onSelect(option)}
            className="bg-gray-100 hover:bg-gray-200 rounded-lg p-2 text-sm"
          >
            {option}
          </button>
        ))}
      </div>
    );
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      onSelect(e.currentTarget.elements[step.field].value);
    }}>
      {step.type === 'text' && (
        <textarea
          {...register(step.field)}
          className="w-full p-2 border rounded-lg"
          placeholder="Type your response..."
          rows={3}
        />
      )}
      {step.type === 'date' && (
        <input
          type="date"
          {...register(step.field)}
          className="w-full p-2 border rounded-lg"
        />
      )}
      {step.type === 'number' && (
        <input
          type="number"
          {...register(step.field)}
          className="w-full p-2 border rounded-lg"
          placeholder="Enter amount..."
        />
      )}
      <button
        type="submit"
        className="mt-2 bg-blue-600 text-white rounded-lg px-4 py-2 w-full"
      >
        Continue
      </button>
    </form>
  );
}

function ProjectSummary({ 
  data, 
  onConfirm, 
  onEdit 
}: { 
  data: FormData;
  onConfirm: (data: FormData) => void;
  onEdit: () => void;
}) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Project Summary</h3>
      <div className="space-y-2">
        <p><strong>Type:</strong> {data.projectType}</p>
        <p><strong>Description:</strong> {data.description}</p>
        <p><strong>Deadline:</strong> {new Date(data.deadline).toLocaleDateString()}</p>
        <p><strong>Budget:</strong> ${data.budget}</p>
        <p><strong>Priority:</strong> {data.priority}</p>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => onConfirm(data)}
          className="bg-green-600 text-white rounded-lg px-4 py-2 flex-1"
        >
          Confirm & Submit
        </button>
        <button
          onClick={onEdit}
          className="bg-gray-200 text-gray-800 rounded-lg px-4 py-2"
        >
          Edit
        </button>
      </div>
    </div>
  );
}

// Add necessary styles
const styles = `
  .chatbot-container {
    /* Add any additional styles */
  }
`;