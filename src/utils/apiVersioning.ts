/**
 * API Versioning Utilities
 *
 * This file provides utilities for handling API versioning in Next.js API routes.
 * It includes middleware for validating version headers and router creation.
 */

import type { NextApiRequest, NextApiResponse } from 'next';

// Available API versions (add new versions here when API changes)
const API_VERSIONS = ['v1'] as const;
type ApiVersion = (typeof API_VERSIONS)[number];

// Current default version
const DEFAULT_VERSION: ApiVersion = 'v1';

// Type for versioned handlers
type VersionedHandler = (
  req: NextApiRequest,
  res: NextApiResponse,
  version: ApiVersion
) => Promise<void> | void;

// Type for version handlers map
type VersionHandlers = {
  [key in ApiVersion]?: VersionedHandler;
};

/**
 * Check if a version is valid
 * @param version Version to check
 * @returns Whether the version is valid
 */
const isValidVersion = (version: string): version is ApiVersion => {
  return API_VERSIONS.includes(version as ApiVersion);
};

/**
 * Extract version from request
 * @param req Next.js API request
 * @returns API version from header, URL path, or default
 */
const getRequestVersion = (req: NextApiRequest): ApiVersion => {
  // Try to get from Accept-Version header
  const headerVersion = req.headers['accept-version'] as string;
  if (headerVersion && isValidVersion(headerVersion)) {
    return headerVersion;
  }

  // Try to get from URL path
  const urlParts = req.url?.split('/').filter(Boolean);
  if (urlParts && urlParts.length > 0) {
    const pathVersion = urlParts[0];
    if (isValidVersion(pathVersion)) {
      return pathVersion;
    }
  }

  // Fall back to default version
  return DEFAULT_VERSION;
};

/**
 * Create a versioned API handler for Next.js API routes
 * @param handlers Map of version handlers
 * @param options Configuration options
 * @returns Next.js API handler function
 */
export const createVersionedHandler = (
  handlers: VersionHandlers,
  options: {
    defaultVersion?: ApiVersion;
    onInvalidVersion?: (req: NextApiRequest, res: NextApiResponse) => void;
  } = {}
) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Get the requested version
    const version = getRequestVersion(req);

    // Set version response header
    res.setHeader('API-Version', version);

    // Get handler for the version
    const handler = handlers[version];

    if (handler) {
      // Execute the handler for that version
      return handler(req, res, version);
    } else {
      // Use default version handler if specified version not found
      const defaultHandler =
        handlers[options.defaultVersion || DEFAULT_VERSION];

      if (defaultHandler) {
        return defaultHandler(req, res, version);
      } else if (options.onInvalidVersion) {
        return options.onInvalidVersion(req, res);
      } else {
        // Default invalid version handler
        return res.status(400).json({
          error: 'Unsupported API version',
          supportedVersions: API_VERSIONS,
        });
      }
    }
  };
};

/**
 * Middleware to validate API version
 * @param handler API route handler
 * @returns Handler with version validation
 */
export const withVersioning = (handler: VersionedHandler) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Get and validate the requested version
    const version = getRequestVersion(req);

    // Set version response header
    res.setHeader('API-Version', version);

    // Execute the handler with version
    return handler(req, res, version);
  };
};
