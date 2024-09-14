const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((error) => {
      res.status(error.statusCode).json({
        message: error.message
      });
      next(error);
    });
  };
};
/**
 * To handle async functions in express
 * @param {func} func
 */
// const asyncHandler = (func) => async (req, res, next) => {
//   try {
//     await func(req, res, next);
//   } catch (error) {
//     if (!res.headersSent) {
//       // Ensure headers haven't been sent yet
//       res.status(error.code || 500).json({
//         success: false,
//         message: error.message
//       });
//     }
//     next(error); // Pass the error to the next middleware
//   }
// };

export { asyncHandler };

// async handler code example
// const asyncHandler = () => {};

// const asyncHandler = (functions) => {
//   () => {};
// };

// const asyncHandler = (func) => async () => {};
