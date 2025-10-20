# Google Authentication Setup Guide

This document outlines the Google authentication implementation that has been added to the Nekolator application.

## What was implemented:

### 1. Database Migrations
- **Migration 1**: Added `user_id` column to `calculations` table
- **Migration 2**: Added `user_id` column to `expert_calculations` table
- Both columns are nullable to maintain backward compatibility
- Updated RLS policies to support user-specific access while maintaining public access for anonymous calculations

### 2. Frontend Authentication
- Created `AuthContext` for managing authentication state
- Created `GoogleLogin` component with sign-in/sign-out functionality
- Integrated authentication into the main app with `AuthProvider`
- Added login button to the HomePage

### 3. Backend Integration
- Updated TypeScript types in `supabase.ts` to include user_id fields
- Modified `calculationService.ts` to associate calculations with authenticated users
- Modified `expertCalculationService.ts` to associate expert calculations with authenticated users
- Added service functions to fetch user-specific calculations

### 4. History Feature
- Created `History` component to display user's calculation history
- Added filtering by calculation type (All, Basic, Expert)
- Added navigation to view and edit existing calculations
- Integrated History button in HomePage for logged-in users
- Added comprehensive translations for history feature

## Required Supabase Configuration

To complete the setup, you need to configure Google OAuth in your Supabase project:

### Step 1: Get Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Go to "APIs & Services" → "Credentials"
4. Click "Create Credentials" → "OAuth client ID"
5. Select "Web application"
6. Add authorized JavaScript origins and redirect URIs:
   - JavaScript origin: `https://your-project-ref.supabase.co`
   - Redirect URI: `https://your-project-ref.supabase.co/auth/v1/callback`
7. Save the Client ID and Client Secret

### Step 2: Configure Supabase Auth
1. Go to your Supabase project dashboard
2. Navigate to "Authentication" → "Providers"
3. Enable Google provider
4. Enter the Client ID and Client Secret from Step 1
5. Save the configuration

### Step 3: Run Migrations
The following migrations have been created and need to be applied:

```bash
# Apply the migrations to your Supabase project
supabase db push
```

Or apply them manually in the Supabase dashboard:
- `20251020000000_add_user_id_to_calculations.sql`
- `20251020000001_add_user_id_to_expert_calculations.sql`

## How it Works

### For Anonymous Users
- Calculations are saved with `user_id = NULL`
- Full functionality remains the same as before
- No login required

### For Authenticated Users
- When logged in with Google, new calculations are automatically associated with the user's ID
- Users can see and edit their own calculations
- Anonymous calculations remain visible to all users

### Security
- Row Level Security (RLS) ensures users can only access their own calculations
- Anonymous calculations (user_id = NULL) remain accessible to everyone
- Authentication state is managed securely through Supabase Auth

## History Feature

The History page allows logged-in users to view all their previous calculations:

### Features:
- **Filter by Type**: View All, Basic, or Expert calculations
- **Calculation Details**: See date, type, number of people, and total amount
- **Quick Actions**: View or edit existing calculations directly from history
- **Responsive Design**: Works seamlessly on mobile and desktop

### Access:
- Click the "History" button in the top-right corner (only visible when logged in)
- Navigate directly to `/history` URL
- History is only accessible to authenticated users

### What's displayed:
- Basic calculations with person details and totals
- Expert calculations with items, assignments, and complex data
- Creation dates and calculation metadata
- Quick links to view or edit each calculation

## Testing

1. Start the development server
2. Click "Sign in with Google" on the home page
3. Complete the Google OAuth flow
4. Create a new calculation - it should be associated with your account
5. Click the "History" button to see your calculation
6. Test filtering between All, Basic, and Expert calculations
7. Sign out and create another calculation - it should be anonymous (user_id = NULL)
8. Sign back in - only your authenticated calculations should appear in history

## Files Modified

### New Files:
- `src/contexts/AuthContext.tsx` - Authentication context
- `src/components/auth/GoogleLogin.tsx` - Google login component
- `src/components/History/History.tsx` - History component to display user calculations
- `supabase/migrations/20251020000000_add_user_id_to_calculations.sql`
- `supabase/migrations/20251020000001_add_user_id_to_expert_calculations.sql`

### Modified Files:
- `src/App.tsx` - Added AuthProvider wrapper and History route
- `src/components/HomePage.tsx` - Added GoogleLogin component and History button for logged-in users
- `src/lib/supabase.ts` - Updated TypeScript types
- `src/services/calculationService.ts` - Added user_id to save/update functions and getUserCalculations function
- `src/services/expertCalculationService.ts` - Added user_id to save/update functions and getUserExpertCalculations function
- `src/lib/i18n.tsx` - Added translations for history feature

## Environment Variables

Make sure you have these environment variables configured:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

No additional environment variables are needed for Google OAuth as the configuration is done directly in the Supabase dashboard.