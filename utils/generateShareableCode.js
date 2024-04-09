const { nanoid } = require("nanoid");

const generateShareableCode = () => {
  const shareCode = nanoid(7);

  return shareCode;
};

module.exports = generateShareableCode;
