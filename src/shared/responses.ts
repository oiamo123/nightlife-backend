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
  code,
  status = 500,
  message = "Internal server error",
}: {
  res;
  errors?: { field: string; message: string }[];
  code?: string;
  status?: number;
  message?: string;
}) => {
  return res.status(status).json({
    success: false,
    message,
    code,
    status,
    errors: errors,
  });
};
