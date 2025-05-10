#!/bin/bash

# FAIT 2.0 Login Issues Fix Script
# This script helps diagnose and fix common login issues in the FAIT 2.0 platform

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print header
echo -e "${BLUE}====================================${NC}"
echo -e "${BLUE}  FAIT 2.0 Login Issues Fix Script  ${NC}"
echo -e "${BLUE}====================================${NC}"
echo ""

# Check for .env file
echo -e "${YELLOW}Checking for .env file...${NC}"
if [ -f ".env" ]; then
  echo -e "${GREEN}✓ .env file found${NC}"

  # Check for Supabase environment variables
  if grep -q "VITE_SUPABASE_URL" .env && grep -q "VITE_SUPABASE_ANON_KEY" .env; then
    echo -e "${GREEN}✓ Supabase environment variables found in .env${NC}"
  else
    echo -e "${RED}✗ Supabase environment variables missing from .env${NC}"
    echo -e "${YELLOW}Adding default Supabase variables to .env...${NC}"

    # Add variables if they don't exist
    if ! grep -q "VITE_SUPABASE_URL" .env; then
      echo "VITE_SUPABASE_URL=https://sjrehyseqqptdcnadvod.supabase.co" >> .env
    fi

    if ! grep -q "VITE_SUPABASE_ANON_KEY" .env; then
      echo "VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqcmVoeXNlcXFwdGRjbmFkdm9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MzMxMzcsImV4cCI6MjA1OTAwOTEzN30.fPyawZcgteRLZUH0MvtVSmNmZSdbxUOyN9lo6BDe8-8" >> .env
    fi

    echo -e "${GREEN}✓ Added Supabase variables to .env${NC}"
  fi
else
  echo -e "${RED}✗ .env file not found${NC}"
  echo -e "${YELLOW}Creating .env file with default Supabase variables...${NC}"

  # Create .env file with default variables
  cat > .env << EOL
# Supabase Configuration
VITE_SUPABASE_URL=https://sjrehyseqqptdcnadvod.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqcmVoeXNlcXFwdGRjbmFkdm9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MzMxMzcsImV4cCI6MjA1OTAwOTEzN30.fPyawZcgteRLZUH0MvtVSmNmZSdbxUOyN9lo6BDe8-8

# Application Settings
NODE_ENV=development
EOL

  echo -e "${GREEN}✓ Created .env file with default Supabase variables${NC}"
fi

# Check for supabase.ts file
echo -e "\n${YELLOW}Checking for supabase.ts file...${NC}"
SUPABASE_FILE_FOUND=false

# Check in common locations
for location in "src/lib/supabase.ts" "src/lib/supabaseClient.ts" "src/supabase.ts"; do
  if [ -f "$location" ]; then
    SUPABASE_FILE_FOUND=true
    SUPABASE_FILE_PATH=$location
    echo -e "${GREEN}✓ Found Supabase configuration at $location${NC}"
    break
  fi
done

if [ "$SUPABASE_FILE_FOUND" = false ]; then
  echo -e "${RED}✗ Supabase configuration file not found${NC}"
  echo -e "${YELLOW}Creating supabase.ts file in src/lib/...${NC}"

  # Create directory if it doesn't exist
  mkdir -p src/lib

  # Create supabase.ts file
  cat > src/lib/supabase.ts << EOL
import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ydisdyadjupyswcpbxzu.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkaXNkeWFkanVweXN3Y3BieHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MzM1ODcsImV4cCI6MjA1OTAwOTU4N30.Iy_qqNtTzVi-XVKzBqDWOUGJdFV9ckLynR_bRLUvdnY';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Log initialization
console.log('Supabase client initialized with URL:', supabaseUrl);
EOL

  SUPABASE_FILE_PATH="src/lib/supabase.ts"
  echo -e "${GREEN}✓ Created supabase.ts file at src/lib/supabase.ts${NC}"
else
  # Check if the file has local auth mode
  if grep -q "useLocalAuth" "$SUPABASE_FILE_PATH" || grep -q "localAuth" "$SUPABASE_FILE_PATH"; then
    echo -e "${YELLOW}⚠ Local auth mode detected in $SUPABASE_FILE_PATH${NC}"
    echo -e "${YELLOW}Disabling local auth mode by default...${NC}"

    # Create a backup
    cp "$SUPABASE_FILE_PATH" "${SUPABASE_FILE_PATH}.bak"
    echo -e "${GREEN}✓ Created backup at ${SUPABASE_FILE_PATH}.bak${NC}"

    # Replace local auth mode
    sed -i '' 's/const DEFAULT_LOCAL_AUTH = true/const DEFAULT_LOCAL_AUTH = false/g' "$SUPABASE_FILE_PATH"
    sed -i '' 's/let useLocalAuth = true/let useLocalAuth = false/g' "$SUPABASE_FILE_PATH"

    echo -e "${GREEN}✓ Disabled local auth mode by default${NC}"
  fi
fi

# Check for AuthContext.tsx file
echo -e "\n${YELLOW}Checking for AuthContext.tsx file...${NC}"
AUTH_CONTEXT_FOUND=false

# Check in common locations
for location in "src/contexts/AuthContext.tsx" "src/context/AuthContext.tsx" "src/AuthContext.tsx"; do
  if [ -f "$location" ]; then
    AUTH_CONTEXT_FOUND=true
    AUTH_CONTEXT_PATH=$location
    echo -e "${GREEN}✓ Found AuthContext at $location${NC}"
    break
  fi
done

if [ "$AUTH_CONTEXT_FOUND" = false ]; then
  echo -e "${RED}✗ AuthContext file not found${NC}"
  echo -e "${YELLOW}Creating AuthContext.tsx file in src/contexts/...${NC}"

  # Create directory if it doesn't exist
  mkdir -p src/contexts

  # Create AuthContext.tsx file
  cat > src/contexts/AuthContext.tsx << EOL
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

// Define the type for the context
interface AuthContextType {
  user: any | null;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  loading: boolean;
}

// Create and export the context with default values
export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => null,
  logout: async () => {},
  loading: true,
});

// Create and export the provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for active session on load
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
      setLoading(false);
    };

    checkSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Define the login function with debug logging
  const login = async (email: string, password: string) => {
    console.log('Login function called with email:', email);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Supabase login error:', error);
      throw error;
    }

    console.log('Login successful, data:', data);
    return data;
  };

  // Define the logout function
  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
EOL

  AUTH_CONTEXT_PATH="src/contexts/AuthContext.tsx"
  echo -e "${GREEN}✓ Created AuthContext.tsx file at src/contexts/AuthContext.tsx${NC}"
fi

# Create diagnostic login page
echo -e "\n${YELLOW}Creating diagnostic login page...${NC}"
if [ -f "auth-diagnostic.html" ]; then
  echo -e "${GREEN}✓ auth-diagnostic.html already exists${NC}"
else
  # Create auth-diagnostic.html
  cat > auth-diagnostic.html << EOL
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FAIT 2.0 Authentication Diagnostic</title>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      color: #e91e63; /* Electric pink */
      border-bottom: 2px solid #f06292; /* Lighter fuscia */
    }
    .card {
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      padding: 20px;
      margin-bottom: 20px;
    }
    .form-group {
      margin-bottom: 15px;
    }
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }
    input {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-sizing: border-box;
    }
    button {
      background-color: #e91e63; /* Electric pink */
      color: white;
      border: none;
      padding: 10px 15px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
    }
    button:hover {
      background-color: #c2185b; /* Darker pink */
    }
    .log-container {
      background-color: #f5f5f5;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 15px;
      max-height: 300px;
      overflow-y: auto;
      font-family: monospace;
      white-space: pre-wrap;
    }
    .success {
      color: #4caf50;
      font-weight: bold;
    }
    .error {
      color: #f44336;
      font-weight: bold;
    }
    .warning {
      color: #ff9800;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <h1>FAIT 2.0 Authentication Diagnostic</h1>

  <div class="card">
    <h2>Supabase Authentication Test</h2>
    <p>Test authentication with Supabase using the credentials below:</p>

    <div class="form-group">
      <label for="email">Email:</label>
      <input type="email" id="email" placeholder="Enter email" value="admin@itsfait.com">
    </div>

    <div class="form-group">
      <label for="password">Password:</label>
      <input type="password" id="password" placeholder="Enter password" value="admin123">
    </div>

    <button id="login-btn">Test Login</button>
    <button id="logout-btn">Test Logout</button>
  </div>

  <div class="card">
    <h2>Test Results</h2>
    <div id="status"></div>
    <div id="result" class="log-container"></div>
  </div>

  <script>
    // Utility function to log messages
    function log(message, type = 'info') {
      const resultContainer = document.getElementById('result');
      const timestamp = new Date().toLocaleTimeString();
      const logEntry = document.createElement('div');
      logEntry.className = type;
      logEntry.textContent = \`[\${timestamp}] \${message}\`;
      resultContainer.appendChild(logEntry);
      resultContainer.scrollTop = resultContainer.scrollHeight;
      console.log(\`[\${timestamp}] \${message}\`);
    }

    // Initialize Supabase client
    let supabase;

    try {
      // Get Supabase URL and key from localStorage if available
      let supabaseUrl = localStorage.getItem('supabaseUrl') || 'https://ydisdyadjupyswcpbxzu.supabase.co';
      let supabaseAnonKey = localStorage.getItem('supabaseAnonKey') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkaXNkeWFkanVweXN3Y3BieHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MzM1ODcsImV4cCI6MjA1OTAwOTU4N30.Iy_qqNtTzVi-XVKzBqDWOUGJdFV9ckLynR_bRLUvdnY';

      log(\`Using Supabase URL: \${supabaseUrl}\`);

      // Create Supabase client
      supabase = supabaseJs.createClient(supabaseUrl, supabaseAnonKey);

      // Sign in
      document.getElementById('login-btn').addEventListener('click', async () => {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (!email || !password) {
          document.getElementById('status').innerHTML =
            '<p class="error">Please enter both email and password</p>';
          return;
        }

        log(\`Testing login with email: \${email}\`);

        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          });

          if (error) {
            log(\`Login error: \${error.message}\`, 'error');
            document.getElementById('status').innerHTML =
              \`<p class="error">Login failed: \${error.message}</p>\`;
          } else if (data?.user) {
            log(\`Login successful for user: \${data.user.email}\`, 'success');
            document.getElementById('status').innerHTML =
              \`<p class="success">Login successful! Logged in as: \${data.user.email}</p>\`;

            // Log user details
            log(\`User ID: \${data.user.id}\`);
            log(\`Email: \${data.user.email}\`);
            if (data.user.user_metadata) {
              log(\`User metadata: \${JSON.stringify(data.user.user_metadata)}\`);
            }
          } else {
            log('Login did not return an error but no user data was returned', 'warning');
            document.getElementById('status').innerHTML =
              '<p class="warning">Login response was successful but no user data was returned</p>';
          }
        } catch (err) {
          log(\`Login exception: \${err.message}\`, 'error');
          document.getElementById('status').innerHTML =
            \`<p class="error">Exception during login: \${err.message}</p>\`;
        }
      });

      // Sign out
      document.getElementById('logout-btn').addEventListener('click', async () => {
        log('Testing logout...');

        try {
          const { error } = await supabase.auth.signOut();

          if (error) {
            log(\`Logout error: \${error.message}\`, 'error');
            document.getElementById('status').innerHTML =
              \`<p class="error">Logout failed: \${error.message}</p>\`;
          } else {
            log('Logout successful', 'success');
            document.getElementById('status').innerHTML =
              '<p>Not logged in</p>';
          }
        } catch (err) {
          log(\`Logout exception: \${err.message}\`, 'error');
        }
      });

      // Check for existing session
      supabase.auth.getSession().then(({ data, error }) => {
        if (error) {
          log(\`Error getting session: \${error.message}\`, 'error');
        } else if (data.session) {
          log(\`Active session found for user: \${data.session.user.email}\`, 'success');
          document.getElementById('status').innerHTML =
            \`<p class="success">Currently logged in as: \${data.session.user.email}</p>\`;
        } else {
          log('No active session found');
          document.getElementById('status').innerHTML =
            '<p>Not logged in</p>';
        }
      });
    } catch (error) {
      log(\`Error initializing Supabase: \${error.message}\`, 'error');
    }
  </script>
</body>
</html>
EOL

  echo -e "${GREEN}✓ Created auth-diagnostic.html${NC}"
fi

# Clear browser storage
echo -e "\n${YELLOW}Would you like to clear browser storage for this site? (y/n)${NC}"
read -r clear_storage

if [ "$clear_storage" = "y" ] || [ "$clear_storage" = "Y" ]; then
  echo -e "${YELLOW}Please follow these steps to clear browser storage:${NC}"
  echo -e "1. Open your browser's developer tools (F12 or Right-click > Inspect)"
  echo -e "2. Go to the 'Application' tab"
  echo -e "3. Select 'Local Storage' on the left"
  echo -e "4. Right-click on your site and select 'Clear'"
  echo -e "5. Do the same for 'Session Storage' and 'Cookies'"
  echo -e "${GREEN}✓ Browser storage cleared manually${NC}"
fi

# Summary
echo -e "\n${BLUE}====================================${NC}"
echo -e "${BLUE}          Summary of Fixes           ${NC}"
echo -e "${BLUE}====================================${NC}"
echo -e "1. Checked/created .env file with Supabase variables"
echo -e "2. Checked/created Supabase client configuration"
echo -e "3. Checked/created AuthContext provider"
echo -e "4. Created authentication diagnostic tool"
echo -e "\n${GREEN}All fixes have been applied!${NC}"
echo -e "\n${YELLOW}Next steps:${NC}"
echo -e "1. Run your application with: npm run dev (or yarn dev)"
echo -e "2. Open auth-diagnostic.html in your browser to test authentication"
echo -e "3. If issues persist, check the browser console for errors"
echo -e "\n${BLUE}====================================${NC}"

exit 0
