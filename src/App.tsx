import React from 'react';
import { lazy, Suspense, useState, useEffect } from 'react';
import { RouterProvider, createBrowserRouter, Route, Navigate, createRoutesFromElements, Outlet, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/UnifiedAuthContext';
import { isAdmin } from './lib/admin';
import { ToastContainer, ErrorBoundary as CommonErrorBoundary, LoadingSpinner } from './components/common';
import * as Sentry from '@sentry/react';
import { initSentry } from './config/sentry';
import ErrorFallback from './components/ErrorFallback';
import { useAppState } from './services/state/AppStateManager';
import { DataService } from './services/data/DataService';
import { A11yProvider } from './components/A11yProvider';
import { Logger } from './services/logging/Logger';
import { ApiClient } from './services/api/ApiClient';
import { ServiceWorkerProvider } from './contexts/ServiceWorkerContext';
import { AppStateProvider } from './contexts/AppStateContext';
import { DataProvider } from './contexts/DataContext';
import Layout from './components/Layout';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ErrorDisplay from './components/ErrorDisplay';
import { Chatbot } from './components/chatbot/Chatbot';
import LandingPage from './pages/LandingPage';

export interface Agent {
  id: string;
  name: string;
  email: string;
  role: AgentRole;
  skills: Skill[];
  availability: Availability;
  currentWorkload: number;
  maxWorkload: number;
  status: AgentStatus;
  rating: number;
  projects: string[];
}

export interface Skill {
  id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'expert';
  category: SkillCategory;
}

export interface Availability {
  schedule: WorkSchedule[];
  timeZone: string;
  vacationDays: DateRange[];
  preferences: {
    maxProjectsPerDay: number;
    preferredWorkingHours: TimeRange;
  };
}

export type AgentRole = 'junior' | 'senior' | 'lead' | 'supervisor';
export type AgentStatus = 'available' | 'busy' | 'offline' | 'onBreak';
export type SkillCategory = 'technical' | 'customer-service' | 'management' | 'specialized';

initSentry();
const logger = new Logger('App');
const dataService = DataService.getInstance();

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

function AuthenticatedApp() {
  const { user, subscription } = useAppState();

  if (!user || !subscription) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Navigation />
      <main id="main-content">
        <Suspense fallback={<LoadingSpinner />}>
          <RouterProvider router={router} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}

function UnauthenticatedApp() {
  return (
    <main id="main-content">
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </main>
  );
}

export default App;
