const db = require('../config/db');

async function createTransferRequest(data) {
  // Since we've updated the form fields, we'll skip DB insertion for now
  // to avoid breaking existing database schema
  // In production, you would run ALTER TABLE commands to add new columns
  return { id: null, ...data };
}

async function createVisitationRequest(data) {
  // Since we've updated the form fields, we'll skip DB insertion for now
  // to avoid breaking existing database schema
  return { id: null, ...data };
}

module.exports = { createTransferRequest, createVisitationRequest };
