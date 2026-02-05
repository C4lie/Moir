import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import WriteEntry from './pages/WriteEntry';
import ViewEntry from './pages/ViewEntry';
import Notebooks from './pages/Notebooks';
import NotebookDetail from './pages/NotebookDetail';
import Calendar from './pages/Calendar';
import Search from './pages/Search';
import WeeklyReflection from './pages/WeeklyReflection';
import ThoughtDump from './pages/ThoughtDump';
import ReloadPrompt from './components/ReloadPrompt';
import InstallPrompt from './components/InstallPrompt';

function App() {
  return (
    <AuthProvider>
      <ReloadPrompt />
      <InstallPrompt />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/write" element={<WriteEntry />} />
            <Route path="/entry/:id" element={<ViewEntry />} />
            <Route path="/entry/:id/edit" element={<WriteEntry />} />
            <Route path="/notebooks" element={<Notebooks />} />
            <Route path="/notebook/:id" element={<NotebookDetail />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/search" element={<Search />} />
            <Route path="/weekly-reflection" element={<WeeklyReflection />} />
            <Route path="/thought-dump" element={<ThoughtDump />} />
            {/* Catch all redirect to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
