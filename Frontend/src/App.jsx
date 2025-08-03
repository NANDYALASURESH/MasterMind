import { BrowserRouter, Routes, Route } from "react-router-dom";

import Welcome from "./Welcome/app";
import LearningPlatform from "./Home/app";
import LoginSignup from "./Login/app";
import SavedCourses from "./savedcourses/app"
import ProtectedRoute from "./ProtectedRoute/app";
import PublicRoute from "./PublicRoute/app"; // new

import "./App.css";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={ <PublicRoute><Welcome /></PublicRoute>} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginSignup />
          </PublicRoute>
        }
      />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <LearningPlatform />
          </ProtectedRoute>
        }
      />
              <Route
          path="/saved-courses"
          element={
            <ProtectedRoute>
              <SavedCourses/>
            </ProtectedRoute>
          }
        />
      </Routes>
  </BrowserRouter>
);

export default App;
