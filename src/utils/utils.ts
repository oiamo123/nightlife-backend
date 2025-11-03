import Response from "express";

export const parseBounds = function (bounds: string): number[] {
  const [swLat, swLng, neLat, neLng] = bounds.split(",").map(Number);

  const minLat = Math.min(swLat, neLat);
  const maxLat = Math.max(swLat, neLat);
  const minLng = Math.min(swLng, neLng);
  const maxLng = Math.max(swLng, neLng);

  return [minLat, maxLat, minLng, maxLng];
};

export const parseCoords = function (coords: string): number[] {
  return coords.split(",").map(Number);
};

export const parseDate = function (dateString?: string): string {
  const date = dateString === undefined ? new Date() : new Date(dateString);
  return date.toISOString();
};

export const parseNumberArray = function (arrayString?: string[]): number[] {
  const array =
    arrayString === undefined ? [] : arrayString.map((s) => Number(s));
  return array;
};

export const success = ({
  res,
  data,
}: {
  res;
  data: Record<string, any>;
  statusCode?: number;
}) => {
  return res.status(200).json({
    success: true,
    data,
    status: 200,
  });
};

export const failure = ({
  res,
  validation = [],
  errors = [],
  statusCode = 400,
}: {
  res;
  validation?: string[];
  errors?: string[];
  statusCode?: number;
}) => {
  return res.status(statusCode).json({
    success: false,
    data: {
      validation,
      errors,
    },
    status: statusCode,
  });
};

export const error = ({
  res,
  message = "Internal server error",
}: {
  res;
  message?: string;
}) => {
  return res.status(500).json({
    success: false,
    data: {
      message,
    },
    status: 500,
  });
};
