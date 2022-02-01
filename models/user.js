const db = require("../util/database");

module.exports = class User {
  constructor(id, email, password, name) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.name = name;
  }

  save() {
    return db.execute(
      "INSERT INTO users (email, password, name) VALUES (?, ?, ?)",
      [this.email, this.password, this.name]
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

  static fetchAll() {
    return db.execute("SELECT * FROM users");
  }
};
