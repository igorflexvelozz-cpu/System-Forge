import { useEffect } from "react";
import { logAnalyticsEvent, setAnalyticsUserProperty } from "@/lib/firebase";

/**
 * Custom hook for Firebase Analytics
 * Provides easy-to-use analytics tracking throughout the application
 */
export function useAnalytics() {
  /**
   * Track page view
   */
  const trackPageView = (pageName: string, pagePath?: string) => {
    logAnalyticsEvent("page_view", {
      page_title: pageName,
      page_path: pagePath || window.location.pathname,
      page_location: window.location.href
    });
  };

  /**
   * Track custom events
   */
  const trackEvent = (eventName: string, eventParams?: Record<string, any>) => {
    logAnalyticsEvent(eventName, {
      ...eventParams,
      timestamp: new Date().toISOString()
    });
  };

  /**
   * Track file upload events
   */
  const trackUpload = (
    fileType: "logmanager" | "gestora",
    success: boolean,
    fileSize?: number,
    error?: string
  ) => {
    trackEvent("file_upload", {
      file_type: fileType,
      success,
      file_size: fileSize,
      error: error || null
    });
  };

  /**
   * Track processing events
   */
  const trackProcessing = (
    status: "started" | "completed" | "failed",
    duration?: number,
    error?: string
  ) => {
    trackEvent("data_processing", {
      status,
      duration,
      error: error || null
    });
  };

  /**
   * Track dashboard interactions
   */
  const trackDashboardInteraction = (
    action: string,
    component: string,
    details?: Record<string, any>
  ) => {
    trackEvent("dashboard_interaction", {
      action,
      component,
      ...details
    });
  };

  /**
   * Track export events
   */
  const trackExport = (
    exportType: string,
    format: string,
    success: boolean,
    fileSize?: number,
    recordCount?: number,
    error?: string
  ) => {
    trackEvent("export", {
      export_type: exportType,
      format,
      success,
      file_size: fileSize,
      record_count: recordCount,
      error: error || null
    });
  };

  /**
   * Track table interactions (sort, filter, pagination)
   */
  const trackTableInteraction = (
    action: "sort" | "filter" | "paginate" | "search",
    tableName: string,
    details?: Record<string, any>
  ) => {
    trackEvent("table_interaction", {
      action,
      table_name: tableName,
      ...details
    });
  };

  /**
   * Track chart interactions
   */
  const trackChartInteraction = (
    action: "hover" | "click" | "zoom" | "export",
    chartType: string,
    details?: Record<string, any>
  ) => {
    trackEvent("chart_interaction", {
      action,
      chart_type: chartType,
      ...details
    });
  };

  /**
   * Set user properties
   */
  const setUserProperty = (propertyName: string, value: string) => {
    setAnalyticsUserProperty(propertyName, value);
  };

  return {
    trackPageView,
    trackEvent,
    trackUpload,
    trackProcessing,
    trackDashboardInteraction,
    trackExport,
    trackTableInteraction,
    trackChartInteraction,
    setUserProperty
  };
}

/**
 * Hook to automatically track page views on route changes
 */
export function usePageTracking(pageName: string, pagePath?: string) {
  useEffect(() => {
    logAnalyticsEvent("page_view", {
      page_title: pageName,
      page_path: pagePath || window.location.pathname,
      page_location: window.location.href
    });
  }, [pageName, pagePath]);
}
