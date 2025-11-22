import * as argon2 from "argon2";
import crypto from "crypto";

export const parseBounds = function (bounds: number[]): number[] {
  const [swLat, swLng, neLat, neLng] = bounds;

  const minLat = Math.min(swLat, neLat);
  const maxLat = Math.max(swLat, neLat);
  const minLng = Math.min(swLng, neLng);
  const maxLng = Math.max(swLng, neLng);

  return [minLat, maxLat, minLng, maxLng];
};

export const hashString = async function (str: string): Promise<string | null> {
  try {
    const hash = await argon2.hash(str);
    return hash;
  } catch (err) {
    return null;
  }
};

export const verifyHash = async function (
  originalString: string,
  newString: string
): Promise<boolean> {
  try {
    return await argon2.verify(originalString, newString);
  } catch (err) {
    return false;
  }
};

export const generateToken = function () {
  return crypto.randomBytes(32).toString("hex");
};
