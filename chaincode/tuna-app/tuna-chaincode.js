const shim = require('fabric-shim');
const Chaincode = class {
    async Init(stub) {
        await stub.putState(key, Buffer.from(aStringValue));
        return shim.success(Buffer.from('Initialized Successfully!'));
    }
    async Invoke(stub) {
        let oldValue = await stub.getState(key);
        let newValue = oldValue + delta;
        await stub.putState(key, Buffer.from(newValue));
        return shim.success(Buffer.from(newValue.toString()));
    }
}
shim.start(new Chaincode());