const Controller = require("./controller");
const EncryptedString = require("../lib/encrypted-string.js");
const Validator = require("../lib/validator");
const UserConnection = require("./connection.js").users;
const Result = require("../lib/result.js");

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

    static USER_SCHEMA__PARTIAL = {
        name: new Validator()
            .required("El nombre debe estar presente")
            .maxLength(32, "El nombre debe tener una longitud de máximo 32 caracteres")
            .minLength(8, "El nombre debe tener mínimo 8 caracteres de longitud")
            .titleCase("El nombre debe estar capitalizado como título"),
        username: new Validator()
            .required("El nombre de usuario debe estar presente")
            .maxLength(32, "El nombre de usuario debe tener una longitud de máximo 32 caracteres")
            .minLength(8, "El nombre de usuario debe tener mínimo 8 caracteres de longitud")
            .onlyAlphabetics("El nombre de usuario solo puede tener caracteres del alfabeto inglés y guiones bajos")
    };

    static USER_SCHEMA__INPUT = (() => {
        return { 
            ...UserController.USER_SCHEMA__PARTIAL,
            password: new Validator()
                .required("La contraseña debe estar presente")
                .maxLength(16, "La contraseña debe tener una longitud de máximo 16 caracteres")
                .minLength(8, "La contraseña debe tener mínimo 8 caracteres de longitud")
                .hasDigits("La contraseña debe tener dígitos")
                .hasLowercase("La contraseña debe tener letras en minúscula")
                .hasUppercase("La contraseña debe tener letras en mayúscula")
        };
    })();

    static USER_SCHEMA__UPLOAD = (() => {
        return { 
            ...UserController.USER_SCHEMA__PARTIAL,
            encryptedPassword: new Validator()
                .required("La contraseña en su forma encriptada debe estar presente"),
            salt: new Validator()
                .required("El parámetro salt de la contraseña encriptada debe estar presente")
        };
    })();

    get connection() {
        return UserConnection;
    }

    /**
     * 
     * @param {UserController_Input} record 
     * @returns {Result<string, UserController_Internal>}
     */
    build(record) {
        const validation = Validator.validateObject(record, UserController.USER_SCHEMA__INPUT);
        if (validation.isError()) return validation;

        const password = EncryptedString.buildFromSource(record.password);
        const id = record.id;

        return Result.ok({
            name: record.name,
            username: record.username,
            password,
            id
        });
    }

    /**
     * 
     * @param {UserController_Internal} record 
     * @returns {UserController_Upload}
     */
    buildForUpload(record) {
        return {
            id: record.id,
            name: record.name,
            encryptedPassword: record.password.encryptedString,
            salt: record.password.salt,
            username: record.username
        };
    }

    /**
     * 
     * @param {UserController_Upload} record 
     * @param {string?} id 
     * @returns {Result<string, UserController_Internal>}
     */
    buildFromUpload(record, id) {
        const validation = Validator.validateObject(record, UserController.USER_SCHEMA__UPLOAD);
        if (validation.isError()) return validation;

        return Result.ok({
            name: record.name,
            id,
            username: record.username,
            password: EncryptedString.buildFromEncryption(record.salt, record.encryptedPassword)
        });
    }
}

module.exports = UserController.INSTANCE;

