import { requireAdminForDelete } from '../role';
import { NextApiRequest, NextApiResponse } from 'next';
import { withTenantGuard } from '../authorization';

function createMockReq(
  method: string,
  userRole: string,
  tenantId = 'tenant-1'
): NextApiRequest {
  return {
    method,
    user: {
      id: 'user-1',
      email: 'test@example.com',
      role: userRole,
      tenantId,
    },
    // minimal props used by middleware
  } as unknown as NextApiRequest;
}

function createMockRes() {
  const res = {
    statusCode: 200,
    body: null as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
    end() {
      return this;
    },
  };
  return res as unknown as NextApiResponse & { body: unknown };
}

describe('RBAC middleware', () => {
  it('requireAdminForDelete blocks USER role on DELETE', async () => {
    const protectedHandler = requireAdminForDelete((req, res) => {
      res.status(200).json({ ok: true });
    });

    const req = createMockReq('DELETE', 'USER');
    const res = createMockRes();

    await protectedHandler(req, res);
    expect(res.statusCode).toBe(403);
  });

  it('requireAdminForDelete allows ADMIN role on DELETE', async () => {
    const protectedHandler = requireAdminForDelete((req, res) => {
      res.status(204).end();
    });

    const req = createMockReq('DELETE', 'ADMIN');
    const res = createMockRes();

    await protectedHandler(req, res);
    expect(res.statusCode).toBe(204);
  });

  it('withTenantGuard denies role mismatch', async () => {
    const resolveTenantId = () => 'tenant-1';
    const guarded = withTenantGuard(resolveTenantId, ['ADMIN'])((req, res) => {
      res.status(200).json({ ok: true });
    });

    const req = createMockReq('GET', 'USER'); // USER not allowed
    const res = createMockRes();

    await guarded(req, res);
    expect(res.statusCode).toBe(403);
  });

  it('withTenantGuard allows proper role', async () => {
    const resolveTenantId = () => 'tenant-1';
    const guarded = withTenantGuard(resolveTenantId, ['ADMIN'])((req, res) => {
      res.status(200).json({ ok: true });
    });

    const req = createMockReq('GET', 'ADMIN');
    const res = createMockRes();

    await guarded(req, res);
    expect(res.statusCode).toBe(200);
    expect((res as unknown as Record<string, unknown>).body).toEqual({
      ok: true,
    });
  });
});
