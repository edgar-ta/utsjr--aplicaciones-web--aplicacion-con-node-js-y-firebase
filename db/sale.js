const UserController = require("./user.js");
const ProductController = require("./product.js");
const Result = require("../lib/result.js");
const DateControlObject = require("../lib/date-control-object.js");
const PrettyId = require("../lib/pretty-id.js");

const Controller = require("./controller.js");
const Validator = require("../lib/validator");
const SalesConnection = require("./connection.js").sales;

/**
 * @typedef {"canceled" | "active" | "pending"} SaleState
 */


/**
 * @typedef {{ user: string, product: string, amountOfProduct: number }} SaleController_Input
 * @typedef {{ user: string, product: string, amountOfProduct: number, date: Date, state: SaleState }} SaleController_Internal_Incomplete
 * @typedef {{ user: string, product: string, amountOfProduct: number, date: Date, state: SaleState }} SaleController_Payload
 * @typedef {{ user: PrettyId.PrettyId, product: PrettyId.PrettyId, amountOfProduct: number, purchaseTime: DateControlObject.DateControlObject, state: SaleState, amountOfSale: number }} SaleController_Data
 */

/**
 * @typedef {SaleController_Internal_Incomplete & { id: string }} SaleController_Internal_Complete
 */

/**
 * @extends {Controller<SaleController_Input, SaleController_Internal_Incomplete, SaleController_Payload, SaleController_Data>}
 */
class SaleController extends Controller {
    static INSTANCE = new SaleController();

    static SALE_SCHEMA = {
        user: new Validator()
            .required("La id del usuario debe estar presente"),
        product: new Validator()
            .required("La id del producto debe estar presente"),
        amountOfProduct: new Validator()
            .required("La cantidad de producto debe estar presente")
            .isNumber("La cantidad de producto debe ser un número")
            .isGreaterThanZero("La cantidad de producto debe ser mayor a cero")
    };

    get instance() {
        return SaleController.INSTANCE;
    }

    get connection() {
        return SalesConnection;
    }

    /**
     * 
     * @param {string} user 
     * @param {string} product 
     * @returns {Promise<boolean>}
     */
    async validateUserAndProduct(user, product) {
        return Promise.all([
            UserController
                .find(user)
                .then(optional => optional.isSome()? Promise.resolve(true): Promise.reject("El usuario especificado no existe")),
            ProductController
                .find(product)
                .then(optional => optional.isSome()? Promise.resolve(true): Promise.reject("El producto especificado no existe")),
        ]);
    }

    /**
     * 
     * @param {SaleController_Input} record 
     * @returns {Promise<Result<string, SaleController_Internal_Incomplete>>}
     */
    async buildFromInput(record) {
        return Validator
            .validateObject(record, SaleController.SALE_SCHEMA)
            .asyncThen(async (value) => this.validateUserAndProduct(record.user, record.product).then(() => {
                const saleDate = new Date();
        
                /** @type {SaleState} */
                const saleState = "active";

                return {
                    user: record.user,
                    product: record.product,
                    amountOfProduct: record.amountOfProduct,
                    date: saleDate,
                    state: saleState
                };
            }))
        ;
    }

    /**
     * 
     * @param {SaleController_Payload} record 
     * @param {string} id 
     * @returns {Promise<Result<string, SaleController_Internal_Complete>>}
     */
    async buildFromPayload(record, id) {
        return Validator
            .validateObject(record, SaleController.SALE_SCHEMA)
            .asyncThen(async (value) => this.validateUserAndProduct(record.user, record.product).then(() => ({
                id,
                amountOfProduct: record.amountOfProduct,
                date: record.date,
                product: record.product,
                state: record.state,
                user: record.user
            })))
        ;
    }

    /**
     * 
     * @param {SaleController_Internal_Incomplete | SaleController_Internal_Complete} record 
     * @returns {SaleController_Payload}
     */
    convertToPayload(record) {
        return {
            amountOfProduct: record.amountOfProduct,
            date: record.date,
            product: record.product,
            state: record.state,
            user: record.user
        };
    }

    /**
     * 
     * @param {SaleController_Internal_Complete} record 
     * @returns {Promise<SaleController_Data>}
     */
    async convertToData(record) {
        return Promise
            .all([ UserController.find(record.user), ProductController.find(record.product) ])
            .then(([ optionalUser, optionalProduct ]) => {
                /** @type {import("./user.js").UserController_Internal_Complete} */
                const user = optionalUser.unwrap();

                /** @type {import("./product.js").ProductController_Internal_Complete} */
                const product = optionalProduct.unwrap();

                return {
                    amountOfProduct: record.amountOfProduct,
                    amountOfSale: record.amountOfProduct * product.price,
                    purchaseTime: DateControlObject.buildDateControlObject(record.date),
                    state: record.state,
                    user: PrettyId.buildPrettyId(user.id, user.name),
                    product: PrettyId.buildPrettyId(product.id, product.name)
                };
            });
    };

    async delete() {
        /** @type {SaleState} */
        const state = "canceled";

        return this.connection
            .doc(id)
            .update({
                state
            });
    }
}

module.exports = SaleController.INSTANCE;
