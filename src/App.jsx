import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// ================= PAGES =================

import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import ResetPassword from "./pages/ResetPassword/ResetPassword";

import Dashboard from "./pages/Dashboard/Dashboard";
import Employees from "./pages/Employees/Employees";
import Projects from "./pages/Projects/Projects";
import Documents from "./pages/Documents/Documents";

import Relationships from "./pages/Relationships/Relationships";
import AddRelationship from "./pages/Relationships/AddRelationship";

import KnowledgeGraph from "./pages/KnowledgeGraph/KnowledgeGraph";

import AIAssistant from "./pages/AIAssistant/AIAssistant";
import ChatHistory from "./pages/ChatHistory/ChatHistory";

import Reports from "./pages/Reports/Reports";
import Settings from "./pages/Settings/Settings";

import About from "./pages/About/About";
import Help from "./pages/Help/Help";
import Contact from "./pages/Contact/Contact";
import Support from "./pages/Support/Support";

import Profile from "./pages/Profile/Profile";

// ================= ROUTE GUARDS =================

import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";

// ============================================================
// PUBLIC ROUTE
// If user is already logged in → Dashboard
// Otherwise → requested public page
// ============================================================

function PublicRoute({ children }) {
  const token = localStorage.getItem("token");

  if (token && token.trim() !== "") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// ============================================================
// APP
// ============================================================

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ====================================================
            PUBLIC ROUTES
        ==================================================== */}

        {/* LOGIN */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* SIGNUP */}
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />

        {/* FORGOT PASSWORD */}
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />

        {/* RESET PASSWORD */}
        <Route
          path="/reset-password/:token"
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          }
        />

        {/* ====================================================
            PROTECTED ROUTES
        ==================================================== */}

        {/* DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* EMPLOYEES */}
        <Route
          path="/employees"
          element={
            <RoleProtectedRoute
              allowedRoles={[
                "Admin",
                "Manager",
                "Employee",
              ]}
            >
              <Employees />
            </RoleProtectedRoute>
          }
        />

        {/* PROJECTS */}
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <Projects />
            </ProtectedRoute>
          }
        />

        {/* DOCUMENTS */}
        <Route
          path="/documents"
          element={
            <ProtectedRoute>
              <Documents />
            </ProtectedRoute>
          }
        />

        {/* RELATIONSHIPS */}
        <Route
          path="/relationships"
          element={
            <RoleProtectedRoute
              allowedRoles={[
                "Admin",
                "Manager",
                "Employee",
              ]}
            >
              <Relationships />
            </RoleProtectedRoute>
          }
        />

        {/* ADD RELATIONSHIP */}
        <Route
          path="/relationships/add"
          element={
            <RoleProtectedRoute
              allowedRoles={[
                "Admin",
                "Manager",
                "Employee",
              ]}
            >
              <AddRelationship />
            </RoleProtectedRoute>
          }
        />

        {/* KNOWLEDGE GRAPH */}
        <Route
          path="/knowledgegraph"
          element={
            <ProtectedRoute>
              <KnowledgeGraph />
            </ProtectedRoute>
          }
        />

        {/* AI ASSISTANT */}
        <Route
          path="/aiassistant"
          element={
            <ProtectedRoute>
              <AIAssistant />
            </ProtectedRoute>
          }
        />

        {/* CHAT HISTORY */}
        <Route
          path="/chathistory"
          element={
            <ProtectedRoute>
              <ChatHistory />
            </ProtectedRoute>
          }
        />

        {/* REPORTS */}
        <Route
          path="/reports"
          element={
            <RoleProtectedRoute
              allowedRoles={[
                "Admin",
                "Manager",
              ]}
            >
              <Reports />
            </RoleProtectedRoute>
          }
        />

        {/* SETTINGS */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* ABOUT */}
        <Route
          path="/about"
          element={
            <ProtectedRoute>
              <About />
            </ProtectedRoute>
          }
        />

        {/* HELP */}
        <Route
          path="/help"
          element={
            <ProtectedRoute>
              <Help />
            </ProtectedRoute>
          }
        />

        {/* CONTACT */}
        <Route
          path="/contact"
          element={
            <ProtectedRoute>
              <Contact />
            </ProtectedRoute>
          }
        />

        {/* SUPPORT */}
        <Route
          path="/support"
          element={
            <ProtectedRoute>
              <Support />
            </ProtectedRoute>
          }
        />

        {/* PROFILE */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* ====================================================
            FALLBACK
            Unknown URLs → Login
        ==================================================== */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
