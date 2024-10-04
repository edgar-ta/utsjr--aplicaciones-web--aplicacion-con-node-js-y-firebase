const admin = require("firebase-admin");

const Optional = require("../lib/optional.js");
const Result = require("../lib/result.js");


/**
 * 
 * 
 * @template InputType The collection of data that is entered/given by the user
 * @template InternalType_Incomplete The object that's used internally to handle most operations regarding the 
 * kind of entity of the controller
 * @template PayloadType The data that's retrieved from/stored in the database
 * @template DataType The type that's used to respond with in API calls requesting an entity 
 * (a "display" type)
 */
class Controller {
    /**
     * @typedef {InternalType_Incomplete & { id: string }} InternalType_Complete
     */

    static RESPONSE = {
        BAD_RESPONSE(response) { 
            return (reason) => response.json({ type: "Bad response", details: reason }) 
        },
        WRONG_INPUT(response) {
            return (message) => response.json({ type: "Wrong Input", details: message });
        }
    };

    /**
     * @returns {admin.firestore.CollectionReference<admin.firestore.DocumentData, admin.firestore.DocumentData>}
     */
    get connection() {};

    /**
     * @returns {Controller<InputType, InternalType_Incomplete, PayloadType, DataType>}
     */
    get instance() {};

    /**
     * Converts data inputted by the user in a functional/useful object within
     * the internal context of the application
     * @param {InputType} record 
     * @returns {Promise<Result<string, InternalType_Incomplete>>}
     */
    async buildFromInput(record) {}

    /**
     * 
     * @param {PayloadType} record 
     * @param {string} id 
     * @returns {Promise<Result<string, InternalType_Complete>>}
     */
    async buildFromPayload(record, id) {};

    /**
     * 
     * @param {InternalType_Incomplete | InternalType_Complete} record 
     * @returns {PayloadType}
     */
    convertToPayload(record) {};

    /**
     * 
     * @param {InternalType_Complete} record 
     * @returns {Promise<DataType>}
     */
    async convertToData(record) {};

    /**
     * Gets all entities in the database
     * 
     * It is important that this method returns an internal object, not a data one,
     * so that it can be used modularly with other parts of the app
     * 
     * @returns {Promise<InternalType_Complete[]>}
     */
    async getAll() {
        return this.connection.get()
            .then(records => Promise.all(records.map(async (record) => {
                const data = record.data();
                const buildResult = await this.buildFromPayload(data, record.id);
                return buildResult;
            })))
            .then(results => {
                results.forEach(result => {
                    if (result.isError()) {
                        const error = result.getLeft();

                        console.debug("One of the records is invalid");
                        console.debug("Record: ");
                        console.debug(data);
                        console.debug("Message: ");
                        console.debug(error);
                    }
                })
                return results
                    .filter(result => result.isOk())
                    .map(result => result.getRight());
            })
        ;
        
        // const records = await this.connection.get();
        // records.forEach(record => {
        //     const data = record.data();
        //     const buildResult = this.buildFromPayload(data, record.id);
        //     if (buildResult.isOk()) {
        //         const internalObject = buildResult.getRight();

        //         results.push(internalObject);
        //     } else {
        //         const error = buildResult.getLeft();

        //         console.debug("One of the records is invalid");
        //         console.debug("Record: ");
        //         console.debug(data);
        //         console.debug("Message: ");
        //         console.debug(error);
        //     }
        // });
        // return results;
    };

    /**
     * 
     * @param {InternalType_Incomplete} record 
     * @returns {Promise<string>}
     */
    async insert(record) {
        const uploadRecord = this.convertToPayload(record);

        return this.connection
            .add(uploadRecord)
            .then(() => "El registro se insertó de manera exitosa");
    };


    /**
     * Finds an entity with the given id.
     * 
     * It is important that this method returns an internal object, not a data one,
     * so that it can be used modularly with other parts of the app
     * @param {string} id 
     * @returns {Promise<Optional<InternalType_Complete>>}
     */
    async find(id) {
        return this.connection
            .doc(id)
            .get()
            .then((record) => {
                const result = this.buildFromPayload(record.data(), record.id);
                
                if (result.isOk()) {
                    return Optional.some(result.getRight());
                }
                return Optional.empty();
            })
    }


    /**
     * 
     * @param {string} id 
     * @returns {Promise<string>}
     */
    async delete(id) {
        return this.connection
            .doc(id)
            .delete({ exists: true })
            .then(() => "El registro se eliminó de manera exitosa")
            ;
    };

    get routes() {
        const router = require("express").Router();
        const ControllerClass = this.instance;
        
        router.get("/all", async (request, response) => {
            ControllerClass
                .getAll()
                .then(rawRecords => Promise.all(rawRecords.map(ControllerClass.convertToData)))
                .then(records => response.json(records))
                .catch((reason) => response.json({ type: "Bad response", details: reason }))
                ;
        });

        
        router.post("/new", async (request, response) => {
            const body = request.body;
            const result = ControllerClass.buildFromInput(body);
            if (result.isError()) {
                const message = result.getLeft();
                response.json({ type: "Wrong Input", details: message });
                return;
            }
        
            const data = result.getRight();
            ControllerClass
                .insert(data)
                .then(() => response.json({ type: "Success", details: "La información del registro se ingresó correctamente" }))
                .catch((reason) => response.json({ type: "Bad response", details: reason }))
                ;
        })
        
        router.get("/find/:id", async (request, response) => {
            const id = request.params.id;
            if (id === undefined || id === null || id === "") {
                response.json({ type: "Bad URL", details: "La URL debería incluir el parámetro 'id'" });
                return;
            }
        
            const user = await ControllerClass.find(id);
            if (user.isEmpty()) {
                response.json({ type: "Not found", details: "El registro con la id especificada no existe" })
            } else {
                const data = user.unwrap();
                const payload = await ControllerClass.convertToData(data);
        
                response.json(payload);
            }
        })
        
        router.delete("/delete/:id", async (request, response) => {
            const id = request.params.id;
            if (id === undefined || id === null || id === "") {
                response.json({ type: "Bad URL", details: "La URL debería incluir el parámetro 'id'" });
                return;
            }
            
            await ControllerClass
                .delete(id)
                .then(() => response.json({ type: "Success", details: "El registro especificado se eliminó correctamente" }))
                .catch((reason) => response.json({ type: "Bad response", details: reason }))
                ;
        });

        return router;
    }
}

module.exports = Controller;
