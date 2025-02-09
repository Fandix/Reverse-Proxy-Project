const NodeCache = require('node-cache');
const axios = require('axios');

const cache = new NodeCache({ stdTTL: 300 });

module.exports = {
  async get(url) {
    const cachedResponse = cache.get(url);
    return cachedResponse ? cachedResponse : null;
  },

  async set(url, response) {
    cache.set(url, response);
  },

  async fetchAndCache(url) {
    try {
      const response = await axios.get(url);
      this.set(url, response.data);
      return response.data;
    } catch (err) {
      console.error(`Error fetching data: ${err.message}`);
      throw err;
    }
  }
};