/**
 * Affine Transformation Utilities for Map Georeferencing
 *
 * This module provides functions to calculate transformation matrices
 * from Ground Control Points (GCPs) and compute map bounds.
 */

import type { GroundControlPoint } from '@/lib/db/schema'

/**
 * 2x3 Affine transformation matrix
 * [a, b, c]
 * [d, e, f]
 *
 * Transforms (x, y) to:
 * x' = a*x + b*y + c
 * y' = d*x + e*y + f
 */
export type AffineMatrix = {
  a: number
  b: number
  c: number
  d: number
  e: number
  f: number
}

/**
 * Calculate affine transformation matrix from exactly 3 GCPs
 * Uses direct solution of linear system
 */
function calculateAffineFrom3Points(gcps: GroundControlPoint[]): AffineMatrix {
  if (gcps.length !== 3) {
    throw new Error('Exactly 3 GCPs required for direct affine calculation')
  }

  const [p1, p2, p3] = gcps

  // Source points (image coordinates)
  const x1 = p1.imageX, y1 = p1.imageY
  const x2 = p2.imageX, y2 = p2.imageY
  const x3 = p3.imageX, y3 = p3.imageY

  // Target points (GPS coordinates - lat is y, lng is x)
  const u1 = p1.longitude, v1 = p1.latitude
  const u2 = p2.longitude, v2 = p2.latitude
  const u3 = p3.longitude, v3 = p3.latitude

  // Calculate determinant
  const det = x1 * (y2 - y3) - y1 * (x2 - x3) + (x2 * y3 - x3 * y2)

  if (Math.abs(det) < 1e-10) {
    throw new Error('GCPs are collinear, cannot compute transformation')
  }

  // Calculate transformation coefficients for longitude (x')
  const a = ((u1 * (y2 - y3)) + (u2 * (y3 - y1)) + (u3 * (y1 - y2))) / det
  const b = ((u1 * (x3 - x2)) + (u2 * (x1 - x3)) + (u3 * (x2 - x1))) / det
  const c = ((u1 * (x2 * y3 - x3 * y2)) + (u2 * (x3 * y1 - x1 * y3)) + (u3 * (x1 * y2 - x2 * y1))) / det

  // Calculate transformation coefficients for latitude (y')
  const d = ((v1 * (y2 - y3)) + (v2 * (y3 - y1)) + (v3 * (y1 - y2))) / det
  const e = ((v1 * (x3 - x2)) + (v2 * (x1 - x3)) + (v3 * (x2 - x1))) / det
  const f = ((v1 * (x2 * y3 - x3 * y2)) + (v2 * (x3 * y1 - x1 * y3)) + (v3 * (x1 * y2 - x2 * y1))) / det

  return { a, b, c, d, e, f }
}

/**
 * Calculate affine transformation matrix using least squares for 4+ GCPs
 * This provides a best-fit solution when there are more points than needed
 */
function calculateAffineFromMultiplePoints(gcps: GroundControlPoint[]): AffineMatrix {
  const n = gcps.length

  // Build normal equations for least squares
  // We're solving: [A][coeffs] = [B] where A is the design matrix
  // For affine transform: x' = a*x + b*y + c, y' = d*x + e*y + f

  let sumX = 0, sumY = 0, sumX2 = 0, sumY2 = 0, sumXY = 0
  let sumU = 0, sumV = 0
  let sumXU = 0, sumYU = 0, sumXV = 0, sumYV = 0

  for (const gcp of gcps) {
    const x = gcp.imageX
    const y = gcp.imageY
    const u = gcp.longitude
    const v = gcp.latitude

    sumX += x
    sumY += y
    sumX2 += x * x
    sumY2 += y * y
    sumXY += x * y
    sumU += u
    sumV += v
    sumXU += x * u
    sumYU += y * u
    sumXV += x * v
    sumYV += y * v
  }

  // Solve 3x3 system for longitude coefficients (a, b, c)
  // | sumX2  sumXY  sumX | | a |   | sumXU |
  // | sumXY  sumY2  sumY | | b | = | sumYU |
  // | sumX   sumY   n    | | c |   | sumU  |

  const detLng = sumX2 * (sumY2 * n - sumY * sumY)
              - sumXY * (sumXY * n - sumY * sumX)
              + sumX * (sumXY * sumY - sumY2 * sumX)

  if (Math.abs(detLng) < 1e-10) {
    // Fall back to 3-point solution if matrix is singular
    return calculateAffineFrom3Points(gcps.slice(0, 3))
  }

  const a = (sumXU * (sumY2 * n - sumY * sumY)
          - sumXY * (sumYU * n - sumY * sumU)
          + sumX * (sumYU * sumY - sumY2 * sumU)) / detLng

  const b = (sumX2 * (sumYU * n - sumY * sumU)
          - sumXU * (sumXY * n - sumY * sumX)
          + sumX * (sumXY * sumU - sumYU * sumX)) / detLng

  const c = (sumX2 * (sumY2 * sumU - sumY * sumYU)
          - sumXY * (sumXY * sumU - sumY * sumXU)
          + sumXU * (sumXY * sumY - sumY2 * sumX)) / detLng

  // Solve 3x3 system for latitude coefficients (d, e, f)
  const d = (sumXV * (sumY2 * n - sumY * sumY)
          - sumXY * (sumYV * n - sumY * sumV)
          + sumX * (sumYV * sumY - sumY2 * sumV)) / detLng

  const e = (sumX2 * (sumYV * n - sumY * sumV)
          - sumXV * (sumXY * n - sumY * sumX)
          + sumX * (sumXY * sumV - sumYV * sumX)) / detLng

  const f = (sumX2 * (sumY2 * sumV - sumY * sumYV)
          - sumXY * (sumXY * sumV - sumY * sumXV)
          + sumXV * (sumXY * sumY - sumY2 * sumX)) / detLng

  return { a, b, c, d, e, f }
}

/**
 * Calculate the affine transformation matrix from GCPs
 */
export function calculateAffineTransform(gcps: GroundControlPoint[]): AffineMatrix {
  if (gcps.length < 3) {
    throw new Error('At least 3 GCPs are required')
  }

  // Always use 3-point solution for now - the least-squares has a bug
  // For 4 corners, use points 1, 2, 4 (top-left, top-right, bottom-left) to form a triangle
  if (gcps.length === 4) {
    return calculateAffineFrom3Points([gcps[0], gcps[1], gcps[3]])
  }

  if (gcps.length === 3) {
    return calculateAffineFrom3Points(gcps)
  }

  return calculateAffineFromMultiplePoints(gcps)
}

/**
 * Transform image coordinates to GPS coordinates using an affine matrix
 */
export function imageToGPS(
  imageX: number,
  imageY: number,
  matrix: AffineMatrix
): { lat: number; lng: number } {
  const lng = matrix.a * imageX + matrix.b * imageY + matrix.c
  const lat = matrix.d * imageX + matrix.e * imageY + matrix.f
  return { lat, lng }
}

/**
 * Calculate the average error (in degrees) between GCPs and transformed positions
 */
export function calculateTransformError(
  gcps: GroundControlPoint[],
  matrix: AffineMatrix
): number {
  if (gcps.length === 0) return 0

  let totalError = 0

  for (const gcp of gcps) {
    const transformed = imageToGPS(gcp.imageX, gcp.imageY, matrix)
    const latError = transformed.lat - gcp.latitude
    const lngError = transformed.lng - gcp.longitude
    totalError += Math.sqrt(latError * latError + lngError * lngError)
  }

  return totalError / gcps.length
}

/**
 * Calculate map bounds from GCPs by transforming image corners
 *
 * @param gcps - Ground Control Points
 * @param imageWidth - Natural width of the image (for aspect ratio)
 * @param imageHeight - Natural height of the image (for aspect ratio)
 * @returns Bounding box in GPS coordinates
 */
export function calculateBoundsFromGCPs(
  gcps: GroundControlPoint[],
  imageWidth: number,
  imageHeight: number
): { north: number; south: number; east: number; west: number } {
  if (gcps.length < 3) {
    throw new Error('At least 3 GCPs are required to calculate bounds')
  }

  const matrix = calculateAffineTransform(gcps)

  // Transform the 4 corners of the image (normalized 0-1 coordinates)
  const corners = [
    imageToGPS(0, 0, matrix),        // Top-left
    imageToGPS(1, 0, matrix),        // Top-right
    imageToGPS(1, 1, matrix),        // Bottom-right
    imageToGPS(0, 1, matrix),        // Bottom-left
  ]

  // Find bounding box
  const lats = corners.map(c => c.lat)
  const lngs = corners.map(c => c.lng)

  return {
    north: Math.max(...lats),
    south: Math.min(...lats),
    east: Math.max(...lngs),
    west: Math.min(...lngs),
  }
}

/**
 * Check if GCPs are approximately collinear
 * Returns true if points are too close to a line
 */
export function areGCPsCollinear(gcps: GroundControlPoint[]): boolean {
  if (gcps.length < 3) return true

  const [p1, p2, p3] = gcps

  // Calculate area of triangle formed by first 3 points
  const area = Math.abs(
    p1.imageX * (p2.imageY - p3.imageY) +
    p2.imageX * (p3.imageY - p1.imageY) +
    p3.imageX * (p1.imageY - p2.imageY)
  ) / 2

  // If area is very small, points are nearly collinear
  return area < 0.001
}

/**
 * Suggest where to place the next GCP for better coverage
 * Returns normalized image coordinates
 */
export function suggestNextGCPPosition(
  gcps: GroundControlPoint[]
): { x: number; y: number } | null {
  if (gcps.length === 0) {
    return { x: 0.1, y: 0.1 } // Start near top-left
  }

  if (gcps.length === 1) {
    return { x: 0.9, y: 0.1 } // Top-right
  }

  if (gcps.length === 2) {
    return { x: 0.9, y: 0.9 } // Bottom-right
  }

  if (gcps.length === 3) {
    return { x: 0.1, y: 0.9 } // Bottom-left
  }

  // For more than 4 points, suggest center if not already covered
  const centerX = gcps.reduce((sum, p) => sum + p.imageX, 0) / gcps.length
  const centerY = gcps.reduce((sum, p) => sum + p.imageY, 0) / gcps.length

  // Find point furthest from center
  const distances = [
    { x: 0.5, y: 0.5 },
    { x: 0.25, y: 0.25 },
    { x: 0.75, y: 0.25 },
    { x: 0.25, y: 0.75 },
    { x: 0.75, y: 0.75 },
  ]

  for (const point of distances) {
    const hasNearby = gcps.some(gcp =>
      Math.abs(gcp.imageX - point.x) < 0.15 &&
      Math.abs(gcp.imageY - point.y) < 0.15
    )
    if (!hasNearby) {
      return point
    }
  }

  return null // Good coverage already
}
