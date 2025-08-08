import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthPage.css'
import { NavigationBar } from './NavigationBar';
import { Footer } from '../utils/Footer'

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const navigate = useNavigate();
  console.log("isLogin:", isLogin)

  const toggleMode = () => {
    setIsLogin(!isLogin);
    console.log("isLogin:", isLogin)
  }
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint = isLogin ? '/api/players/login' : '/api/players/signup';

    const response = await fetch(`http://localhost:5000${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('player', JSON.stringify(data.player));
      navigate('/dashboard', {state: { message: 'Login successful', player: data.player }});
 
    } else {
      alert(data.error || 'Something went wrong');
    }
  };

  return (
    <div>
      <NavigationBar />
      <div className="auth-container">
        <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              required
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>
        </form>
        <button onClick={toggleMode} className="toggle-auth-mode">
          {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Log In'}
        </button>
      </div>
      <Footer />
    </div>
  );
};

export default AuthPage;
