export const GetTrimmedData = (data) => {
  if (!IsString(data)) return "";

  return data?.trim();
};

export const IsStrictlyEqual = (a, b) => {
  return a === b;
};

export const IsString = (data) => {
  return IsStrictlyEqual(typeof data, "string");
};

export const HaveValue = (data) => {
  const trimmedValue = GetTrimmedData(data);

  // Return false for empty strings, undefined, null, or their string representations
  return (
    trimmedValue !== "" &&
    trimmedValue !== undefined &&
    trimmedValue !== null &&
    trimmedValue !== "undefined" &&
    trimmedValue !== "null"
  );
};

export const IsObject = (data) => {
  return IsStrictlyEqual(typeof data, "object");
};

export const IsObjectHaveValue = (data) => {
  if (!HaveValue(data)) return false;

  if (!IsObject(data)) return false;

  const dataWithKeys = Object.keys(data);
  return dataWithKeys?.length > 0;
};

export const validateEmail = (email) => {
  // Regular expression to validate an email
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const IsEqual = (a, b) => {
  return a == b;
};

const GetConditionValue = (condition, truthyValue, falsyValue) => {
  return condition ? truthyValue : falsyValue;
};

export const IsTrue = (data, isReturnNumber = false) => {
  if (
    IsEqual(data, true) ||
    IsEqual(data, "true") ||
    IsEqual(data, 1) ||
    IsEqual(data, "1")
  ) {
    return GetConditionValue(isReturnNumber, 1, true);
  }

  return GetConditionValue(isReturnNumber, 0, false);
};

export const ArrayHaveValues = (list) => {
  if (!Array.isArray(list)) return false;

  list?.length > 0;
};

export const IsDefined = (data = {}, key = "") => {
  if (!IsObject(data) || !HaveValue(key)) return false;

  return data.hasOwnProperty(key);
};
