export const GetTrimmedData = (text) => {
  return text?.trim();
};

export const IsStrictlyEqual = (a, b) => {
  return a === b;
};

export const HaveValue = (data) => {
  const trimmedValue = GetTrimmedData(data);
  if (
    IsStrictlyEqual(trimmedValue, "") ||
    IsStrictlyEqual(trimmedValue, undefined) ||
    IsStrictlyEqual(trimmedValue, null) ||
    IsStrictlyEqual(trimmedValue, "undefined") ||
    IsStrictlyEqual(trimmedValue, "null")
  ) {
    return false;
  }

  return true;
};

export const IsObject = (data) => {
  return IsStrictlyEqual(typeof data, "object");
};

export const IsObjectHaveValue = (data) => {
  if (!IsObject(data)) return false;

  const dataWithKeys = Object.keys(data);
  return dataWithKeys?.length > 0;
};
