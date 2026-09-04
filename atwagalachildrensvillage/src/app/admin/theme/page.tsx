'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';
import { Save, RefreshCw } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useNotification, useTheme } from '@/lib/store';

type ThemeSettings = Database['public']['Tables']['theme_settings']['Row'];

export default function ThemeCustomization() {
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<ThemeSettings | null>(null);
  const { showNotification } = useNotification();
  const { setTheme: updateTheme } = useTheme();

  const [formData, setFormData] = useState({
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
    primaryColor: '#1E40AF',
    fontFamily: 'system-ui',
  });

  useEffect(() => {
    fetchTheme();
  }, []);

  const fetchTheme = async () => {
    try {
      const { data } = await (supabase.from('theme_settings') as any).select('*').limit(1).single();

      if (data) {
        setTheme(data);
        setFormData({
          backgroundColor: data.background_color,
          textColor: data.text_color,
          primaryColor: data.primary_color,
          fontFamily: data.font_family,
        });
        
        // Apply theme to store
        updateTheme({
          backgroundColor: data.background_color,
          textColor: data.text_color,
          primaryColor: data.primary_color,
          fontFamily: data.font_family,
        });
      }
    } catch (error: any) {
      console.error('Failed to load theme', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (theme) {
        const { error } = await (supabase
          .from('theme_settings') as any)
          .update({
            background_color: formData.backgroundColor,
            text_color: formData.textColor,
            primary_color: formData.primaryColor,
            font_family: formData.fontFamily,
            updated_at: new Date().toISOString(),
          })
          .eq('id', theme.id);

        if (error) throw error;
      } else {
        const { error } = await (supabase.from('theme_settings') as any).insert({
          background_color: formData.backgroundColor,
          text_color: formData.textColor,
          primary_color: formData.primaryColor,
          font_family: formData.fontFamily,
        });

        if (error) throw error;
      }

      updateTheme(formData);
      showNotification('Theme updated successfully', 'success');
      fetchTheme();
    } catch (error: any) {
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      backgroundColor: '#FFFFFF',
      textColor: '#000000',
      primaryColor: '#1E40AF',
      fontFamily: 'system-ui',
    });
  };

  const fontOptions = [
    'system-ui',
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Georgia',
    'Courier New',
    'Verdana',
    'Trebuchet MS',
  ];

  if (loading && !theme) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Theme Customization</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Color Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Primary Color (Header/Footer)</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-16 h-10 border rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="flex-1 border rounded-lg px-3 py-2 font-mono text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Background Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.backgroundColor}
                  onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                  className="w-16 h-10 border rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.backgroundColor}
                  onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                  className="flex-1 border rounded-lg px-3 py-2 font-mono text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Text Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.textColor}
                  onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                  className="w-16 h-10 border rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.textColor}
                  onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                  className="flex-1 border rounded-lg px-3 py-2 font-mono text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Font Family</label>
              <select
                value={formData.fontFamily}
                onChange={(e) => setFormData({ ...formData, fontFamily: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              >
                {fontOptions.map((font) => (
                  <option key={font} value={font} style={{ fontFamily: font }}>
                    {font}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Theme
              </button>
              <button
                onClick={handleReset}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reset to Default
              </button>
            </div>
          </div>
        </div>

        <div
          className="border rounded-lg p-6"
          style={{
            backgroundColor: formData.backgroundColor,
            color: formData.textColor,
            fontFamily: formData.fontFamily,
          }}
        >
          <h2 className="text-xl font-semibold mb-4">Preview</h2>
          
          <div
            className="p-4 rounded-lg mb-4"
            style={{ backgroundColor: formData.primaryColor, color: '#FFFFFF' }}
          >
            <h3 className="text-lg font-bold">Header/Footer Preview</h3>
            <p>This is how your header and footer will look</p>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Sample Heading</h3>
            <p>
              This is sample paragraph text showing how your content will appear with the selected
              color scheme and font family. Make sure the contrast is readable.
            </p>
            <button
              className="px-4 py-2 rounded-lg text-white"
              style={{ backgroundColor: formData.primaryColor }}
            >
              Sample Button
            </button>
          </div>

          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <p className="text-sm">
              <strong>Note:</strong> Changes will be applied across the entire website after saving.
              Make sure to test readability and contrast before finalizing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

