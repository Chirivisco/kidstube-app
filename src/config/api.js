const API_GATEWAY_URL = process.env.REACT_APP_API_GATEWAY_URL || 'http://localhost:3002';
const REST_API_URL = process.env.REACT_APP_REST_API_URL || 'http://localhost:3001';

export const API_ENDPOINTS = {
  // REST API endpoints
  USERS: `${API_GATEWAY_URL}/users`,
  LOGIN: `${API_GATEWAY_URL}/users/login`,
  VERIFY_EMAIL: `${API_GATEWAY_URL}/users/verify-email`,
  PROFILES: `${API_GATEWAY_URL}/profiles`,
  PROFILES_DIRECT: `${REST_API_URL}/profiles`,
  PLAYLISTS: `${API_GATEWAY_URL}/api/playlists`,
  
  // GraphQL endpoint
  GRAPHQL: `${API_GATEWAY_URL}/graphql`
};

export default API_ENDPOINTS; 