// In-Memory store as instant fallback if MongoDB Atlas/local is still connecting
const inMemoryStore = {
  templates: [],
  campaigns: []
};

module.exports = inMemoryStore;
