const admin = require("firebase-admin");

const Optional = require("../lib/optional.js");
const Result = require("../lib/result.js");


/**
 * @template InputType, InternalType, UploadType
 */
class Controller {
    /**
     * @typedef {UploadType & { id: string }} DownloadType
     */

    /**
     * @returns {admin.firestore.CollectionReference<admin.firestore.DocumentData, admin.firestore.DocumentData>}
     */
    get connection() {}

    /**
     * 
     * @param {InputType} record 
     * @returns {Result<string, InternalType>}
     */
    build(record) {}

    /**
     * 
     * @param {InternalType} record 
     * @returns {UploadType}
     */
    buildForUpload(record) {};

    /**
     * 
     * @param {UploadType} record 
     * @param {string?} id 
     * @returns {Result<string, InternalType>}
     */
    buildFromUpload(record, id) {};


    /**
     * @returns {Promise<InternalType[]>}
     */
    async getAll() {
        /** @type {UserController_Internal[]} */
        const results = [];
        const records = await this.connection.get();
        records.forEach(record => {
            const data = record.data();
            const buildResult = this.buildFromUpload(data, record.id);
            if (buildResult.isOk()) {
                results.push(buildResult.getRight());
            } else {
                console.debug("One of the records is invalid");
                console.debug("Record: ");
                console.debug(data);
                console.debug("Message: ");
                console.debug(buildResult.getLeft());
            }
        });
        return results;
    };

    /**
     * 
     * @param {InternalType} record 
     * @returns {Promise<boolean>}
     */
    async insert(record) {
        const uploadRecord = this.buildForUpload(record);

        return this.connection
            .add(uploadRecord)
            .then(() => true)
            .catch(() => false);
    };


    /**
     * 
     * @param {string} id 
     * @returns {Promise<Optional<DownloadType>>}
     */
    async find(id) {
        return this.connection
            .doc(id)
            .get()
            .then((record) => {
                const result = this.buildFromUpload(record.data(), record.id);
                
                if (result.isOk()) {
                    return Optional.some(result.getRight());
                }
                return Optional.empty();
            })
            .catch(() => Optional.empty())
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
            .then(() => "")
            .catch((reason) => reason)
            ;
    };
}

module.exports = Controller;
