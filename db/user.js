const Controller = require("./controller");
const EncryptedString = require("../lib/encrypted-string.js");
const UserConnection = require("./connection.js").users;

/**
 * @typedef {string} Name
 * @typedef {string} Username
 * @typedef {string} Password
 * 
 * @typedef {{ name: Name, username: Username, password: Password }} UserController_Input
 * @typedef {{ name: Name, username: Username, password: EncryptedString, id: string? }} UserController_Internal
 * @typedef {{ name: Name, username: Username, salt: string, encryptedPassword: string }} UserController_Upload
 */

/**
 * @extends {Controller<UserController_Input, UserController_Internal, UserController_Upload>}
 */
class UserController extends Controller {
    static INSTANCE = new UserController();

    get connection() {
        return UserConnection;
    }

    /**
     * 
     * @param {UserController_Input} record 
     * @returns {Result<string, UserController_Internal>}
     */
    build(record) {
        record.name;
    }
}

module.exports = UserController.INSTANCE;

