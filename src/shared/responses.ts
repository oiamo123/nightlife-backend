export const success = ({
  res,
  data,
}: {
  res;
  data: any[];
  statusCode?: number;
}) => {
  return res.status(200).json({
    success: true,
    data,
    status: 200,
  });
};

export const error = ({
  res,
  errors,
  message = "Internal server error",
  status = 500,
}: {
  res;
  errors?: { field: string; code: string }[];
  message?: string;
  status?: number;
}) => {
  return res.status(status).json({
    success: false,
    message,
    status,
    errors: errors,
  });
};
