const generateSecurePassword = () => {
  const length = 12;
  if (length < 4) {
    throw new Error(
      "Password length must be at least 4 to include all required character types.",
    );
  }

  const specialChars = "!$*#";
  const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";

  // Ensure the password includes at least one of each required character type
  const requiredChars = [
    specialChars[Math.floor(Math.random() * specialChars.length)],
    uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)],
    lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
  ];

  // Fill the rest of the password with random characters from all sets
  const allChars = specialChars + uppercaseChars + lowercaseChars + numbers;
  while (requiredChars.length < length) {
    requiredChars.push(allChars[Math.floor(Math.random() * allChars.length)]);
  }

  // Shuffle the array to randomize character order
  for (let i = requiredChars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [requiredChars[i], requiredChars[j]] = [requiredChars[j], requiredChars[i]];
  }

  // Join the array into a string and return it
  const randomString = requiredChars.join("");
  const finalResult = `${randomString.slice(0, 4)}-${randomString.slice(4, 8)}-${randomString.slice(8, 12)}`;

  return finalResult;
};

export default generateSecurePassword;
