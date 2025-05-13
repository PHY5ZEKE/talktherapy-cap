export function validateBirthday(value: string) {
  const today = new Date();
  const birthDate = new Date(value);
  const age = today.getFullYear() - birthDate.getFullYear();
  const isFutureDate = birthDate > today;
  const isUnderOneYear = age < 1;

  if (isFutureDate) return "Birthday cannot be a future date";
  if (isUnderOneYear) return "Patient must be at least one year old";
  return true;
}

export function validatePassword(value: string) {
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d\S]{8,}$/;
  if (!regex.test(value))
    return "Must contain at least one uppercase letter, lowercase letter, number, and  a special character";
  return true;
}
