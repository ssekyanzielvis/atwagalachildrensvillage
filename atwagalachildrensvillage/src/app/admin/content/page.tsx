'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';
import { Save, Edit, Trash2 } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import FileUpload from '@/components/FileUpload';
import { useNotification } from '@/lib/store';

type AboutUs = Database['public']['Tables']['about_us']['Row'];
type Vision = Database['public']['Tables']['vision']['Row'];
type Mission = Database['public']['Tables']['mission']['Row'];
type Objective = Database['public']['Tables']['objectives']['Row'];

export default function ContentManagement() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'about' | 'vision' | 'mission' | 'objectives'>(
    'about'
  );
  const { showNotification } = useNotification();

  // About Us
  const [aboutItems, setAboutItems] = useState<AboutUs[]>([]);
  const [aboutForm, setAboutForm] = useState({ description: '', image_url: '' });
  const [editingAboutId, setEditingAboutId] = useState<string | null>(null);

  // Vision
  const [vision, setVision] = useState<Vision | null>(null);
  const [visionForm, setVisionForm] = useState({ statement: '', image_url: '' });

  // Mission
  const [mission, setMission] = useState<Mission | null>(null);
  const [missionForm, setMissionForm] = useState({ statement: '', image_url: '' });

  // Objectives
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [objectiveForm, setObjectiveForm] = useState({ statement: '', image_url: '' });
  const [editingObjectiveId, setEditingObjectiveId] = useState<string | null>(null);

  useEffect(() => {
    fetchAllContent();
  }, []);

  const fetchAllContent = async () => {
    try {
      const { data: aboutData } = await (supabase.from('about_us') as any).select('*').order('order_index');
      const { data: visionData } = await (supabase.from('vision') as any).select('*').limit(1).single();
      const { data: missionData } = await (supabase.from('mission') as any).select('*').limit(1).single();
      const { data: objectivesData } = await (supabase.from('objectives') as any).select('*').order('order_index');

      if (aboutData) setAboutItems(aboutData);
      if (visionData) {
        setVision(visionData);
        setVisionForm({
          statement: visionData.statement,
          image_url: visionData.image_url || '',
        });
      }
      if (missionData) {
        setMission(missionData);
        setMissionForm({
          statement: missionData.statement,
          image_url: missionData.image_url || '',
        });
      }
      if (objectivesData) setObjectives(objectivesData);
    } catch (error: any) {
      console.error('Failed to load content', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveVision = async () => {
    setLoading(true);
    try {
      if (vision) {
        const { error } = await (supabase
          .from('vision') as any)
          .update({
            statement: visionForm.statement,
            image_url: visionForm.image_url,
            updated_at: new Date().toISOString(),
          })
          .eq('id', vision.id);

        if (error) throw error;
      } else {
        const { error } = await (supabase.from('vision') as any).insert(visionForm);

        if (error) throw error;
      }

      showNotification('Vision updated successfully', 'success');
      fetchAllContent();
    } catch (error: any) {
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMission = async () => {
    setLoading(true);
    try {
      if (mission) {
        const { error } = await (supabase
          .from('mission') as any)
          .update({
            statement: missionForm.statement,
            image_url: missionForm.image_url,
            updated_at: new Date().toISOString(),
          })
          .eq('id', mission.id);

        if (error) throw error;
      } else {
        const { error } = await (supabase.from('mission') as any).insert(missionForm);

        if (error) throw error;
      }

      showNotification('Mission updated successfully', 'success');
      fetchAllContent();
    } catch (error: any) {
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAbout = async () => {
    if (!aboutForm.description) return;

    setLoading(true);
    try {
      if (editingAboutId) {
        // Update existing about section
        const { error } = await (supabase
          .from('about_us') as any)
          .update({
            description: aboutForm.description,
            image_url: aboutForm.image_url,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingAboutId);

        if (error) throw error;
        showNotification('About section updated successfully', 'success');
      } else {
        // Add new about section
        const maxOrder = aboutItems.length > 0 ? Math.max(...aboutItems.map((a) => a.order_index)) : 0;
        const { error } = await (supabase.from('about_us') as any).insert({
          description: aboutForm.description,
          image_url: aboutForm.image_url,
          order_index: maxOrder + 1,
        });

        if (error) throw error;
        showNotification('About section added successfully', 'success');
      }
      
      setAboutForm({ description: '', image_url: '' });
      setEditingAboutId(null);
      fetchAllContent();
    } catch (error: any) {
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditAbout = (item: AboutUs) => {
    setEditingAboutId(item.id);
    setAboutForm({ description: item.description, image_url: item.image_url || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEditAbout = () => {
    setEditingAboutId(null);
    setAboutForm({ description: '', image_url: '' });
  };

  const handleDeleteAbout = async (id: string) => {
    if (!confirm('Delete this about section?')) return;

    try {
      const { error } = await (supabase.from('about_us') as any).delete().eq('id', id);

      if (error) throw error;
      showNotification('About section deleted', 'success');
      fetchAllContent();
    } catch (error: any) {
      showNotification(error.message, 'error');
    }
  };

  const handleAddObjective = async () => {
    if (!objectiveForm.statement) return;

    setLoading(true);
    try {
      if (editingObjectiveId) {
        // Update existing objective
        const { error } = await (supabase
          .from('objectives') as any)
          .update({
            statement: objectiveForm.statement,
            image_url: objectiveForm.image_url,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingObjectiveId);

        if (error) throw error;
        showNotification('Objective updated successfully', 'success');
      } else {
        // Add new objective
        const maxOrder =
          objectives.length > 0 ? Math.max(...objectives.map((o) => o.order_index)) : 0;
        const { error } = await (supabase.from('objectives') as any).insert({
          statement: objectiveForm.statement,
          image_url: objectiveForm.image_url,
          order_index: maxOrder + 1,
        });

        if (error) throw error;
        showNotification('Objective added successfully', 'success');
      }
      
      setObjectiveForm({ statement: '', image_url: '' });
      setEditingObjectiveId(null);
      fetchAllContent();
    } catch (error: any) {
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditObjective = (obj: Objective) => {
    setEditingObjectiveId(obj.id);
    setObjectiveForm({ statement: obj.statement, image_url: obj.image_url || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEditObjective = () => {
    setEditingObjectiveId(null);
    setObjectiveForm({ statement: '', image_url: '' });
  };

  const handleDeleteObjective = async (id: string) => {
    if (!confirm('Delete this objective?')) return;

    try {
      const { error } = await (supabase.from('objectives') as any).delete().eq('id', id);

      if (error) throw error;
      showNotification('Objective deleted', 'success');
      fetchAllContent();
    } catch (error: any) {
      showNotification(error.message, 'error');
    }
  };

  if (loading && !vision && !mission) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Content Management</h1>

      <div className="mb-6 flex gap-2 border-b">
        {['about', 'vision', 'mission', 'objectives'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 capitalize ${
              activeTab === tab
                ? 'border-b-2 border-blue-600 text-blue-600 font-medium'
                : 'text-gray-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'vision' && (
        <div className="bg-white border rounded-lg p-6 max-w-2xl">
          <h2 className="text-xl font-semibold mb-4">Vision Statement</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Statement*</label>
              <textarea
                value={visionForm.statement}
                onChange={(e) => setVisionForm({ ...visionForm, statement: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                rows={4}
                required
              />
            </div>
            <FileUpload
              bucket="vision"
              currentUrl={visionForm.image_url}
              onUploadComplete={(url) => setVisionForm({ ...visionForm, image_url: url })}
              accept="image"
              label="Vision Image"
              maxSizeMB={5}
            />
            <button
              onClick={handleSaveVision}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Vision
            </button>
          </div>
        </div>
      )}

      {activeTab === 'mission' && (
        <div className="bg-white border rounded-lg p-6 max-w-2xl">
          <h2 className="text-xl font-semibold mb-4">Mission Statement</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Statement*</label>
              <textarea
                value={missionForm.statement}
                onChange={(e) => setMissionForm({ ...missionForm, statement: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                rows={4}
                required
              />
            </div>
            <FileUpload
              bucket="mission"
              currentUrl={missionForm.image_url}
              onUploadComplete={(url) => setMissionForm({ ...missionForm, image_url: url })}
              accept="image"
              label="Mission Image"
              maxSizeMB={5}
            />
            <button
              onClick={handleSaveMission}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Mission
            </button>
          </div>
        </div>
      )}

      {activeTab === 'about' && (
        <div className="space-y-6">
          <div className="bg-white border rounded-lg p-6 max-w-2xl">
            <h2 className="text-xl font-semibold mb-4">
              {editingAboutId ? 'Edit About Section' : 'Add About Section'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Description*</label>
                <textarea
                  value={aboutForm.description}
                  onChange={(e) => setAboutForm({ ...aboutForm, description: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={4}
                />
              </div>
              <FileUpload
                bucket="about-us"
                currentUrl={aboutForm.image_url}
                onUploadComplete={(url) => setAboutForm({ ...aboutForm, image_url: url })}
                accept="image"
                label="About Us Image"
                maxSizeMB={5}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddAbout}
                  disabled={loading || !aboutForm.description}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  {editingAboutId ? 'Update Section' : 'Add Section'}
                </button>
                {editingAboutId && (
                  <button
                    onClick={handleCancelEditAbout}
                    className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {aboutItems.map((item) => (
              <div key={item.id} className="bg-white border rounded-lg p-4 flex gap-4">
                {item.image_url && (
                  <img src={item.image_url} alt="About" className="w-32 h-24 object-cover rounded" />
                )}
                <div className="flex-1">
                  <p className="text-gray-700">{item.description}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditAbout(item)}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteAbout(item.id)}
                    className="text-red-600 hover:text-red-800 flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'objectives' && (
        <div className="space-y-6">
          <div className="bg-white border rounded-lg p-6 max-w-2xl">
            <h2 className="text-xl font-semibold mb-4">
              {editingObjectiveId ? 'Edit Objective' : 'Add Objective'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Statement*</label>
                <textarea
                  value={objectiveForm.statement}
                  onChange={(e) => setObjectiveForm({ ...objectiveForm, statement: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={3}
                />
              </div>
              <FileUpload
                bucket="objectives"
                currentUrl={objectiveForm.image_url}
                onUploadComplete={(url) => setObjectiveForm({ ...objectiveForm, image_url: url })}
                accept="image"
                label="Objective Image"
                maxSizeMB={5}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddObjective}
                  disabled={loading || !objectiveForm.statement}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  {editingObjectiveId ? 'Update Objective' : 'Add Objective'}
                </button>
                {editingObjectiveId && (
                  <button
                    onClick={handleCancelEditObjective}
                    className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {objectives.map((obj) => (
              <div key={obj.id} className="bg-white border rounded-lg p-4 flex gap-4">
                {obj.image_url && (
                  <img src={obj.image_url} alt="Objective" className="w-24 h-24 object-cover rounded" />
                )}
                <div className="flex-1">
                  <p className="text-gray-700">{obj.statement}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditObjective(obj)}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteObjective(obj.id)}
                    className="text-red-600 hover:text-red-800 flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

