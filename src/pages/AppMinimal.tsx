import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Ultra-minimal components
const MinimalHeader = () => (
  <header style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
    <h1>ResidentTrack - Minimal Test</h1>
  </header>
);

const MinimalHome = () => (
  <div style={{ padding: '2rem' }}>
    <h2>Home - Minimal Test</h2>
    <p>If you see this, basic routing works.</p>
  </div>
);

const MinimalAuth = () => (
  <div style={{ padding: '2rem' }}>
    <h2>Auth - Minimal Test</h2>
    <p>Login form would go here.</p>
  </div>
);

const MinimalFMH = () => (
  <div style={{ padding: '2rem' }}>
    <h2>FMH - Minimal Test</h2>
    <p>FMH dashboard would go here.</p>
  </div>
);

const MinimalCourses = () => (
  <div style={{ padding: '2rem' }}>
    <h2>Courses - Minimal Test</h2>
    <p>Courses would go here.</p>
  </div>
);

const MinimalFeatures = () => (
  <div style={{ padding: '2rem' }}>
    <h2>Features - Minimal Test</h2>
    <p>Features would go here.</p>
  </div>
);

const MinimalContact = () => (
  <div style={{ padding: '2rem' }}>
    <h2>Contact - Minimal Test</h2>
    <p>Contact would go here.</p>
  </div>
);

const AppMinimal = () => (
  <BrowserRouter basename="/swiss-med-track">
    <div style={{ minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <MinimalHeader />
      <main>
        <Routes>
          <Route path="/" element={<MinimalHome />} />
          <Route path="/auth" element={<MinimalAuth />} />
          <Route path="/fmh" element={<MinimalFMH />} />
          <Route path="/courses" element={<MinimalCourses />} />
          <Route path="/features" element={<MinimalFeatures />} />
          <Route path="/contact" element={<MinimalContact />} />
          <Route path="*" element={<div style={{ padding: '2rem' }}>404 - Not Found</div>} />
        </Routes>
      </main>
    </div>
  </BrowserRouter>
);

export default AppMinimal;
