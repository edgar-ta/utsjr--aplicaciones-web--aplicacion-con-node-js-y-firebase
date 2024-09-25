const Controller = require("./controller");
const EncryptedString = require("../lib/encrypted-string.js");
const Validator = require("../lib/validator");
const ProductConnection = require("./connection.js").products;
const Result = require("../lib/result.js");

/**
 * @typedef {string} Name
 * 
 * @typedef {{ name: Name, price: number, stock: number }} ProductController_Input
 * @typedef {{ name: Name, price: number, stock: number, id: string? }} ProductController_Internal
 * @typedef {{ name: Name, price: number, stock: number }} ProductController_Upload
 */

/**
 * @extends {Controller<ProductController_Input, ProductController_Internal, ProductController_Upload>}
 */
class ProductController extends Controller {
    static INSTANCE = new ProductController();

    static PRODUCT_SCHEMA = {
        name: new Validator()
            .required("El nombre debe estar presente")
            .maxLength(32, "El nombre debe tener una longitud de máximo 32 caracteres")
            .minLength(8, "El nombre debe tener mínimo 8 caracteres de longitud")
            .titleCase("El nombre debe estar capitalizado como título"),
        price: new Validator()
            .required("El precio debe estar presente")
            .isNumber("El precio debe ser un número")
            .isGreaterThanZero("El precio debe ser mayor a cero"),
        stock: new Validator()
            .required("El precio debe estar presente")
            .isNumber("El precio debe ser un número")
            .isGreaterThanZero("El precio debe ser mayor a cero")
    };

    get connection() {
        return ProductConnection;
    }

    /**
     * 
     * @param {ProductController_Input} record 
     * @returns {Result<string, ProductController_Internal>}
     */
    build(record) {
        const validation = Validator.validateObject(record, ProductController.PRODUCT_SCHEMA);
        if (validation.isError()) return validation;

        const id = record.id;
        
        return Result.ok({
            id,
            name: record.name,
            price: record.price,
            stock: record.stock,
        });
    }

    /**
     * 
     * @param {ProductController_Internal} record 
     * @returns {ProductController_Upload}
     */
    buildForUpload(record) {
        return {
            name: record.name,
            price: record.price,
            stock: record.stock,
        };
    }

    /**
     * 
     * @param {ProductController_Upload} record 
     * @param {string?} id 
     * @returns {Result<string, ProductController_Internal>}
     */
    buildFromUpload(record, id) {
        const validation = Validator.validateObject(record, ProductController.PRODUCT_SCHEMA);
        if (validation.isError()) return validation;

        return Result.ok({
            name: record.name,
            price: record.price,
            stock: record.stock,
            id,
        });
    }
}

module.exports = ProductController.INSTANCE;

