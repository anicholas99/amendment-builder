-- Create Enterprise tenant
INSERT INTO tenants (id, name, slug, description, createdAt, updatedAt)
VALUES (
  '3dca69f2-5014-4ae6-87db-637b3ab8a5eb',
  'Enterprise',
  'enterprise',
  'Enterprise tenant for professional patent drafting',
  GETDATE(),
  GETDATE()
); 