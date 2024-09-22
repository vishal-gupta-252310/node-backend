export const GetTrimmedData = (data) => {
  if (
    !IsStrictlyEqual(data, "") &&
    !IsStrictlyEqual(data, undefined) &&
    !IsStrictlyEqual(data, null) &&
    !IsStrictlyEqual(data, "undefined") &&
    !IsStrictlyEqual(data, "null") &&
    IsStrictlyEqual(typeof data, "string")
  ) {
    return data?.trim();
  }

  return data;
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
    !IsStrictlyEqual(trimmedValue, "") &&
    !IsStrictlyEqual(trimmedValue, undefined) &&
    !IsStrictlyEqual(trimmedValue, null) &&
    !IsStrictlyEqual(trimmedValue, "undefined") &&
    !IsStrictlyEqual(trimmedValue, "null")
  );
};

export const IsObject = (data) => {
  if (
    !IsStrictlyEqual(typeof data, "null") &&
    !IsStrictlyEqual(typeof data, "undefined") &&
    !IsStrictlyEqual(data, undefined) &&
    !IsStrictlyEqual(data, null) &&
    IsStrictlyEqual(typeof data, "object")
  ) {
    return true;
  }
  return false;
};

export const IsObjectHaveValues = (data) => {
  if (!IsObject(data)) return false;

  return Object.keys(data)?.length > 0;
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

export const GetObjectCopy = (data) => {
  if (!IsObject && !IsObjectHaveValues(data)) return {};

  return JSON.parse(JSON.stringify(data));
};
