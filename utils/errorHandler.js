const errorHandler = (res, error) => {
  console.error(error);
  const status = error.status || 500;
  const message = error.message || "Ocurrio un error";
  return res.status(status).json({ message });
};

export default errorHandler;
