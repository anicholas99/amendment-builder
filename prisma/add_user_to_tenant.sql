-- Add user to Enterprise tenant
INSERT INTO user_tenants (id, userId, tenantId, role, createdAt, updatedAt)
VALUES (
  '4dca69f2-5014-4ae6-87db-637b3ab8a5ec',
  'auth0|67e389d0d7b925eb06f56fa0',
  '3dca69f2-5014-4ae6-87db-637b3ab8a5eb',
  'member',
  GETDATE(),
  GETDATE()
); 