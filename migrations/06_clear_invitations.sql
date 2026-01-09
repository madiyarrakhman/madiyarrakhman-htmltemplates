-- Migration 06: Clear all invitations and RSVPs
-- WARNING: This deletes all user data
TRUNCATE TABLE invitations CASCADE;