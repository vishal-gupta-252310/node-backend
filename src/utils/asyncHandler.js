// const asyncHandler = (requestHandler) => {
//   (req, res, next) => {
//     Promise.resolve(requestHandler(req, res, next)).catch((error) => {
//       next(error);
//     });
//   };
// };
/**
 * To handle async functions in express
 */
const asyncHandler = (func) => async (req, res, next) => {
  try {
    await func(req, res, next);
  } catch (error) {
    res.send(error.code || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export { asyncHandler };

// async handler code example
// const asyncHandler = () => {};

// const asyncHandler = (functions) => {
//   () => {};
// };

// const asyncHandler = (func) => async () => {};
