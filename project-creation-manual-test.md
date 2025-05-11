# Project Creation Manual Test Plan

## Overview
This test plan verifies that the project creation functionality works correctly, specifically that projects appear in the list after they are created.

## Prerequisites
- The application is running locally at http://localhost:5173
- You have access to a user account with permissions to create projects

## Test Steps

### Test Case 1: Create a New Project

1. **Navigate to Projects Page**
   - Open your browser and go to http://localhost:5173/projects
   - Verify that the projects page loads correctly

2. **Navigate to Project Creation Page**
   - Click on the "New Project" button
   - Verify that you are redirected to the project creation page at http://localhost:5173/projects/create

3. **Fill Out Project Form**
   - Enter a unique title for your project (e.g., "Test Kitchen Remodel 12345")
   - Enter a description (e.g., "Complete kitchen renovation with new appliances")
   - Enter a budget (e.g., "25000")
   - Select a timeline (e.g., "2-3 months")
   - Select a category (e.g., "Renovation")
   - Enter an address (e.g., "123 Main St")
   - Enter a city (e.g., "Denver")
   - Select a state (e.g., "Colorado")
   - Enter a ZIP code (e.g., "80202")

4. **Submit the Form**
   - Click the "Create Project" button
   - Verify that you are redirected to the projects page at http://localhost:5173/projects

5. **Verify Project Appears in List**
   - Look for your project in the list of projects
   - Verify that the project title matches what you entered
   - If you don't see your project, click the "Refresh Projects" button

### Test Case 2: Verify Refresh Functionality

1. **Navigate to Projects Page**
   - Open your browser and go to http://localhost:5173/projects

2. **Click Refresh Button**
   - Click the "Refresh Projects" button
   - Verify that the page refreshes and still shows your projects

## Expected Results
- After creating a new project, you should be redirected to the projects list page
- The newly created project should appear in the list of projects
- If the project doesn't appear immediately, clicking the "Refresh Projects" button should make it appear

## Notes
- If you encounter any issues, check the browser console for error messages
- The project title should be unique to easily identify your new project in the list
