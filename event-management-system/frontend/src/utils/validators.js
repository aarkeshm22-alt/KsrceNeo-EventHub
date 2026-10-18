export const validateKsrceEmail =
(email) => {
  return /^[a-zA-Z0-9._%+-]+@ksrce\.ac\.in$/.test(
    email
  );
};

export const validateMobile =
(mobile) => {
  return /^[0-9]{10}$/.test(
    mobile
  );
};

export const validatePassword =
(password) => {
  return /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,8}$/.test(
    password
  );
};