// components/forms/CTFForm.jsx
import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import { 
  Calendar, 
  Clock, 
  Link as LinkIcon,
  Eye,
  EyeOff,
  Save,
  X
} from 'lucide-react';

const CTFForm = ({ ctf, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Web Security',
    points: 10,
    difficulty: 'Easy',
    activeHours: {
      startTime: '09:00',
      endTime: '18:00',
      timezone: 'IST'
    },
    schedule: {
      startDate: '',
      endDate: '',
      recurrence: 'once'
    },
    maxAttempts: 1,
    ctfLink: '',
    isVisible: false,
    isPublished: false,
    rules: {
      requireScreenshot: false,
      allowMultipleSubmissions: false
    }
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    console.log('🚀 Loaded CTF for editing:', ctf);
    if (ctf) {
      setFormData({
        title: ctf.title || '',
        description: ctf.description || '',
        category: ctf.category || 'Web Security',
        points: ctf.points || 100,
        difficulty: ctf.difficulty || 'Easy',
        activeHours: ctf.activeHours || {
          startTime: '09:00',
          endTime: '18:00',
          timezone: 'IST'
        },
        schedule: {
          startDate: ctf.schedule?.startDate ? new Date(ctf.schedule.startDate).toISOString().split('T')[0] : '',
          endDate: ctf.schedule?.endDate ? new Date(ctf.schedule.endDate).toISOString().split('T')[0] : '',
          recurrence: ctf.schedule?.recurrence || 'once'
        },
        maxAttempts: ctf.maxAttempts || 1,
        ctfLink: ctf.ctfLink || '',
        isVisible: ctf.isVisible || false,
        isPublished: ctf.isPublished || false,
        rules: ctf.rules || {
          requireScreenshot: false,
          allowMultipleSubmissions: false
        }
      });
    }
  }, [ctf]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.points < 0) {
      newErrors.points = 'Points must be positive';
    }

   if (formData.schedule.startDate && formData.schedule.endDate) {
  const startDate = new Date(formData.schedule.startDate);
  const endDate = new Date(formData.schedule.endDate);

  // ✅ Allow same date, only block if end < start
  if (endDate < startDate) {
    newErrors.schedule = 'End date cannot be before start date';
  }
}

if (formData.activeHours.startTime && formData.activeHours.endTime) {
  // ✅ Must be different
  if (formData.activeHours.startTime === formData.activeHours.endTime) {
    newErrors.activeHours = 'Start time and end time cannot be the same';
  }
}

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Convert date strings to Date objects
      const submitData = {
        ...formData,
        schedule: {
          ...formData.schedule,
          startDate: formData.schedule.startDate ? new Date(formData.schedule.startDate).toISOString() : '',
          endDate: formData.schedule.endDate ? new Date(formData.schedule.endDate).toISOString() : ''
        }
      };
      
      onSubmit(submitData);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const categories = ['Web Security', 'Cryptography', 'Forensics', 'Reverse Engineering', 'Pwn', 'Misc'];
  const difficulties = ['Easy', 'Medium', 'Hard', 'Expert'];
  const recurrences = ['once', 'daily', 'weekly', 'monthly'];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 gap-6">
        <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.title ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter CTF title"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.description ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Describe the CTF challenge"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Points *
            </label>
            <input
              type="number"
              value={formData.points}
              onChange={(e) => handleChange('points', parseInt(e.target.value))}
              min="0"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.points ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.points && (
              <p className="mt-1 text-sm text-red-600">{errors.points}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty *
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) => handleChange('difficulty', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {difficulties.map(difficulty => (
                <option key={difficulty} value={difficulty}>{difficulty}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Schedule */}
      <div className="grid grid-cols-1 gap-6">
        <h3 className="text-lg font-medium text-gray-900">Schedule</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date *
            </label>
            <input
              type="date"
              value={formData.schedule.startDate}
              onChange={(e) => handleNestedChange('schedule', 'startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date *
            </label>
            <input
              type="date"
              value={formData.schedule.endDate}
              onChange={(e) => handleNestedChange('schedule', 'endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {errors.schedule && (
          <p className="text-sm text-red-600">{errors.schedule}</p>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recurrence
          </label>
          <select
            value={formData.schedule.recurrence}
            onChange={(e) => handleNestedChange('schedule', 'recurrence', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {recurrences.map(recurrence => (
              <option key={recurrence} value={recurrence}>
                {recurrence.charAt(0).toUpperCase() + recurrence.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Hours */}
      <div className="grid grid-cols-1 gap-6">
        <h3 className="text-lg font-medium text-gray-900">Active Hours</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Time *
            </label>
            <input
              type="time"
              value={formData.activeHours.startTime}
              onChange={(e) => handleNestedChange('activeHours', 'startTime', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Time *
            </label>
            <input
              type="time"
              value={formData.activeHours.endTime}
              onChange={(e) => handleNestedChange('activeHours', 'endTime', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <select
              value={formData.activeHours.timezone}
              onChange={(e) => handleNestedChange('activeHours', 'timezone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              
              <option value="IST">IST</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
        </div>

        {errors.activeHours && (
          <p className="text-sm text-red-600">{errors.activeHours}</p>
        )}
      </div>

      {/* Additional Settings */}
      <div className="grid grid-cols-1 gap-6">
        <h3 className="text-lg font-medium text-gray-900">Additional Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Attempts
            </label>
            <input
              type="number"
              value={formData.maxAttempts}
              onChange={(e) => handleChange('maxAttempts', parseInt(e.target.value))}
              min="1"
              max="10"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CTF Link (Optional)
            </label>
            <input
              type="url"
              value={formData.ctfLink}
              onChange={(e) => handleChange('ctfLink', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com"
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.rules.requireScreenshot}
              onChange={(e) => handleNestedChange('rules', 'requireScreenshot', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Require screenshot for submission</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.rules.allowMultipleSubmissions}
              onChange={(e) => handleNestedChange('rules', 'allowMultipleSubmissions', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Allow multiple submissions after solving</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isVisible}
              onChange={(e) => handleChange('isVisible', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Make visible to users</span>
          </label>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        
        <Button
          type="submit"
          loading={loading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Save className="h-4 w-4 mr-2" />
          {ctf ? 'Update CTF' : 'Create CTF'}
        </Button>
      </div>
    </form>
  );
};

export default CTFForm;