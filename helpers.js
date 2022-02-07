const getUserByEmail = (email, users) => {
  for (const user in users) {
    if (users[user].email === email) {
      return user;
    }
  }
};

const generateRandomString = () => {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};


module.exports = { getUserByEmail, generateRandomString };