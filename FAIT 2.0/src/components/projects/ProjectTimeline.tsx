import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Plus, 
  Edit2, 
  Trash2, 
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { ProjectTimeline as TimelineType } from '../../types/project';
import { projectService } from '../../services/ProjectService';

interface ProjectTimelineProps {
  projectId: string;
  isEditable?: boolean;
}

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ 
  projectId, 
  isEditable = false 
}) => {
  const [timelineEvents, setTimelineEvents] = useState<TimelineType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Form state for adding/editing timeline events
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    color: '#3b82f6' // Default blue color
  });

  useEffect(() => {
    fetchTimelineEvents();
  }, [projectId]);

  const fetchTimelineEvents = async () => {
    try {
      setLoading(true);
      const data = await projectService.getProjectTimeline(projectId);
      setTimelineEvents(data);
      setError(null);
    } catch (err) {
      setError('Failed to load timeline');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const newEvent = await projectService.createTimelineEvent({
        project_id: projectId,
        title: formData.title,
        description: formData.description,
        start_date: formData.start_date,
        end_date: formData.end_date,
        color: formData.color
      });

      if (newEvent) {
        setTimelineEvents([...timelineEvents, newEvent]);
        setIsAddingEvent(false);
        setFormData({
          title: '',
          description: '',
          start_date: '',
          end_date: '',
          color: '#3b82f6'
        });
      }
    } catch (err) {
      console.error('Failed to add timeline event:', err);
    }
  };

  const handleEditEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingEventId) return;
    
    try {
      const updatedEvent = await projectService.updateTimelineEvent(
        editingEventId,
        {
          title: formData.title,
          description: formData.description,
          start_date: formData.start_date,
          end_date: formData.end_date,
          color: formData.color
        }
      );

      if (updatedEvent) {
        setTimelineEvents(timelineEvents.map(event => 
          event.id === editingEventId ? updatedEvent : event
        ));
        setEditingEventId(null);
        setFormData({
          title: '',
          description: '',
          start_date: '',
          end_date: '',
          color: '#3b82f6'
        });
      }
    } catch (err) {
      console.error('Failed to update timeline event:', err);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this timeline event?')) return;
    
    try {
      const success = await projectService.deleteTimelineEvent(id);
      
      if (success) {
        setTimelineEvents(timelineEvents.filter(event => event.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete timeline event:', err);
    }
  };

  const startEditEvent = (event: TimelineType) => {
    setFormData({
      title: event.title,
      description: event.description,
      start_date: event.start_date,
      end_date: event.end_date,
      color: event.color || '#3b82f6'
    });
    setEditingEventId(event.id);
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-gray-200 bg-gray-50"></div>);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      
      // Find events for this day
      const eventsForDay = timelineEvents.filter(event => {
        const startDate = new Date(event.start_date);
        const endDate = new Date(event.end_date);
        return date >= startDate && date <= endDate;
      });
      
      days.push(
        <div key={day} className="h-24 border border-gray-200 p-1 overflow-hidden">
          <div className="text-right text-xs text-gray-500">{day}</div>
          <div className="mt-1 space-y-1 overflow-y-auto max-h-16">
            {eventsForDay.map(event => (
              <div 
                key={event.id}
                className="text-xs p-1 rounded truncate cursor-pointer"
                style={{ backgroundColor: event.color || '#3b82f6', color: 'white' }}
                onClick={() => isEditable && startEditEvent(event)}
                title={event.title}
              >
                {event.title}
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    return days;
  };

  if (loading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="text-red-500 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Project Timeline</h3>
        {isEditable && (
          <button
            onClick={() => setIsAddingEvent(true)}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Event
          </button>
        )}
      </div>

      {isAddingEvent && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <form onSubmit={handleAddEvent} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                name="title"
                id="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                id="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <input
                  type="date"
                  name="start_date"
                  id="start_date"
                  required
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
                  End Date
                </label>
                <input
                  type="date"
                  name="end_date"
                  id="end_date"
                  required
                  value={formData.end_date}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="color" className="block text-sm font-medium text-gray-700">
                Color
              </label>
              <input
                type="color"
                name="color"
                id="color"
                value={formData.color}
                onChange={handleInputChange}
                className="mt-1 block border border-gray-300 rounded-md shadow-sm h-10 w-20"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsAddingEvent(false)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add Event
              </button>
            </div>
          </form>
        </div>
      )}

      {editingEventId && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <form onSubmit={handleEditEvent} className="space-y-4">
            <div>
              <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                name="title"
                id="edit-title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                id="edit-description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="edit-start_date" className="block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <input
                  type="date"
                  name="start_date"
                  id="edit-start_date"
                  required
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="edit-end_date" className="block text-sm font-medium text-gray-700">
                  End Date
                </label>
                <input
                  type="date"
                  name="end_date"
                  id="edit-end_date"
                  required
                  value={formData.end_date}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="edit-color" className="block text-sm font-medium text-gray-700">
                Color
              </label>
              <input
                type="color"
                name="color"
                id="edit-color"
                value={formData.color}
                onChange={handleInputChange}
                className="mt-1 block border border-gray-300 rounded-md shadow-sm h-10 w-20"
              />
            </div>
            
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => handleDeleteEvent(editingEventId)}
                className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </button>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingEventId(null)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Update Event
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="p-4">
        {/* Calendar navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft className="h-5 w-5 text-gray-500" />
          </button>
          
          <h3 className="text-lg font-medium text-gray-900">
            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h3>
          
          <button
            onClick={nextMonth}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ChevronRight className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-px">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-medium text-gray-500 text-xs py-2">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {generateCalendarDays()}
        </div>
      </div>

      {/* Timeline events list */}
      <div className="p-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Timeline Events</h4>
        
        {timelineEvents.length === 0 ? (
          <p className="text-sm text-gray-500">No timeline events have been added yet.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {timelineEvents.map(event => (
              <li key={event.id} className="py-3">
                <div className="flex items-start">
                  <div 
                    className="h-4 w-4 rounded-full mt-1 mr-3"
                    style={{ backgroundColor: event.color || '#3b82f6' }}
                  ></div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <h5 className="text-sm font-medium text-gray-900">{event.title}</h5>
                      {isEditable && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEditEvent(event)}
                            className="text-gray-400 hover:text-gray-500"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {event.description && (
                      <p className="mt-1 text-sm text-gray-500">{event.description}</p>
                    )}
                    
                    <div className="mt-1 flex items-center text-xs text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{formatDate(event.start_date)} - {formatDate(event.end_date)}</span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ProjectTimeline;
