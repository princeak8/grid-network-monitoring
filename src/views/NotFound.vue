<template>
    <div class="not-found">
      <h1>404</h1>
      <div class="error-container">
        <div class="error-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <div class="error-message">
          <h2>Page Not Found</h2>
          <p>Sorry, we couldn't find the page you're looking for.</p>
          <router-link to="/" class="home-link">Go back to home</router-link>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'NotFound',
    metaInfo: {
      title: 'Page Not Found'
    }
  }
  </script>
  
  <style scoped>
  .not-found {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    text-align: center;
    padding: 0 20px;
  }
  
  h1 {
    font-size: 120px;
    margin: 0;
    color: #e74c3c;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 30px;
  }
  
  .error-icon {
    width: 80px;
    height: 80px;
    color: #e74c3c;
    margin-bottom: 20px;
  }
  
  .error-message h2 {
    font-size: 24px;
    margin-bottom: 15px;
  }
  
  .error-message p {
    font-size: 18px;
    margin-bottom: 30px;
    color: #666;
  }
  
  .home-link {
    display: inline-block;
    padding: 12px 24px;
    background-color: #3498db;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    font-weight: bold;
    transition: background-color 0.3s ease;
  }
  
  .home-link:hover {
    background-color: #2980b9;
  }
  
  @media (min-width: 768px) {
    .error-container {
      flex-direction: row;
      text-align: left;
    }
    
    .error-icon {
      margin-right: 30px;
      margin-bottom: 0;
    }
  }
  </style>