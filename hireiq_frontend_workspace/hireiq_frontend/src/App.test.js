import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

// -- Mocks and helpers for Supabase and Auth context --
jest.mock('./auth/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(() => ({ select: jest.fn(), insert: jest.fn(), update: jest.fn(), delete: jest.fn(), upsert: jest.fn(), order: jest.fn() })),
    storage: { from: jest.fn(() => ({ upload: jest.fn(), download: jest.fn() })) },
  },
}));

const SUPABASE_USER = { id: 'user1', email: 'user@example.com', user_metadata: { role: 'Candidate' } };
const SUPABASE_ADMIN = { id: 'admin1', email: 'admin@example.com', user_metadata: { role: 'Admin' } };
const SUPABASE_RECRUITER = { id: 'rec1', email: 'rec@example.com', user_metadata: { role: 'Recruiter' } };

function clearStorage() {
  window.localStorage.removeItem('hireiq_user');
}

describe('HireIQ All Flows & Edge Cases', () => {
  beforeEach(() => {
    clearStorage();
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('Login page renders and blocks dashboard access when unauthenticated', async () => {
    render(<MemoryRouter initialEntries={['/candidate']}><App /></MemoryRouter>);
    // Should land on login page
    expect(screen.getByText(/login/i)).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'pass1234' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    // Must show error as supabase.auth.signInWithPassword not resolved
    await waitFor(() => screen.getByText(/invalid/i));
  });

  test('Demo account login works for candidate, recruiter, and admin, routes to correct dashboard', async () => {
    // Use demo login mode for all 3 roles
    for (const roleObj of [
      { username: 'candidate', password: 'candidate', dashboard: /candidate/i },
      { username: 'recruiter', password: 'recruiter', dashboard: /recruiter/i },
      { username: 'admin', password: 'admin', dashboard: /admin/i }
    ]) {
      clearStorage();
      render(<MemoryRouter initialEntries={['/login']}><App /></MemoryRouter>);
      // Activate demo login mode
      fireEvent.click(screen.getByText(/use demo account/i));
      fireEvent.change(screen.getByPlaceholderText(/Demo Username/i), { target: { value: roleObj.username } });
      fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: roleObj.password } });
      fireEvent.click(screen.getByRole('button', { name: /login/i }));
      // First role should render right dashboard
      await waitFor(() => screen.getByText(new RegExp(roleObj.dashboard, 'i')), { timeout: 1500 });
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    }
  });

  test('Invalid demo login shows error and does not log in', async () => {
    render(<MemoryRouter initialEntries={['/login']}><App /></MemoryRouter>);
    fireEvent.click(screen.getByText(/use demo account/i));
    fireEvent.change(screen.getByPlaceholderText(/Demo Username/i), { target: { value: 'notarole' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    await waitFor(() => screen.getByText(/invalid username/i));
    expect(screen.queryByText(/dashboard/i)).not.toBeInTheDocument();
  });

  test('Registration flow: registers user and shows email confirmation message', async () => {
    const { supabase } = require('./auth/supabaseClient');
    supabase.auth.signUp.mockResolvedValue({
      data: { user: { ...SUPABASE_USER } },
      error: null
    });
    render(<MemoryRouter initialEntries={['/register']}><App /></MemoryRouter>);
    fireEvent.change(screen.getByPlaceholderText(/work email/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'mypassword' } });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Candidate' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    await waitFor(() => screen.getByText(/successful/i));
    expect(screen.getByText(/check your email to confirm your account/i)).toBeInTheDocument();
  });

  test('Protected route blocks wrong role/wrong state and redirects to notfound', async () => {
    // Simulate candidate user in localStorage, try to access recruiter route
    window.localStorage.setItem('hireiq_user', JSON.stringify({ id: '1', email: 'c@test.com', role: 'Candidate' }));
    render(<MemoryRouter initialEntries={['/recruiter']}><App /></MemoryRouter>);
    await waitFor(() => screen.getByText(/not found/i));
    expect(screen.getByText(/404/i)).toBeInTheDocument();
  });

  test('Logout removes user from localStorage and redirects to login', async () => {
    // Simulate recruiter logged in
    window.localStorage.setItem('hireiq_user', JSON.stringify({ id: '2', email: 'r@test.com', role: 'Recruiter' }));
    render(<MemoryRouter initialEntries={['/recruiter']}><App /></MemoryRouter>);
    await waitFor(() => screen.getByText(/logout/i));
    fireEvent.click(screen.getByRole('button', { name: /logout/i }));
    await waitFor(() => screen.getByText(/login/i));
    expect(localStorage.getItem('hireiq_user')).toBeNull();
  });

  test('Profile page shows correct user info for all roles', async () => {
    const roles = ['Candidate', 'Recruiter', 'Admin'];
    for (const role of roles) {
      clearStorage();
      window.localStorage.setItem('hireiq_user', JSON.stringify({ id: 'x', email: 'user@t.com', role }));
      render(<MemoryRouter initialEntries={['/profile']}><App /></MemoryRouter>);
      await waitFor(() => screen.getByText(/profile/i));
      expect(screen.getByText(new RegExp(role, 'i'))).toBeInTheDocument();
    }
  });

  test('Nonexistent routes show NotFound', () => {
    render(<MemoryRouter initialEntries={['/somethingthatdoesnotexist']}><App /></MemoryRouter>);
    expect(screen.getByText(/404/i)).toBeInTheDocument();
  });

  test('Theme toggle button changes theme', () => {
    render(<MemoryRouter><App /></MemoryRouter>);
    const toggleButton = screen.getByRole('button', { name: /switch to dark mode/i });
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    fireEvent.click(toggleButton);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    fireEvent.click(screen.getByRole('button', { name: /switch to light mode/i }));
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });
});

// Note: Full recruiter/candidate/admin dashboard CRUD tests for jobs/applications would require deeper Supabase query mocks and UI state. For full e2e, use Cypress/Playwright or integration test with Supabase test instance.
