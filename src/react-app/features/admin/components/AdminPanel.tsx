import React, { useState } from 'react';
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Camera, 
  Target,
  Settings,
  Mountain
} from 'lucide-react';

interface Location {
  id: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  category: string;
  points_reward: number;
  radius_meters: number;
}

interface Quest {
  id: number;
  name: string;
  description: string;
  points_reward: number;
  is_active: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  estimated_time: number;
  category: string;
  requirements: string;
  instructions: string;
  max_participants?: number;
  start_date?: string;
  end_date?: string;
  location_area: string;
  tags: string[];
  media_urls?: string[];
}

interface QuestStep {
  id: number;
  quest_id: number;
  step_number: number;
  step_type: 'photo' | 'checkin' | 'question' | 'task';
  description: string;
  points_reward: number;
  target_location_id?: number;
  question?: string;
  answer?: string;
  task_instructions?: string;
  media_urls?: string[];
}

interface AdminPanelProps {
  locations: Location[];
  onRefresh: () => void;
}

export function AdminPanel({ locations, onRefresh }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'adventures' | 'locations'>('adventures');
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
  const [showAddLocationForm, setShowAddLocationForm] = useState(false);
  const [showAddQuestForm, setShowAddQuestForm] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [questSteps, setQuestSteps] = useState<QuestStep[]>([]);
  
  const [locationFormData, setLocationFormData] = useState({
    name: '',
    description: '',
    latitude: '',
    longitude: '',
    category: 'sculpture',
    points_reward: 15,
    radius_meters: 50
  });

  const [questFormData, setQuestFormData] = useState({
    name: '',
    description: '',
    points_reward: 100,
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    estimated_time: 120,
    category: 'exploration',
    requirements: '',
    instructions: '',
    max_participants: 100,
    start_date: '',
    end_date: '',
    location_area: '',
    tags: [] as string[],
    tagInput: '',
    media_files: [] as File[],
    media_urls: [] as string[]
  });

  const [stepFormData, setStepFormData] = useState({
    step_number: 1,
    step_type: 'photo' as 'photo' | 'checkin' | 'question' | 'task',
    description: '',
    points_reward: 15,
    target_location_id: '',
    question: '',
    answer: '',
    task_instructions: '',
    media_files: [] as File[],
    media_urls: [] as string[]
  });

  // Load quests on component mount
  React.useEffect(() => {
    fetchQuests();
  }, []);

  const fetchQuests = async () => {
    try {
      const response = await fetch('/api/quests');
      if (response.ok) {
        const data = await response.json();
        setQuests(data);
      }
    } catch (error) {
      console.error('Error fetching quests:', error);
    }
  };

  const fetchQuestSteps = async (questId: number) => {
    try {
      const response = await fetch(`/api/quests/${questId}/steps`);
      if (response.ok) {
        const data = await response.json();
        setQuestSteps(data);
      }
    } catch (error) {
      console.error('Error fetching quest steps:', error);
    }
  };

  const handleAddQuest = async () => {
    try {
      const response = await fetch('/api/quests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...questFormData,
          tags: questFormData.tags.join(','),
          media_urls: questFormData.media_urls.join(','),
          is_active: true
        })
      });
      
      if (response.ok) {
        fetchQuests();
        setShowAddQuestForm(false);
        setQuestFormData({
          name: '',
          description: '',
          points_reward: 100,
          difficulty: 'medium',
          estimated_time: 120,
          category: 'exploration',
          requirements: '',
          instructions: '',
          max_participants: 100,
          start_date: '',
          end_date: '',
          location_area: '',
          tags: [],
          tagInput: '',
          media_files: [],
          media_urls: []
        });
        alert('Adventure created successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create adventure');
      }
    } catch (error) {
      console.error('Error creating adventure:', error);
      alert('Failed to create adventure');
    }
  };

  const handleUpdateQuest = async () => {
    if (!editingQuest) return;
    
    try {
      const response = await fetch(`/api/quests/${editingQuest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...questFormData,
          tags: questFormData.tags.join(','),
          media_urls: questFormData.media_urls.join(','),
          is_active: true
        })
      });
      
      if (response.ok) {
        fetchQuests();
        setEditingQuest(null);
        setShowAddQuestForm(false);
        setQuestFormData({
          name: '',
          description: '',
          points_reward: 100,
          difficulty: 'medium',
          estimated_time: 120,
          category: 'exploration',
          requirements: '',
          instructions: '',
          max_participants: 100,
          start_date: '',
          end_date: '',
          location_area: '',
          tags: [],
          tagInput: '',
          media_files: [],
          media_urls: []
        });
        alert('Adventure updated successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update adventure');
      }
    } catch (error) {
      console.error('Error updating adventure:', error);
      alert('Failed to update adventure');
    }
  };

  const handleDeleteQuest = async (id: number) => {
    if (!confirm('Are you sure you want to delete this adventure? This will also delete all associated quest steps.')) return;
    
    try {
      const response = await fetch(`/api/quests/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        fetchQuests();
        alert('Adventure deleted successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete adventure');
      }
    } catch (error) {
      console.error('Error deleting adventure:', error);
      alert('Failed to delete adventure');
    }
  };

  const startEditQuest = (quest: Quest) => {
    setEditingQuest(quest);
    setShowAddQuestForm(true);
    setQuestFormData({
      name: quest.name,
      description: quest.description,
      points_reward: quest.points_reward,
      difficulty: quest.difficulty,
      estimated_time: quest.estimated_time,
      category: quest.category,
      requirements: quest.requirements || '',
      instructions: quest.instructions || '',
      max_participants: quest.max_participants || 100,
      start_date: quest.start_date || '',
      end_date: quest.end_date || '',
      location_area: quest.location_area || '',
      tags: typeof quest.tags === 'string' ? quest.tags.split(',').filter(tag => tag.trim()) : (quest.tags || []),
      tagInput: '',
      media_files: [],
      media_urls: typeof quest.media_urls === 'string' ? quest.media_urls.split(',').filter(url => url.trim()) : (quest.media_urls || [])
    });
  };

  const handleAddQuestStep = async () => {
    if (!selectedQuest) return;
    
    try {
      const response = await fetch(`/api/quests/${selectedQuest.id}/steps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...stepFormData,
          target_location_id: stepFormData.target_location_id ? parseInt(stepFormData.target_location_id) : null,
          media_urls: stepFormData.media_urls.join(',')
        })
      });
      
      if (response.ok) {
        fetchQuestSteps(selectedQuest.id);
        setStepFormData({
          step_number: stepFormData.step_number + 1,
          step_type: 'photo',
          description: '',
          points_reward: 15,
          target_location_id: '',
          question: '',
          answer: '',
          task_instructions: '',
          media_files: [],
          media_urls: []
        });
        alert('Quest step added successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add quest step');
      }
    } catch (error) {
      console.error('Error adding quest step:', error);
      alert('Failed to add quest step');
    }
  };

  const handleAddLocation = async () => {
    try {
      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...locationFormData,
          latitude: parseFloat(locationFormData.latitude),
          longitude: parseFloat(locationFormData.longitude)
        })
      });
      
      if (response.ok) {
        onRefresh();
        setShowAddLocationForm(false);
        setLocationFormData({
          name: '',
          description: '',
          latitude: '',
          longitude: '',
          category: 'sculpture',
          points_reward: 15,
          radius_meters: 50
        });
        alert('Location added successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add location');
      }
    } catch (error) {
      console.error('Error adding location:', error);
      alert('Failed to add location');
    }
  };

  const handleUpdateLocation = async () => {
    if (!editingLocation) return;
    
    try {
      const response = await fetch(`/api/locations/${editingLocation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...locationFormData,
          latitude: parseFloat(locationFormData.latitude),
          longitude: parseFloat(locationFormData.longitude)
        })
      });
      
      if (response.ok) {
        onRefresh();
        setEditingLocation(null);
        setLocationFormData({
          name: '',
          description: '',
          latitude: '',
          longitude: '',
          category: 'sculpture',
          points_reward: 15,
          radius_meters: 50
        });
        alert('Location updated successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update location');
      }
    } catch (error) {
      console.error('Error updating location:', error);
      alert('Failed to update location');
    }
  };

  const handleDeleteLocation = async (id: number) => {
    if (!confirm('Are you sure you want to delete this location?')) return;
    
    try {
      const response = await fetch(`/api/locations/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        onRefresh();
        alert('Location deleted successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete location');
      }
    } catch (error) {
      console.error('Error deleting location:', error);
      alert('Failed to delete location');
    }
  };

  const startEdit = (location: Location) => {
    setEditingLocation(location);
    setLocationFormData({
      name: location.name,
      description: location.description,
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
      category: location.category,
      points_reward: location.points_reward,
      radius_meters: location.radius_meters
    });
  };

  const cancelEdit = () => {
    setEditingLocation(null);
    setEditingQuest(null);
    setShowAddLocationForm(false);
    setShowAddQuestForm(false);
    setSelectedQuest(null);
    setLocationFormData({
      name: '',
      description: '',
      latitude: '',
      longitude: '',
      category: 'sculpture',
      points_reward: 15,
      radius_meters: 50
    });
    setQuestFormData({
      name: '',
      description: '',
      points_reward: 100,
      difficulty: 'medium',
      estimated_time: 120,
      category: 'exploration',
      requirements: '',
      instructions: '',
      max_participants: 100,
      start_date: '',
      end_date: '',
      location_area: '',
      tags: [],
      tagInput: ''
    });
  };

  const addTag = () => {
    if (questFormData.tagInput.trim() && !questFormData.tags.includes(questFormData.tagInput.trim())) {
      setQuestFormData({
        ...questFormData,
        tags: [...questFormData.tags, questFormData.tagInput.trim()],
        tagInput: ''
      });
    }
  };

  const removeTag = (tagToRemove: string) => {
    setQuestFormData({
      ...questFormData,
      tags: questFormData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleMediaUpload = async (files: FileList, type: 'quest' | 'step') => {
    const uploadedUrls: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Get upload URL
      const urlResponse = await fetch('/api/photos/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: `adventure-media/${Date.now()}-${file.name}`,
          contentType: file.type
        })
      });
      
      if (urlResponse.ok) {
        const { uploadUrl, key } = await urlResponse.json();
        
        // Upload file
        const uploadResponse = await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type }
        });
        
        if (uploadResponse.ok) {
          uploadedUrls.push(key);
        }
      }
    }
    
    if (type === 'quest') {
      setQuestFormData({
        ...questFormData,
        media_urls: [...questFormData.media_urls, ...uploadedUrls]
      });
    } else {
      setStepFormData({
        ...stepFormData,
        media_urls: [...stepFormData.media_urls, ...uploadedUrls]
      });
    }
  };

  const removeMedia = (url: string, type: 'quest' | 'step') => {
    if (type === 'quest') {
      setQuestFormData({
        ...questFormData,
        media_urls: questFormData.media_urls.filter(u => u !== url)
      });
    } else {
      setStepFormData({
        ...stepFormData,
        media_urls: stepFormData.media_urls.filter(u => u !== url)
      });
    }
  };

  const selectQuest = (quest: Quest) => {
    setSelectedQuest(quest);
    fetchQuestSteps(quest.id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-green-600" />
            Adventure Management
          </h2>
          <p className="text-gray-600">Create and manage adventures, quests, and locations</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddQuestForm(true)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Adventure
          </button>
          <button
            onClick={() => setShowAddLocationForm(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            Add Location
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('adventures')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'adventures'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Mountain className="w-5 h-5 inline mr-2" />
              Adventures
            </button>
            <button
              onClick={() => setActiveTab('locations')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'locations'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MapPin className="w-5 h-5 inline mr-2" />
              Locations
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'adventures' && (
            <div className="space-y-6">
              {/* Create Adventure Form */}
              {showAddQuestForm && (
                <div className="bg-gray-50 rounded-xl p-6 border-2 border-green-200">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Mountain className="w-5 h-5 text-green-600" />
                    {editingQuest ? 'Edit Adventure' : 'Create New Adventure'}
                  </h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Adventure Name</label>
                      <input
                        type="text"
                        value={questFormData.name}
                        onChange={(e) => setQuestFormData({...questFormData, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="e.g., Meredith Sculpture Walk"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={questFormData.category}
                        onChange={(e) => setQuestFormData({...questFormData, category: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="exploration">Exploration</option>
                        <option value="sculpture">Sculpture</option>
                        <option value="photography">Photography</option>
                        <option value="fitness">Fitness</option>
                        <option value="social">Social</option>
                        <option value="historical">Historical</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                      <select
                        value={questFormData.difficulty}
                        onChange={(e) => setQuestFormData({...questFormData, difficulty: e.target.value as 'easy' | 'medium' | 'hard'})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Time (minutes)</label>
                      <input
                        type="number"
                        value={questFormData.estimated_time}
                        onChange={(e) => setQuestFormData({...questFormData, estimated_time: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        min="15"
                        max="480"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total Points Reward</label>
                      <input
                        type="number"
                        value={questFormData.points_reward}
                        onChange={(e) => setQuestFormData({...questFormData, points_reward: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        min="10"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Max Participants</label>
                      <input
                        type="number"
                        value={questFormData.max_participants}
                        onChange={(e) => setQuestFormData({...questFormData, max_participants: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        min="1"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={questFormData.start_date}
                        onChange={(e) => setQuestFormData({...questFormData, start_date: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                      <input
                        type="date"
                        value={questFormData.end_date}
                        onChange={(e) => setQuestFormData({...questFormData, end_date: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location Area</label>
                      <input
                        type="text"
                        value={questFormData.location_area}
                        onChange={(e) => setQuestFormData({...questFormData, location_area: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="e.g., Downtown Meredith, NH"
                      />
                    </div>
                    
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={questFormData.description}
                        onChange={(e) => setQuestFormData({...questFormData, description: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        rows={3}
                        placeholder="Describe the adventure and what participants will experience..."
                      />
                    </div>
                    
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
                      <textarea
                        value={questFormData.requirements}
                        onChange={(e) => setQuestFormData({...questFormData, requirements: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        rows={2}
                        placeholder="What do participants need to bring or prepare?"
                      />
                    </div>
                    
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                      <textarea
                        value={questFormData.instructions}
                        onChange={(e) => setQuestFormData({...questFormData, instructions: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        rows={3}
                        placeholder="Step-by-step instructions for participants..."
                      />
                    </div>
                    
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={questFormData.tagInput}
                          onChange={(e) => setQuestFormData({...questFormData, tagInput: e.target.value})}
                          onKeyPress={(e) => e.key === 'Enter' && addTag()}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Add tags (press Enter)"
                        />
                        <button
                          onClick={addTag}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {questFormData.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                          >
                            {tag}
                            <button
                              onClick={() => removeTag(tag)}
                              className="ml-2 text-green-600 hover:text-green-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Adventure Media</label>
                      <p className="text-sm text-gray-600 mb-3">Upload pictures and videos that show what participants should expect or capture</p>
                      
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <input
                          type="file"
                          multiple
                          accept="image/*,video/*"
                          onChange={(e) => e.target.files && handleMediaUpload(e.target.files, 'quest')}
                          className="hidden"
                          id="quest-media-upload"
                        />
                        <label
                          htmlFor="quest-media-upload"
                          className="cursor-pointer flex flex-col items-center"
                        >
                          <Camera className="w-8 h-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-600">Click to upload media files</span>
                          <span className="text-xs text-gray-500">Supports images and videos</span>
                        </label>
                      </div>
                      
                      {questFormData.media_urls.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Media:</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {questFormData.media_urls.map((url, index) => (
                              <div key={index} className="relative group">
                                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                  {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                    <img
                                      src={`https://photos.${process.env.NODE_ENV === 'development' ? 'dev' : 'prod'}.cloudflare.com/${url}`}
                                      alt={`Media ${index + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <video
                                      src={`https://photos.${process.env.NODE_ENV === 'development' ? 'dev' : 'prod'}.cloudflare.com/${url}`}
                                      className="w-full h-full object-cover"
                                      controls
                                    />
                                  )}
                                </div>
                                <button
                                  onClick={() => removeMedia(url, 'quest')}
                                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={editingQuest ? handleUpdateQuest : handleAddQuest}
                      className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {editingQuest ? 'Update Adventure' : 'Create Adventure'}
                    </button>
                    <button
                      onClick={() => {
                        setShowAddQuestForm(false);
                        setEditingQuest(null);
                      }}
                      className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Adventures List */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Current Adventures ({quests.length})</h3>
                
                <div className="grid gap-4">
                  {quests.map((quest) => (
                    <div key={quest.id} className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200 hover:border-green-300 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                              <Mountain className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-bold text-lg text-gray-900">{quest.name}</h4>
                              <div className="flex items-center gap-3 text-sm text-gray-500">
                                <span className="capitalize">{quest.category}</span>
                                <span>•</span>
                                <span className="capitalize">{quest.difficulty}</span>
                                <span>•</span>
                                <span>{quest.estimated_time} min</span>
                                <span>•</span>
                                <span>{quest.points_reward} points</span>
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-gray-600 mb-3">{quest.description}</p>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            {quest.tags && quest.tags.map((tag, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                          
                          <div className="text-sm text-gray-500">
                            <div>📍 {quest.location_area}</div>
                            <div>👥 Max {quest.max_participants} participants</div>
                            {quest.start_date && quest.end_date && (
                              <div>📅 {quest.start_date} to {quest.end_date}</div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => selectQuest(quest)}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            Manage Steps
                          </button>
                          <button
                            onClick={() => startEditQuest(quest)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteQuest(quest.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {quests.length === 0 && (
                    <div className="p-12 text-center text-gray-500">
                      <Mountain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No adventures created yet. Click "Create Adventure" to get started!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quest Steps Management */}
              {selectedQuest && (
                <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-200">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    Manage Steps: {selectedQuest.name}
                  </h3>
                  
                  {/* Add Step Form */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold mb-3">Add New Step</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Step Type</label>
                        <select
                          value={stepFormData.step_type}
                          onChange={(e) => setStepFormData({...stepFormData, step_type: e.target.value as 'photo' | 'checkin' | 'question' | 'task'})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="photo">Photo Required</option>
                          <option value="checkin">Check-in Required</option>
                          <option value="question">Question/Answer</option>
                          <option value="task">Special Task</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Points Reward</label>
                        <input
                          type="number"
                          value={stepFormData.points_reward}
                          onChange={(e) => setStepFormData({...stepFormData, points_reward: parseInt(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          min="1"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Step Description</label>
                        <textarea
                          value={stepFormData.description}
                          onChange={(e) => setStepFormData({...stepFormData, description: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          rows={2}
                          placeholder="Describe what participants need to do for this step..."
                        />
                      </div>
                      
                      {(stepFormData.step_type === 'photo' || stepFormData.step_type === 'checkin') && (
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Target Location</label>
                          <select
                            value={stepFormData.target_location_id}
                            onChange={(e) => setStepFormData({...stepFormData, target_location_id: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          >
                            <option value="">Select a location</option>
                            {locations.map((location) => (
                              <option key={location.id} value={location.id}>
                                {location.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      
                      {stepFormData.step_type === 'question' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                            <input
                              type="text"
                              value={stepFormData.question}
                              onChange={(e) => setStepFormData({...stepFormData, question: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="What is the question?"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer</label>
                            <input
                              type="text"
                              value={stepFormData.answer}
                              onChange={(e) => setStepFormData({...stepFormData, answer: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="What is the correct answer?"
                            />
                          </div>
                        </>
                      )}
                      
                      {stepFormData.step_type === 'task' && (
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Task Instructions</label>
                          <textarea
                            value={stepFormData.task_instructions}
                            onChange={(e) => setStepFormData({...stepFormData, task_instructions: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            rows={2}
                            placeholder="Detailed instructions for the special task..."
                          />
                        </div>
                      )}

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Step Media</label>
                        <p className="text-sm text-gray-600 mb-3">Upload example images or videos for this step</p>
                        
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                          <input
                            type="file"
                            multiple
                            accept="image/*,video/*"
                            onChange={(e) => e.target.files && handleMediaUpload(e.target.files, 'step')}
                            className="hidden"
                            id="step-media-upload"
                          />
                          <label
                            htmlFor="step-media-upload"
                            className="cursor-pointer flex flex-col items-center"
                          >
                            <Camera className="w-6 h-6 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-600">Click to upload media files</span>
                            <span className="text-xs text-gray-500">Supports images and videos</span>
                          </label>
                        </div>
                        
                        {stepFormData.media_urls.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Media:</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {stepFormData.media_urls.map((url, index) => (
                                <div key={index} className="relative group">
                                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                    {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                      <img
                                        src={`https://photos.${process.env.NODE_ENV === 'development' ? 'dev' : 'prod'}.cloudflare.com/${url}`}
                                        alt={`Step Media ${index + 1}`}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <video
                                        src={`https://photos.${process.env.NODE_ENV === 'development' ? 'dev' : 'prod'}.cloudflare.com/${url}`}
                                        className="w-full h-full object-cover"
                                        controls
                                      />
                                    )}
                                  </div>
                                  <button
                                    onClick={() => removeMedia(url, 'step')}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={handleAddQuestStep}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Step
                      </button>
                    </div>
                  </div>
                  
                  {/* Steps List */}
                  <div>
                    <h4 className="font-semibold mb-3">Current Steps ({questSteps.length})</h4>
                    <div className="space-y-3">
                      {questSteps.map((step) => (
                        <div key={step.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                              {step.step_number}
                            </div>
                            <div>
                              <div className="font-medium">{step.description}</div>
                              <div className="text-sm text-gray-500">
                                {step.step_type} • {step.points_reward} points
                                {step.target_location_id && ` • Location: ${locations.find(l => l.id === step.target_location_id)?.name}`}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => {/* Handle delete step */}}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      
                      {questSteps.length === 0 && (
                        <div className="p-6 text-center text-gray-500">
                          <Target className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                          <p>No steps added yet. Add steps to create the adventure flow.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'locations' && (
            <div className="space-y-6">
              {/* Add/Edit Location Form */}
              {(showAddLocationForm || editingLocation) && (
                <div className="bg-gray-50 rounded-xl p-6 border-2 border-green-200">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-green-600" />
                    {editingLocation ? 'Edit Location' : 'Add New Location'}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location Name</label>
                      <input
                        type="text"
                        value={locationFormData.name}
                        onChange={(e) => setLocationFormData({...locationFormData, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="e.g., The Fisherman"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={locationFormData.category}
                        onChange={(e) => setLocationFormData({...locationFormData, category: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="sculpture">Sculpture</option>
                        <option value="art">Art</option>
                        <option value="landmark">Landmark</option>
                        <option value="historical">Historical</option>
                        <option value="business">Business</option>
                      </select>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={locationFormData.description}
                        onChange={(e) => setLocationFormData({...locationFormData, description: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        rows={3}
                        placeholder="Describe the location and its significance..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                      <input
                        type="number"
                        step="any"
                        value={locationFormData.latitude}
                        onChange={(e) => setLocationFormData({...locationFormData, latitude: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="43.6578"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                      <input
                        type="number"
                        step="any"
                        value={locationFormData.longitude}
                        onChange={(e) => setLocationFormData({...locationFormData, longitude: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="-71.5003"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Points Reward</label>
                      <input
                        type="number"
                        value={locationFormData.points_reward}
                        onChange={(e) => setLocationFormData({...locationFormData, points_reward: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        min="1"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Radius (meters)</label>
                      <input
                        type="number"
                        value={locationFormData.radius_meters}
                        onChange={(e) => setLocationFormData({...locationFormData, radius_meters: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        min="10"
                        max="1000"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={editingLocation ? handleUpdateLocation : handleAddLocation}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {editingLocation ? 'Update' : 'Add'} Location
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Locations List */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Locations ({locations.length})</h3>
                
                <div className="grid gap-4">
                  {locations.map((location) => (
                    <div key={location.id} className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200 hover:border-green-300 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                              <MapPin className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{location.name}</h4>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span className="capitalize">{location.category}</span>
                                <span>•</span>
                                <span>{location.points_reward} points</span>
                                <span>•</span>
                                <span>{location.radius_meters}m radius</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{location.description}</p>
                          <div className="text-xs text-gray-500">
                            📍 {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(location)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteLocation(location.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {locations.length === 0 && (
                    <div className="p-12 text-center text-gray-500">
                      <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No locations added yet. Click "Add Location" to get started!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
