// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Watch the frontend directory for changes
config.watchFolders = [path.resolve(__dirname, "frontend")];

module.exports = config;
