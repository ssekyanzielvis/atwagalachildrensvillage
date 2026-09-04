import { supabase } from './supabase/client';

// Generate a unique visitor ID and store in localStorage
export function getVisitorId(): string {
  if (typeof window === 'undefined') return '';
  
  let visitorId = localStorage.getItem('visitor_id');
  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('visitor_id', visitorId);
  }
  return visitorId;
}

// Generate a session ID and store in sessionStorage
export function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('session_id', sessionId);
  }
  return sessionId;
}

// Get device type based on user agent
export function getDeviceType(): string {
  if (typeof window === 'undefined') return 'unknown';
  
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

// Track page view or custom action
export async function trackAnalytics(
  pagePath: string,
  actionType: string = 'page_view',
  additionalData?: Record<string, any>
) {
  try {
    if (typeof window === 'undefined') return;

    const visitorId = getVisitorId();
    const sessionId = getSessionId();
    const deviceType = getDeviceType();

    const analyticsData = {
      page_path: pagePath,
      visitor_id: visitorId,
      session_id: sessionId,
      action_type: actionType,
      device_type: deviceType,
      user_agent: navigator.userAgent,
      referrer: document.referrer || null,
      country: null, // Would need IP geolocation service for this
      ...additionalData,
    };

    const { error } = await (supabase.from('analytics') as any).insert([analyticsData]);

    if (error) {
      console.error('Analytics tracking error:', error);
    }
  } catch (error) {
    console.error('Failed to track analytics:', error);
  }
}

// Track specific user actions
export const trackAction = {
  pageView: (pagePath: string) => trackAnalytics(pagePath, 'page_view'),
  
  formSubmit: (formName: string, pagePath: string) => 
    trackAnalytics(pagePath, 'form_submit', { form_name: formName }),
  
  buttonClick: (buttonName: string, pagePath: string) => 
    trackAnalytics(pagePath, 'button_click', { button_name: buttonName }),
  
  donation: (amount: number, pagePath: string) => 
    trackAnalytics(pagePath, 'donation', { amount }),
  
  contactSubmit: (pagePath: string) => 
    trackAnalytics(pagePath, 'contact_submit'),
  
  linkClick: (linkUrl: string, pagePath: string) => 
    trackAnalytics(pagePath, 'link_click', { link_url: linkUrl }),
};
