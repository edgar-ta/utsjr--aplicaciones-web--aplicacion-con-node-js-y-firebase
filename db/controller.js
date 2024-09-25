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
     * @returns {Promise<InternalType[]>}
     */
    async getAll() {
        /** @type {UserController_Internal[]} */
        const results = [];
        const records = await this.connection.get();
        records.forEach(record => {
            const buildResult = this.build(record);
            if (buildResult.isOk()) {
                results.push(buildResult.getRight());
            } else {
                console.debug("One of the records is invalid");
                console.debug("Record: ");
                console.debug(record);
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
        const result = this.build(record);
        if (result.isError()) return Promise.resolve(false);

        const builtRecord = result.getRight();
        const uploadRecord = this.buildForUpload(builtRecord);

        return this.connection.doc()
            .set(uploadRecord)
            .then(() => true)
            .catch(() => false);
    };


    /**
     * 
     * @param {string} id 
     * @returns {Promise<Optional<DownloadType>>}
     */
    async find(id) {
        this.connection
            .doc(id)
            .get()
            .then((data) => {
                const result = this.build(data);
                if (result.isOk()) return Optional.some(result.getRight());
                return Optional.empty();
            })
            .catch(() => Optional.empty())
    }


    /**
     * 
     * @param {string} id 
     * @returns {Promise<boolean>}
     */
    async delete(id) {
        return this.connection
            .doc(id)
            .delete({ exists: true })
            .then(() => true)
            .catch(() => false)
            ;
    };
}

module.exports = Controller;
