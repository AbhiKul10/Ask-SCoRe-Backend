const db = require("../util/database");

module.exports = class User {
  constructor(id, email, password, name, isVerified) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.name = name;
    this.isVerified = isVerified;
  }

  save() {
    return db.execute(
      "INSERT INTO users (email, password, name, isVerified) VALUES (?, ?, ?, ?)",
      [this.email, this.password, this.name, this.isVerified]
    );
  }

  static findByEmail(email) {
    return db.execute("SELECT * FROM users WHERE users.email = ?", [email]);
  }

  static updatePassword(password, email) {
    return db.execute("UPDATE users SET users.password=? WHERE users.email=?", [
      password,
      email,
    ]);
  }

  static verifyTheUser(isVerified, email) {
    return db.execute(
      "UPDATE users SET users.isVerified=? WHERE users.email=?",
      [isVerified, email]
    );
  }

  static fetchAll() {
    return db.execute("SELECT * FROM users");
  }
};
